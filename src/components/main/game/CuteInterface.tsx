import React, { useState, useEffect, useRef } from 'react';
import {
    Cloud, Sun, MessageCircle, Settings, Zap, Bug,
    Coins, Gem, Backpack, Utensils, Moon, Gamepad2, Map, X
} from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { generatePalChat } from '../../../services/llmService';
import ChatOverlay from './modals/ChatOverlay';
import { GAME_CONTENT } from '../../../constants/gameContent';
import { getXpToNextLevel } from '../../../game-mechanics/LevelingSystem.ts';
import StatsDisplay from './hud/StatsDisplay';
import ActionMenu from './hud/ActionMenu';
import MainMenu from './hud/MainMenu';
import { Pal, Wallet } from '../../../types/game';
import MissionSelector, { AdventureIntent } from './MissionSelector';
import { getPalSkills } from '../../../game-mechanics/SkillRegistry';
import { calculateArchetype, getArchetypeColor } from '../../../game-mechanics/PersonalitySystem';
import { useAtmosphere } from '../../../hooks/useAtmosphere';
import AdventureEngine from './AdventureEngine';
import { GAME_CONFIG } from '../../../config/constants';

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
}

interface Message {
    role: 'user' | 'model';
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
    genre: string;
}

const CuteInterface: React.FC<CuteInterfaceProps> = ({ palData, onExplore, wallet, onOpenSettings, onUpdateStats, onUpdateWallet, onOpenShop, onOpenInventory, onOpenEvolution, onOpenLog, onOpenDebug, genre }) => {
    // --- STATE ---
    const { apiKey, uiText } = useGame();
    const palElement = palData?.role?.element || palData?.element || 'neutral';
    const atmosphere = useAtmosphere(palElement);

    const [happiness, setHappiness] = useState<number>(palData?.role?.stats?.happiness || 80);
    const [energy, setEnergy] = useState<number>(palData?.role?.stats?.energy || 60);
    const [hunger, setHunger] = useState<number>(palData?.role?.stats?.hunger || 50);
    const [bond, setBond] = useState<number>(palData?.role?.stats?.bond || 0);
    const [discipline, setDiscipline] = useState<number>(palData?.role?.stats?.discipline || 0);

    const personality = calculateArchetype(bond, discipline);

    const [isBouncing, setIsBouncing] = useState(false);

    const [interactionState, setInteractionState] = useState<'IDLE' | 'ANTICIPATE' | 'ACTING' | 'COOLDOWN'>('IDLE');
    const [lastAction, setLastAction] = useState<{ type: string; time: number }>({ type: '', time: Date.now() });
    const [consecutiveSpam, setConsecutiveSpam] = useState(0);

    const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState<Message[]>([
        { role: 'model', text: palData?.role?.desc ? GAME_CONTENT.CHAT_DEFAULTS.MODEL_INTRO(palData.name) : GAME_CONTENT.CHAT_DEFAULTS.INITIAL_MSG }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const [isMissionSelectOpen, setIsMissionSelectOpen] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const [showAdventure, setShowAdventure] = useState(false);
    const [inventory, setInventory] = useState<any[]>(GAME_CONFIG.INITIAL_INVENTORY || []);

    const handleAdventureReturn = (results: { stats: any; loot: number }) => {
        if (results.stats) {
            setHappiness(prev => Math.min(100, prev + (results.stats.happiness || 0)));
            setEnergy(prev => Math.max(0, prev + (results.stats.energy || 0)));
            setHunger(prev => Math.min(100, prev + (results.stats.hunger || 0)));
        }
        setShowAdventure(false);
        setMessage(`Back from adventure! Found ${results.loot} gold!`);
        setIsBouncing(true);
        setTimeout(() => setIsBouncing(false), 500);
    };

    const [message, setMessage] = useState<string | null>(null);
    const [activeEmoji, setActiveEmoji] = useState(palData?.role?.emoji ? Array.from(palData.role.emoji)[0] : "🐣");
    const [initialEmoji] = useState(palData?.role?.emoji ? Array.from(palData.role.emoji)[0] : "🐣");
    const [isBusy, setIsBusy] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);

    const palRef = useRef<HTMLDivElement>(null);
    const trackerRef = useRef<HTMLDivElement>(null);

    const level = palData?.role?.stats?.level || 1;
    const currentXp = palData?.role?.stats?.xp || 0;
    const nextLevelXp = getXpToNextLevel(level);
    const xpPercent = Math.min(100, (currentXp / nextLevelXp) * 100);

    const element = palData?.role?.element || "Neutral";
    const maxHp = 100 + (level * 10);
    const atk = 10 + Math.floor(bond / 10);
    const def = 10 + Math.floor(discipline / 10);
    const unlockedSkills = getPalSkills(element, level);

    // [HABITAT] Movement State
    const [bgOffset, setBgOffset] = useState(0);
    const [walkDirection, setWalkDirection] = useState(1); // 1 = Right, -1 = Left
    const [isWalking, setIsWalking] = useState(false);
    // [UI] Toggle Stats
    const [showStats, setShowStats] = useState(false);

    // Smooth scrolling loop
    useEffect(() => {
        let animationFrameId: number;
        const animate = () => {
            if (isWalking) {
                setBgOffset(prev => prev + (walkDirection * 2)); // Speed = 2px/frame
            }
            animationFrameId = requestAnimationFrame(animate);
        };
        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isWalking, walkDirection]);

    // --- SYNC STATS TO GLOBAL STATE ---
    React.useEffect(() => {
        if (onUpdateStats) {
            // @ts-ignore
            onUpdateStats({ happiness, energy, hunger, bond, discipline });
        }
    }, [happiness, energy, hunger, bond, discipline]);

    // [NEW] IDLE BARKS SYSTEM
    React.useEffect(() => {
        const IDLE_THRESHOLD = 8000;
        const idleCheck = setInterval(() => {
            const timeSinceLast = Date.now() - lastAction.time;
            if (timeSinceLast > IDLE_THRESHOLD && interactionState === 'IDLE' && !isChatOpen && !isMainMenuOpen) {
                let thought = "...";
                if (hunger > 80) thought = ["Hungry...", "Food?", "Tummy rumble..."][Math.floor(Math.random() * 3)];
                else if (energy < 20) thought = ["So sleepy...", "Nap time?", "Zzz..."][Math.floor(Math.random() * 3)];
                else if (happiness > 80) thought = ["So happy!", "Best day!", "La la la~"][Math.floor(Math.random() * 3)];
                else if (bond > 50) thought = ["<3", "My friend!", "You're nice."][Math.floor(Math.random() * 3)];
                else thought = ["Boop?", "Hum...", "What's that?"][Math.floor(Math.random() * 3)];
                if (Math.random() > 0.5) setMessage(thought);
            }
        }, 4000);
        return () => clearInterval(idleCheck);
    }, [lastAction, interactionState, isChatOpen, isMainMenuOpen, hunger, energy, happiness, bond]);

    // --- ANIMATION TRIGGERS ---
    const triggerBounce = () => {
        setIsBouncing(true);
        setTimeout(() => setIsBouncing(false), 500);
    };

    const addConfetti = (x: number, y: number) => {
        const newParticles = Array.from({ length: 10 }).map(() => ({
            id: Math.random(),
            x,
            y,
            color: ['#FFD700', '#FF69B4', '#00BFFF', '#7CFC00'][Math.floor(Math.random() * 4)],
            size: Math.random() * 8 + 4
        }));
        setParticles(prev => [...prev, ...newParticles]);
        setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.includes(p))), 1000);
    };

    // --- ACTIONS ---
    const handleAction = (type: string, e: any) => {
        if (isBusy) return;
        resetIdleTimer();
        const rect = e.currentTarget.getBoundingClientRect();
        const now = Date.now();
        let spamCount = type === lastAction.type && (now - lastAction.time) < 1000 ? consecutiveSpam + 1 : 0;
        setConsecutiveSpam(spamCount);
        setLastAction({ type, time: now });
        performActionLogic(type, rect, spamCount);
    };

    const performActionLogic = (type: string, rect: any, spamCount: number) => {
        setIsBusy(true);
        setInteractionState('ACTING');
        const x = rect.left + rect.width / 2;
        const y = rect.top;
        if (spamCount > 3) {
            setMessage("Hey, slow down! bit dizzy...");
            setActiveEmoji("😵");
            setTimeout(() => {
                setActiveEmoji(initialEmoji);
                setIsBusy(false);
                setInteractionState('IDLE');
            }, 2000);
            return;
        }
        switch (type) {
            case 'FEED':
                setActiveEmoji("😋");
                setMessage(uiText.CUTE_UI.MESSAGES.FEED);
                setHunger(prev => Math.max(0, prev - 15));
                setHappiness(prev => Math.min(100, prev + 5));
                addConfetti(x, y);
                break;
            case 'PLAY':
                setActiveEmoji("🎮");
                setMessage(uiText.CUTE_UI.MESSAGES.PLAY);
                setEnergy(prev => Math.max(0, prev - 10));
                setHappiness(prev => Math.min(100, prev + 15));
                setIsBouncing(true);
                break;
            case 'SLEEP':
                setActiveEmoji("😴");
                setMessage(uiText.CUTE_UI.MESSAGES.SLEEP);
                setEnergy(prev => Math.min(100, prev + 30));
                setHunger(prev => Math.min(100, prev + 10));
                break;
            case 'CHAT':
                setActiveEmoji("💬");
                setMessage(null);
                setIsChatOpen(true);
                setIsBusy(false);
                setInteractionState('IDLE');
                return;
            case 'ADVENTURE':
                setIsMissionSelectOpen(true);
                setIsBusy(false);
                setInteractionState('IDLE');
                return;
            default:
                setActiveEmoji("✨");
        }
        setTimeout(() => {
            setActiveEmoji(initialEmoji);
            setIsBusy(false);
            setInteractionState('IDLE');
            if (type !== 'CHAT') setMessage(null);
            setIsBouncing(false);
        }, 1500);
    };

    // --- CHAT LOGIC ---
    const handleSendMessage = async (text: string) => {
        const userMsg: Message = { role: 'user', text };
        setChatHistory(prev => [...prev, userMsg]);
        setIsTyping(true);
        try {
            const response = await generatePalChat(apiKey, palData, text, chatHistory, genre);
            const modelMsg: Message = { role: 'model', text: response.text };
            setChatHistory(prev => [...prev, modelMsg]);
            setMessage(response.text);
            if (response.emoji) setActiveEmoji(response.emoji);
        } catch (error) {
            const errorMsg: Message = { role: 'model', text: "I'm a bit tired of talking right now... *yawn*" };
            setChatHistory(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    // [JUICY] 1. CURSOR TRACKING (Look at mouse)
    const handleGlobalMove = (e: React.MouseEvent) => {
        if (!trackerRef.current) return;
        const rect = trackerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const distance = Math.min(15, Math.hypot(e.clientX - centerX, e.clientY - centerY) / 20);
        const moveX = Math.cos(angle) * distance;
        const moveY = Math.sin(angle) * distance;
        trackerRef.current.style.transform = `translate(${moveX}px, ${moveY}px) scaleX(${walkDirection})`;
    };

    // [JUICY] 2. RUB-TO-PET MECHANIC
    const handleRubStart = (e: React.MouseEvent) => {
        if (interactionState !== 'IDLE') return;
        setInteractionState('ANTICIPATE');
    };

    const handleRubMove = (e: React.MouseEvent) => {
        if (interactionState !== 'ANTICIPATE') return;
        if (Math.random() > 0.92) {
            setHappiness(prev => Math.min(100, prev + 1));
            setBond(prev => prev + 0.1);
            addConfetti(e.clientX, e.clientY);
            if (Math.random() > 0.8) {
                setActiveEmoji("😊");
                setTimeout(() => interactionState === 'ANTICIPATE' && setActiveEmoji(initialEmoji), 1000);
            }
        }
    };

    const handleRubEnd = (e: React.MouseEvent) => {
        if (interactionState === 'ANTICIPATE') {
            setInteractionState('IDLE');
        }
    };

    // Reset Idle Timer on Interaction
    const resetIdleTimer = () => {
        setLastAction(prev => ({ ...prev, time: Date.now() }));
        if (message && message.length < 30) setMessage(null);
    };

    // Random Walking/Activity
    useEffect(() => {
        const interval = setInterval(() => {
            if (interactionState === 'IDLE' && !isBusy && !isWalking && Math.random() < 0.2) {
                checkIdle();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [interactionState, isBusy, isWalking]);

    const checkIdle = () => {
        const duration = 2000 + Math.random() * 3000;
        const direction = Math.random() > 0.5 ? 1 : -1;
        setWalkDirection(direction);
        setIsWalking(true);
        setTimeout(() => setIsWalking(false), duration);
    };

    // --- VISUAL RENDER HELPERS ---
    const getIdleBubble = () => {
        if (interactionState !== 'IDLE' || isBusy || isWalking) return null;
        let content = "💤";
        let anim = "animate-bounce";
        if (energy > 80 && happiness > 80) {
            content = "🎵";
            anim = "animate-pulse";
        } else if (hunger > 70) {
            content = "🍎";
            anim = "animate-bounce";
        } else if (bond < 20) {
            content = "❓";
            anim = "animate-bounce";
        }
        return (
            <div className={`absolute -top-12 right-0 paper-card bg-theme-panel border-2 border-theme-border w-12 h-12 flex items-center justify-center text-xl shadow-paper z-20 ${anim} transition-all duration-500`}>
                {content}
                <div className="absolute -bottom-1 left-2 w-3 h-3 bg-theme-panel border-b-2 border-r-2 border-theme-border rotate-45 transform"></div>
            </div>
        );
    };

    const styles = `
        @keyframes rain {
            from { background-position: 0px 0px; }
            to { background-position: 10px 100px; }
        }
        .parallax-layer {
            position: absolute;
            width: 200%;
            height: 100%;
            pointer-events: none;
            will-change: transform;
        }
        .animate-walk {
            animation: walk 0.6s ease-in-out infinite alternate;
        }
        @keyframes walk {
            from { transform: translateY(0) rotate(-5deg); }
            to { transform: translateY(-10px) rotate(5deg); }
        }
        .animate-spin-slow {
            animation: spin 20s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;

    // --- RENDER ---
    return (
        <div
            className="w-full h-screen font-cute overflow-hidden relative select-none"
            onMouseMove={(e) => { handleGlobalMove(e); resetIdleTimer(); }}
            onClick={resetIdleTimer}
        >
            <style>{styles}</style>

            {/* 1. LAYER: SKY */}
            <div className={`absolute inset-0 z-0 bg-gradient-to-b transition-colors duration-1000 ${atmosphere.bgGradient}`} />

            {/* 2. LAYER: CELESTIAL BODIES */}
            <div className="absolute top-10 right-10 pointer-events-none transition-all duration-1000 transform z-0">
                {atmosphere.timePhase === 'NIGHT' || atmosphere.timePhase === 'DUSK' ? (
                    <div className="text-yellow-100 text-[100px] opacity-80 drop-shadow-[0_0_20px_rgba(255,255,200,0.5)]">🌙</div>
                ) : (
                    <div className="text-yellow-300 text-[120px] opacity-80 animate-spin-slow drop-shadow-[0_0_30px_rgba(255,200,0,0.5)]">☀️</div>
                )}
            </div>

            {/* 3. LAYER: CLOUDS (Parallax Slow: 0.1x) */}
            <div
                className="parallax-layer z-0 opacity-40 top-0 h-[30%]"
                style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, white 5%, transparent 20%), radial-gradient(circle at 70% 40%, white 8%, transparent 25%)',
                    backgroundSize: '600px 100%',
                    backgroundPositionX: `${-bgOffset * 0.1}px`,
                    backgroundRepeat: 'repeat-x'
                }}
            />

            {/* 4. LAYER: HILLS (Parallax Mid: 0.5x) */}
            <div
                className="parallax-layer z-1 flex items-end opacity-30 bottom-[20%] h-[40%]"
                style={{
                    backgroundImage: 'radial-gradient(ellipse at 50% 100%, #064e3b 0%, transparent 70%)',
                    backgroundSize: '800px 100%',
                    backgroundPositionX: `${-bgOffset * 0.5}px`,
                    backgroundRepeat: 'repeat-x'
                }}
            />

            {/* 5. LAYER: GROUND */}
            <div
                className="parallax-layer z-2 bottom-0 h-[35%]"
                style={{
                    background: `linear-gradient(to bottom, #86efac 0%, #22c55e 100%)`,
                    backgroundPositionX: `${-bgOffset}px`,
                    filter: atmosphere.timePhase === 'NIGHT' ? 'brightness(0.4) hue-rotate(20deg)' : 'none'
                }}
            >
                <div className="absolute -top-6 left-0 right-0 h-8 w-full" style={{
                    background: `radial-gradient(circle at 12px 14px, #86efac 6px, transparent 7px)`,
                    backgroundSize: '24px 24px',
                    backgroundPositionX: `${-bgOffset}px`
                }} />
            </div>

            {/* ATMOSPHERE OVERLAY */}
            {atmosphere.overlay === 'rain' && (
                <div className="absolute inset-0 pointer-events-none z-10 opacity-40 mix-blend-screen"
                    style={{
                        backgroundImage: `linear-gradient(to bottom, transparent, rgba(255,255,255,0.4))`,
                        backgroundSize: '2px 40px',
                        animation: 'rain 0.5s linear infinite'
                    }}
                />
            )}

            {/* FLAVOR TEXT */}
            <div className="absolute top-4 left-0 right-0 text-center pointer-events-none z-40">
                <p className="inline-block px-4 py-1 paper-card bg-theme-panel text-theme-text text-xs font-bold tracking-widest uppercase shadow-paper border-2 border-theme-border">
                    {atmosphere.flavorText}
                </p>
            </div>

            {/* HEADER */}
            <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start z-50 pointer-events-none">
                <div className="pointer-events-auto flex flex-col gap-2 cursor-pointer" onClick={() => setShowStats(!showStats)}>
                    <div className="flex items-center gap-3 paper-card bg-theme-panel p-2 rounded-2xl shadow-paper border-2 border-theme-border pr-4">
                        {/* Tape Accent */}
                        <div className="tape-top !w-12 !h-4" />

                        <div className="w-10 h-10 md:w-12 md:h-12 bg-theme-main rounded-xl flex items-center justify-center text-xl border-2 border-theme-border shadow-inner">
                            <span className="font-black text-theme-accent">{level}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-theme-text uppercase tracking-wide">{palData.name}</span>
                            <div className="flex items-center gap-1.5 opacity-70">
                                <span className="text-[10px] font-bold text-theme-muted">{element}</span>
                                <div className="w-16 h-1.5 bg-theme-main rounded-full overflow-hidden">
                                    <div className="h-full bg-theme-accent" style={{ width: `${xpPercent}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pointer-events-auto flex flex-col items-end gap-2">
                    <div className="paper-card bg-theme-panel px-4 py-2 shadow-paper border-2 border-theme-border flex gap-4">
                        <div className="text-center">
                            <div className="text-[8px] text-theme-accent font-bold uppercase"><Coins size={10} className="inline mr-1" />Gold</div>
                            <div className="font-black text-theme-text">{wallet.gold}</div>
                        </div>
                        <div className="text-center border-l border-theme-border pl-4">
                            <div className="text-[8px] text-theme-accent font-bold uppercase"><Gem size={10} className="inline mr-1" />Gems</div>
                            <div className="font-black text-theme-text">{wallet.gems}</div>
                        </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <button onClick={onOpenSettings} className="w-10 h-10 bg-theme-panel rounded-xl flex items-center justify-center border-2 border-theme-border shadow-paper hover:bg-theme-main transition-all active:translate-y-0.5 active:shadow-none"><Settings size={20} className="text-theme-text" /></button>
                        <MainMenu isOpen={isMainMenuOpen} onToggle={() => setIsMainMenuOpen(!isMainMenuOpen)} onClose={() => setIsMainMenuOpen(false)} onOpenInventory={() => setShowInventory(true)} onOpenShop={onOpenShop || (() => setMessage("Shop closed..."))} onOpenLog={onOpenLog} />
                    </div>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="absolute inset-0 flex justify-center z-20 pointer-events-none">
                <div className="absolute bottom-[20%] flex flex-col items-center pointer-events-auto">
                    {message && (
                        <div className="absolute -top-40 max-w-[200px] z-20 animate-in zoom-in slide-in-from-bottom-4 duration-300">
                            <div className="paper-card bg-theme-panel px-4 py-3 rounded-2xl shadow-paper border-2 border-theme-border text-center relative">
                                <p className="text-sm font-bold text-theme-text">{message}</p>
                                <div className="absolute -bottom-2 left-4 w-4 h-4 bg-theme-panel border-b-2 border-r-2 border-theme-border rotate-45 transform"></div>
                            </div>
                        </div>
                    )}

                    <div ref={trackerRef} className="transition-transform duration-100 ease-out" style={{ transform: `scaleX(${walkDirection})` }}>
                        <div ref={palRef} className={`text-[180px] md:text-[250px] leading-none transition-transform sticker-border ${isBouncing ? 'animate-squish' : ''} ${isWalking ? 'animate-walk' : 'animate-float-paper'}`} onMouseDown={handleRubStart} onMouseUp={handleRubEnd} onMouseLeave={handleRubEnd} onMouseMove={handleRubMove}>
                            {isBusy || activeEmoji !== initialEmoji ? activeEmoji : (
                                <>
                                    {palData?.role?.emoji ? Array.from(palData.role.emoji)[0] : "🐣"}
                                    {getIdleBubble()}
                                </>
                            )}
                        </div>
                    </div>
                    <div className={`w-32 h-6 bg-black/20 rounded-[100%] blur-md transition-all ${isWalking || isBouncing ? 'scale-75 opacity-50' : 'scale-100 opacity-80'}`} />
                </div>

                {/* ACTION HUD */}
                <div className="absolute bottom-8 w-full max-w-lg mx-auto p-4 z-50 pointer-events-auto flex flex-col gap-4">
                    {showStats && (
                        <div className="animate-in slide-in-from-bottom-5 fade-in duration-300">
                            <StatsDisplay happiness={happiness} energy={energy} hunger={hunger} hp={maxHp} maxHp={maxHp} atk={atk} def={def} skills={unlockedSkills} bond={bond} discipline={discipline} uiText={uiText} />
                        </div>
                    )}
                    <ActionMenu onAction={handleAction} onExplore={() => energy >= 20 ? setShowAdventure(true) : setMessage("Too tired!")} uiText={uiText} />
                </div>
            </div>

            {/* MODALS */}
            {showInventory && (
                <div className="absolute inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative max-h-[80vh] overflow-y-auto">
                        <button onClick={() => setShowInventory(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full"><X size={20} /></button>
                        <h2 className="text-2xl font-black mb-4 flex items-center gap-2"><Backpack className="text-blue-500" /> {uiText.CUTE_UI.INVENTORY.TITLE}</h2>
                        {inventory.length === 0 ? <div className="text-center py-10 text-gray-400 font-bold">{uiText.CUTE_UI.INVENTORY.EMPTY}</div> : (
                            <div className="grid grid-cols-3 gap-3">
                                {inventory.map((item, idx) => (
                                    <div key={idx} className="bg-gray-50 border-2 border-gray-100 p-3 rounded-2xl flex flex-col items-center text-center">
                                        <div className="text-4xl mb-2">{item.icon}</div>
                                        <div className="font-bold text-gray-700 text-sm">{item.name}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showAdventure && (
                <div className="absolute inset-0 z-[100] bg-black">
                    <AdventureEngine palData={palData} onReturn={handleAdventureReturn} genre={genre || 'fantasy'} intent="scavenge" inventory={inventory} onUpdateInventory={setInventory} />
                </div>
            )}

            {isChatOpen && (
                <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} palName={palData?.name || "Pal"} messages={chatHistory} onSendMessage={handleSendMessage} isTyping={isTyping} />
            )}

            {isMissionSelectOpen && (
                <MissionSelector isOpen={isMissionSelectOpen} onClose={() => setIsMissionSelectOpen(false)} onSelect={(intent) => { setIsMissionSelectOpen(false); onExplore({ happiness, energy, hunger }, intent); }} />
            )}

            {/* EFFECTS */}
            {particles.map(p => (
                <div key={p.id} className="absolute rounded-full pointer-events-none" style={{ left: p.x, top: p.y, width: p.size, height: p.size, backgroundColor: p.color, zIndex: 1000 }} />
            ))}

            <div className="absolute bottom-6 left-6 z-[60]">
                <button onClick={onOpenDebug} className="w-10 h-10 bg-lime-500 rounded-full text-white shadow-lg flex items-center justify-center hover:scale-110 opacity-50 hover:opacity-100"><Bug size={20} /></button>
            </div>
        </div>
    );
};

export default CuteInterface;
