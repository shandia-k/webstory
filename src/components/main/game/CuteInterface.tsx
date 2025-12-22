import React, { useState } from 'react';
import {
    Cloud, Sun, MessageCircle, Settings, Zap, Bug
} from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { generatePalChat } from '../../../services/llmService';
import ChatOverlay from './modals/ChatOverlay';
import { GAME_CONTENT } from '../../../constants/gameContent';
// @ts-ignore - LevelingSystem is TS now, explicit cache break
import { getXpToNextLevel } from '../../../game-mechanics/LevelingSystem.ts';

import StatsDisplay from './hud/StatsDisplay';
import ActionMenu from './hud/ActionMenu';
import MainMenu from './hud/MainMenu';
import { Pal, Wallet } from '../../../types/game';
import MissionSelector, { AdventureIntent } from './MissionSelector';
// @ts-ignore
import { getPalSkills } from '../../../game-mechanics/SkillRegistry';

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
}

interface Message {
    role: string;
    text: string;
}

interface CuteInterfaceProps {
    palData: Pal;
    onExplore: (stats: { happiness: number; energy: number; hunger: number }, intent: AdventureIntent) => void;
    wallet: Wallet;
    onOpenSettings: () => void;
    onUpdateStats?: (stats: { happiness: number; energy: number; hunger: number }) => void;
    onUpdateWallet?: (newWallet: Wallet) => void;
    onOpenShop?: () => void;
    onOpenInventory?: () => void;
    onOpenEvolution?: () => void;
    onOpenLog: () => void;
    onOpenDebug: () => void;
}

