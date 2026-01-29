import React, { useState } from 'react';
import {
    Cloud, Sun, Music, MessageCircle, Crown, Star, Settings
} from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { generatePalChat } from '../../../services/llmService';
import ChatOverlay from './ChatOverlay';
import { GAME_CONTENT } from '../../../constants/gameContent';
import { getXpToNextLevel } from '../../../game-mechanics/LevelingSystem';

import StatsDisplay from './hud/StatsDisplay';
import ActionMenu from './hud/ActionMenu';

const CuteInterface = ({ palData, onExplore, wallet, onOpenSettings, onUpdateStats }) => {
    // --- STATE ---
    const { apiKey, uiText } = useGame();
    const [happiness, setHappiness] = useState(palData?.role?.stats?.happiness || 80);
    const [energy, setEnergy] = useState(palData?.role?.stats?.energy || 60);
    const [hunger, setHunger] = useState(palData?.role?.stats?.hunger || 50);
    const [isBouncing, setIsBouncing] = useState(false);

    // Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState([
        { role: 'model', text: palData?.role?.desc ? GAME_CONTENT.CHAT_DEFAULTS.MODEL_INTRO(palData.name) : GAME_CONTENT.CHAT_DEFAULTS.INITIAL_MSG }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const initialEmoji = palData?.role?.emoji ? Array.from(palData.role.emoji)[0] : "🐱";
    const [activeEmoji, setActiveEmoji] = useState(initialEmoji);

    const initialMessage = palData?.name ? GAME_CONTENT.CHAT_DEFAULTS.PAL_INTRO(palData.name) : GAME_CONTENT.CHAT_DEFAULTS.INITIAL_MSG;
    const [message, setMessage] = useState(initialMessage);

    const [bgGradient, setBgGradient] = useState("from-pink-100 to-purple-100");
    const [particles, setParticles] = useState([]);

    // XP Calc
    // Handle both 'role.stats' (Adventure) and 'stats' (Adoption) structures just in case
    const stats = palData?.role?.stats || palData?.stats || {};
    const level = stats.level || 1;
    const currentXp = stats.xp || 0;
    const nextLevelXp = getXpToNextLevel(level);
    const xpPercent = Math.min(100, Math.max(0, (currentXp / nextLevelXp) * 100));

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

    const addConfetti = (x, y) => {
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
    const handleAction = (type, e) => {
        const rect = e.target.getBoundingClientRect();
        addConfetti(rect.left + rect.width / 2, rect.top);
        triggerBounce();

        if (type === 'feed') {
            setActiveEmoji(GAME_CONTENT.FEEDBACK.FEED.EMOJI);
            setMessage(GAME_CONTENT.FEEDBACK.FEED.MSG);
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
    const handleSendMessage = async (text) => {
        const userMsg = { role: 'user', text };
        setChatHistory(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            const genre = "fantasy"; // Default context
            const response = await generatePalChat(
                apiKey,
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
            <div className="relative z-10 w-full max-w-sm h-screen md:h-[85vh] md:max-w-6xl md:aspect-[16/9] bg-white/60 backdrop-blur-xl md:rounded-[3rem] shadow-2xl md:border-8 border-white p-6 md:p-8 flex flex-col md:flex-row justify-between transition-all duration-500">

                {/* LEFT PANEL (VISUALS) */}
                <div className="flex-1 flex flex-col items-center justify-center relative md:w-5/12 order-2 md:order-1">
                    <div
                        className={`text-[150px] md:text-[220px] filter drop-shadow-xl cursor-pointer select-none transition-transform ${isBouncing ? 'animate-squish' : 'animate-float'}`}
                        onClick={(e) => handleAction('pet', e)}
                        role="button"
                        tabIndex="0"
                        aria-label="Pet your pal"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                if (e.key === ' ') e.preventDefault();
                                handleAction('pet', e);
                            }
                        }}
                    >
                        {activeEmoji}
                    </div>

                    <div className="mt-6 bg-white px-6 py-4 rounded-2xl rounded-tr-none shadow-sm border border-pink-50 max-w-[90%] animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                        <p className="text-center font-bold text-gray-600 leading-relaxed text-sm md:text-xl">
                            {message}
                        </p>
                        <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-pink-50 transform rotate-45"></div>
                    </div>
                </div>

                {/* RIGHT PANEL (CONTROLS) */}
                <div className="flex flex-col gap-6 md:w-6/12 order-1 md:order-2">


                    {/* HEADER */}
                    <header className="flex justify-between items-center px-1">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm">
                                <Crown size={20} className="text-yellow-400" />
                                <span className="text-base md:text-lg font-bold text-gray-600">{palData?.name || "Pal"}</span>
                                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">Lv. {level}</span>
                            </div>
                            {/* XP BAR */}
                            <div className="mt-1 mx-2 flex flex-col gap-0.5 w-full max-w-[140px]">
                                <div className="flex justify-between text-[10px] font-bold text-gray-500 px-1">
                                    <span>XP</span>
                                    <span>{currentXp}/{nextLevelXp}</span>
                                </div>
                                <div
                                    className="w-full bg-slate-200 border border-slate-300 h-2.5 rounded-full overflow-hidden"
                                    role="progressbar"
                                    aria-valuenow={currentXp}
                                    aria-valuemin="0"
                                    aria-valuemax={nextLevelXp}
                                    aria-label="Experience Progress"
                                >
                                    <div
                                        className="bg-gradient-to-r from-indigo-400 to-purple-400 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${xpPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full shadow-inner">
                                <Star size={18} className="text-yellow-500 fill-yellow-500" />
                                <span className="font-bold text-yellow-700">{wallet?.gold || 0}</span>
                            </div>
                            <button
                                onClick={onOpenSettings}
                                className="p-3 bg-white rounded-full text-gray-400 hover:text-indigo-500 transition-colors shadow-sm active:scale-95"
                                aria-label="Settings"
                            >
                                <Settings size={20} />
                            </button>
                            <button
                                className="p-3 bg-white rounded-full text-gray-400 hover:text-pink-500 transition-colors shadow-sm"
                                aria-label="Toggle Music"
                            >
                                <Music size={20} />
                            </button>
                        </div>
                    </header>

                    {/* STATS AREA */}
                    <StatsDisplay
                        happiness={happiness}
                        energy={energy}
                        hunger={hunger}
                        uiText={uiText}
                    />

                    {/* ACTION DECK (Grid) */}
                    <ActionMenu
                        onAction={handleAction}
                        onExplore={() => onExplore({ happiness, energy, hunger })}
                        uiText={uiText}
                    />
                </div>

            </div>

            {/* FLOATING FAB */}
            <button
                onClick={() => setIsChatOpen(true)}
                className="absolute bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 md:w-20 md:h-20 bg-gradient-to-tr from-pink-400 to-purple-400 rounded-full text-white shadow-lg flex items-center justify-center hover:scale-110 hover:rotate-12 transition-all z-50 animate-bounce"
                aria-label="Open Chat"
            >
                <MessageCircle size={28} className="md:w-10 md:h-10" />
            </button>

            {/* CHAT OVERLAY */}
            <ChatOverlay
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                palName={palData?.name || "Pal"}
                messages={chatHistory}
                onSendMessage={handleSendMessage}
                isTyping={isTyping}
            />
        </div>
    );
};

export default CuteInterface;