const CuteInterface: React.FC<CuteInterfaceProps> = ({ palData, onExplore, wallet, onOpenSettings, onUpdateStats, onUpdateWallet, onOpenShop, onOpenInventory, onOpenEvolution, onOpenLog, onOpenDebug }) => {
    // --- STATE ---
    const { apiKey, uiText } = useGame();
    // @ts-ignore
    const [happiness, setHappiness] = useState<number>(palData?.role?.stats?.happiness || 80);
    // @ts-ignore
    const [energy, setEnergy] = useState<number>(palData?.role?.stats?.energy || 60);
    // @ts-ignore
    const [hunger, setHunger] = useState<number>(palData?.role?.stats?.hunger || 50);
    const [isBouncing, setIsBouncing] = useState(false);

    const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);

    // Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState<Message[]>([
        { role: 'model', text: palData?.role?.desc ? GAME_CONTENT.CHAT_DEFAULTS.MODEL_INTRO(palData.name) : GAME_CONTENT.CHAT_DEFAULTS.INITIAL_MSG }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    // Mission Select State
    const [isMissionSelectOpen, setIsMissionSelectOpen] = useState(false);

    // @ts-ignore -- converting set/array to string
    const initialEmoji: string = palData?.role?.emoji ? (Array.from(palData.role.emoji)[0] as string) : "🐱";
    const [activeEmoji, setActiveEmoji] = useState(initialEmoji);

    // Sync Emoji when Pal evolves
    React.useEffect(() => {
        const newEmoji = palData?.role?.emoji ? (Array.from(palData.role.emoji)[0] as string) : "🐱";
        setActiveEmoji(newEmoji);
    }, [palData?.role?.emoji]);

    const initialMessage = palData?.name ? GAME_CONTENT.CHAT_DEFAULTS.PAL_INTRO(palData.name) : GAME_CONTENT.CHAT_DEFAULTS.INITIAL_MSG;
    const [message, setMessage] = useState(initialMessage);

    const [bgGradient, setBgGradient] = useState("from-pink-100 to-purple-100");
    const [particles, setParticles] = useState<Particle[]>([]);

    // XP Calc
    // Handle both 'role.stats' (Adventure) and 'stats' (Adoption) structures just in case
    // @ts-ignore
    const stats = palData?.role?.stats || palData?.stats || {};
    const level = stats.level || 1;
    const currentXp = stats.xp || 0;
    const nextLevelXp = getXpToNextLevel(level);
    const xpPercent = Math.min(100, Math.max(0, (currentXp / nextLevelXp) * 100));

    // Skill List
    const element = palData?.role?.element || palData?.element || 'neutral';
    const unlockedSkills = getPalSkills(element, level);

    // Combat Stats Scaling (Fallback to formula if stored stats are missing)
    const maxHp = stats.maxHp || (100 + (level * 10));
    const atk = stats.atk || (15 + (level * 2));
    const def = stats.def || (10 + (level * 1));

    // --- SYNC STATS TO GLOBAL STATE ---
    React.useEffect(() => {
        if (onUpdateStats) {
            onUpdateStats({ happiness, energy, hunger });
        }
    }, [happiness, energy, hunger]); // Auto-save trigger upon any change

    // --- ANIMATION TRIGGERS ---
    const triggerBounce = () => {
        setIsBouncing(true);
        setTimeout(() => setIsBouncing(false), 500);
    };

    const addConfetti = (x: number, y: number) => {
        const newParticles = Array.from({ length: 8 }).map((_, i) => ({
            id: Date.now() + i,
            x: x + (Math.random() - 0.5) * 50,
            y: y + (Math.random() - 0.5) * 50,
            color: ['#f472b6', '#34d399', '#fbbf24', '#60a5fa'][Math.floor(Math.random() * 4)],
            size: Math.random() * 8 + 4
        }));
        setParticles(prev => [...prev, ...newParticles]);
        setTimeout(() => setParticles(prev => prev.slice(8)), 1000);
    };

    // --- ACTIONS ---
    const handleAction = (type: string, e: any) => {
        const rect = e.target.getBoundingClientRect();
        addConfetti(rect.left + rect.width / 2, rect.top);
        triggerBounce();

        if (type === 'feed') {
            // [NEW] COST CHECK
            const FEED_COST = 10;
            if (wallet.gold < FEED_COST) {
                // Not enough money
                setActiveEmoji("💸");
                setMessage("You need 10 Gold to buy food!");
                return; // Abort
            }

            // Pay
            if (onUpdateWallet) {
                onUpdateWallet({ ...wallet, gold: wallet.gold - FEED_COST });
            }

            setActiveEmoji(GAME_CONTENT.FEEDBACK.FEED.EMOJI);
            setMessage("Yummy! (-10 Gold)");
            setHappiness(h => Math.min(100, h + 5));
            setHunger(h => Math.min(100, h + 20));
            setBgGradient("from-orange-100 to-yellow-100");
        }
        else if (type === 'play') {
            setActiveEmoji(GAME_CONTENT.FEEDBACK.PLAY.EMOJI);
            setMessage(GAME_CONTENT.FEEDBACK.PLAY.MSG);
            setEnergy(en => Math.max(0, en - 20));
            setHunger(h => Math.max(0, h - 10));
            setHappiness(h => Math.min(100, h + 15));
            setBgGradient("from-blue-100 to-green-100");
        }
        else if (type === 'sleep') {
            setActiveEmoji(GAME_CONTENT.FEEDBACK.SLEEP.EMOJI);
            setMessage(GAME_CONTENT.FEEDBACK.SLEEP.MSG);
            setEnergy(en => Math.min(100, en + 40));
            setHunger(h => Math.max(0, h - 5));
            setBgGradient("from-indigo-100 to-purple-100");
        }
        else if (type === 'pet') {
            setActiveEmoji(GAME_CONTENT.FEEDBACK.PET.EMOJI);
            setMessage(GAME_CONTENT.FEEDBACK.PET.MSG);
            setHappiness(h => Math.min(100, h + 5));
            setBgGradient("from-pink-100 to-rose-100");
        }

        setTimeout(() => setActiveEmoji(initialEmoji), 2000);
    };

    // --- CHAT LOGIC ---
    const handleSendMessage = async (text: string) => {
        const userMsg = { role: 'user', text };
        setChatHistory(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            const genre = "fantasy"; // Default context
            const response = await generatePalChat(
                apiKey,
                // @ts-ignore
                { ...palData, role: { ...palData.role, stats: { happiness, energy, hunger } } },
                text,
                chatHistory,
                genre
            );

            setChatHistory(prev => [...prev, { role: 'model', text: response.text }]);

            if (response.emoji) setActiveEmoji(response.emoji);
            setMessage(response.text);
            triggerBounce();

        } catch (e) {
            console.error("Chat Failed", e);
            setChatHistory(prev => [...prev, { role: 'model', text: GAME_CONTENT.CHAT_DEFAULTS.ERROR_MSG }]);
        } finally {
            setIsTyping(false);
            setTimeout(() => setActiveEmoji(initialEmoji), 3000);
        }
    };

    // --- CSS STYLES ---
    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&display=swap');
        .font-cute { font-family: 'Quicksand', sans-serif; }
        
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes squish { 
            0% { transform: scale(1, 1); } 
            40% { transform: scale(1.2, 0.8); } 
            60% { transform: scale(0.9, 1.1); } 
            100% { transform: scale(1, 1); } 
        }
        @keyframes pop { 0% { transform: scale(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
        
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-squish { animation: squish 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .particle { animation: pop 0.8s ease-out forwards; }
    `;

    return (
        <div className={`w-full h-screen bg-gradient-to-b ${bgGradient} transition-colors duration-1000 flex items-center justify-center font-cute text-gray-700 overflow-hidden relative`}>
            <style>{styles}</style>

            {/* BACKGROUND DECORATIONS */}
            <div className="absolute top-10 left-10 text-white/40 animate-float" style={{ animationDelay: '0s' }}><Cloud size={64} /></div>
            <div className="absolute top-20 right-10 text-white/40 animate-float" style={{ animationDelay: '1.5s' }}><Cloud size={48} /></div>
            <div className="absolute bottom-20 left-20 text-yellow-300/40 animate-spin-slow"><Sun size={80} /></div>

            {/* PARTICLES */}
            {particles.map(p => (
                <div
                    key={p.id}
                    className="particle absolute rounded-full"
                    style={{ left: p.x, top: p.y, width: p.size, height: p.size, backgroundColor: p.color }}
                />
            ))}

            {/* MAIN CARD */}
            <div className="relative z-10 w-full max-w-sm h-screen md:h-[85vh] md:max-w-6xl md:aspect-[16/9] bg-white/60 backdrop-blur-xl md:rounded-[3rem] shadow-2xl md:border-8 border-white p-4 md:p-8 flex flex-col md:flex-row md:justify-between transition-all duration-500 overflow-hidden">

                {/* LEFT PANEL (VISUALS) */}
                <div className="contents md:flex-[5] md:flex md:flex-col md:items-center md:justify-center relative md:w-5/12 md:order-1 pt-2 md:pt-0">
                    <div
                        className={`order-2 md:order-none mt-auto md:mt-0 self-center text-[110px] md:text-[220px] filter drop-shadow-xl cursor-pointer select-none transition-transform ${isBouncing ? 'animate-squish' : 'animate-float'}`}
                        onClick={(e) => handleAction('pet', e)}
                    >
                        {activeEmoji}
                    </div>

                    <div className="order-3 md:order-none self-center mt-2 md:mt-6 mb-6 md:mb-0 bg-white px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl rounded-tr-none md:rounded-tr-none shadow-sm border border-pink-50 max-w-[90%] animate-in fade-in slide-in-from-bottom-4 duration-500 relative group">
                        <p className="text-center font-bold text-gray-600 leading-relaxed text-xs md:text-xl px-2">
                            {message}
                        </p>
                        <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-pink-50 transform rotate-45"></div>

                        {/* CHAT BUTTON (Integrated) */}
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className="absolute -bottom-2 -right-2 w-7 h-7 md:w-8 md:h-8 bg-gradient-to-tr from-pink-400 to-purple-400 rounded-full text-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                            title="Chat with Pal"
                        >
                            <MessageCircle size={12} className="md:size-14" />
                        </button>
                    </div>
                </div>

                {/* RIGHT PANEL (CONTROLS) */}
                <div className="contents md:flex-[6] md:flex md:flex-col gap-1 md:gap-2 md:w-6/12 md:order-2 overflow-hidden pr-0 md:pr-1 no-scrollbar h-full justify-between pb-1">

                    {/* ... HEADER & STATS ... */}



                    {/* HEADER */}
                    <header className="order-1 md:order-none flex justify-between items-center px-1 mb-2 md:mb-0 w-full">

                        {/* LEFT: INFO GROUP (Name + Level + XP) */}
                        <div className="flex items-center gap-1.5 md:gap-3">
                            <div className="bg-white/80 backdrop-blur-sm px-2 md:px-4 py-1 md:py-2 rounded-xl md:rounded-2xl shadow-sm border border-white flex items-center gap-2 md:gap-3">
                                {/* Name */}
                                <div className="flex flex-col">
                                    <span className="hidden md:block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pal</span>
                                    <span className="text-[11px] md:text-sm font-black text-gray-700 truncate max-w-[60px] md:max-w-[150px]" title={palData?.name}>
                                        {palData?.name || "Pal"}
                                    </span>
                                </div>

                                {/* Divider */}
                                <div className="h-5 md:h-6 w-px bg-gray-200"></div>

                                {/* Level & XP */}
                                <div className="flex flex-col gap-0.5 w-[60px] md:w-[80px]">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] md:text-[10px] font-bold text-gray-400">LVL</span>
                                        <span className="text-[11px] md:text-xs font-black text-indigo-600">{level}</span>
                                    </div>
                                    {/* Slim XP Bar */}
                                    <div className="w-full h-1 md:h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
                                            style={{ width: `${xpPercent}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Evolve Button (Contextual) */}
                                {level >= 10 * ((stats.evolutionStage || 0) + 1) && (
                                    <button
                                        onClick={onOpenEvolution}
                                        className="ml-1 md:ml-2 w-6 h-6 md:w-7 md:h-7 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-md animate-pulse hover:scale-110"
                                        title="Ready to Evolve!"
                                    >
                                        <Zap size={12} className="md:size-[14px]" fill="currentColor" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: CONTROLS (Coin + Settings + Menu) */}
                        <div className="flex items-center gap-2 md:gap-3">

                            {/* Coins */}
                            <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-full border border-white/50">
                                <span className="text-xs font-bold text-yellow-600">{wallet?.gold || 0}</span>
                                <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-[10px] text-yellow-800 font-bold">$</div>
                            </div>

                            {/* Settings (Separate) */}
                            <button
                                onClick={onOpenSettings}
                                className="p-2 md:p-3 bg-white rounded-full text-gray-400 hover:text-indigo-500 transition-colors shadow-sm active:scale-95 border border-white"
                                title="Settings"
                            >
                                <Settings size={18} className="md:size-[20px]" />
                            </button>

                            {/* Main Menu (Clustered) */}
                            <MainMenu
                                isOpen={isMainMenuOpen}
                                onToggle={() => setIsMainMenuOpen(!isMainMenuOpen)}
                                onClose={() => setIsMainMenuOpen(false)}
                                onOpenInventory={onOpenInventory || (() => { })}
                                onOpenShop={onOpenShop || (() => { })}
                                onOpenLog={onOpenLog}
                            />
                        </div>
                    </header>

                    {/* VITALITY & SKILLS */}
                    <div className="order-4 md:order-none w-full mb-2 md:mb-0">
                        <StatsDisplay
                            happiness={happiness}
                            energy={energy}
                            hunger={hunger}
                            hp={stats.hp || stats.maxHp || 100} // Pass current HP
                            maxHp={maxHp}
                            atk={atk}
                            def={def}
                            skills={unlockedSkills}
                            uiText={uiText}
                        />
                    </div>

                    {/* SPACER (Desktop only) */}
                    <div className="hidden md:block flex-1"></div>

                    {/* ACTION DECK (Grid) */}
                    <div className="order-5 md:order-none w-full md:mt-auto">
                        <ActionMenu
                            onAction={handleAction}
                            onExplore={() => setIsMissionSelectOpen(true)}
                            uiText={uiText}
                        />
                    </div>
                </div>

            </div>

            {/* FLOATING FABs */}
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-[60]">
                {/* DEBUG FAB (Green Beetle) - MOVED LEFT */}
                <button
                    onClick={onOpenDebug}
                    className="w-10 h-10 md:w-12 md:h-12 bg-lime-500 hover:bg-lime-400 rounded-full text-white shadow-lg flex items-center justify-center hover:scale-110 hover:rotate-12 transition-all opacity-50 hover:opacity-100"
                    title="Debug Menu"
                >
                    <Bug size={20} />
                </button>
            </div>

            {/* CHAT OVERLAY */}
            <ChatOverlay
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                palName={palData?.name || "Pal"}
                messages={chatHistory}
                onSendMessage={handleSendMessage}
                isTyping={isTyping}
            />

            <MissionSelector
                isOpen={isMissionSelectOpen}
                onClose={() => setIsMissionSelectOpen(false)}
                onSelect={(intent) => {
                    setIsMissionSelectOpen(false);
                    onExplore({ happiness, energy, hunger }, intent);
                }}
            />
        </div>
    );
};

export default CuteInterface;
