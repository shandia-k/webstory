import React, { useState, useEffect } from 'react';
import { Skull, Zap } from 'lucide-react';
import { SaveLoadModal } from './game/modals/SaveLoadModal';
import { ShopModal } from './game/modals/ShopModal';
import { InventoryModal } from './game/modals/InventoryModal';
import { EvolutionModal } from './game/modals/EvolutionModal';
import { DebugMenu } from '../debug/DebugMenu';
import { ApiKeyModal } from './game/modals/ApiKeyModal';
import { useGame } from '../../context/GameContext';
import AdoptionForm from './game/character-creation/AdoptionForm';
import CuteInterface from './game/CuteInterface';
import AdventureEngine from './game/AdventureEngine';
import { HubScreen } from './hub/HubScreen';
import { WORLD_THEMES } from '../../constants/worldThemes';
import { GAME_PHASES } from '../../constants/enums';
import MissionLog from './game/MissionLog';
import RiggingStudio from './tools/RiggingStudio';
import IntroCutscene from './intro/IntroCutscene';
import { evolvePal, getPotentialEvolution } from '../../game-mechanics/EvolutionManager';
import { calculateArchetype } from '../../game-mechanics/PersonalitySystem';
import { useVisualDirector } from '../../hooks/useVisualDirector';

import { AssetProvider } from '../../context/AssetContext';

// ... imports

const OmniHub: React.FC = () => {
    // --- GLOBAL STATE VIA CONTEXT ---
    const {
        phase, setPhase,
        selectedWorld, setSelectedWorld,
        adoptedPal, setAdoptedPal,
        wallet, setWallet,
        inventory, setInventory,
        uiText,
        setApiKey,
        setLanguage,
        saveGame, loadGame, resetGameState,
        notification
    } = useGame();

    const [isSaveLoadOpen, setIsSaveLoadOpen] = useState(false);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [isEvolutionOpen, setIsEvolutionOpen] = useState(false);
    const [isDebugOpen, setIsDebugOpen] = useState(false);
    const [isApiOpen, setIsApiOpen] = useState(false);
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [adventureIntent, setAdventureIntent] = useState<string>('scavenge');

    // AI VISUAL DIRECTOR
    const visualContext = `The player is currently in the ${phase} phase of a ${selectedWorld} themed game. Background: ${selectedWorld}.`;
    useVisualDirector(visualContext);

    // @ts-ignore
    const currentTheme = WORLD_THEMES[selectedWorld] || WORLD_THEMES['scifi'];

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // --- INTRO CUTSCENE STATE ---
    const [showIntro, setShowIntro] = useState(() => {
        const hasPlayed = localStorage.getItem('played_intro');
        return hasPlayed !== 'true';
    });

    const handleIntroComplete = () => {
        setShowIntro(false);
        localStorage.setItem('played_intro', 'true');
    };

    // --- PHASE TRANSITIONS ---
    const handleExplore = (currentStats: { happiness: number; energy: number; hunger: number }, intent: string = 'scavenge') => {
        setAdventureIntent(intent);
        // Sync stats before adventure
        if (adoptedPal) {
            setAdoptedPal(prev => ({
                ...prev!,
                role: {
                    ...prev!.role!,
                    stats: { ...prev!.role!.stats, ...currentStats }
                }
            }));
        }
        setPhase(GAME_PHASES.ADVENTURE);
    };

    const handleReturnFromAdventure = (results: { stats: any; loot: number }) => {
        // Results: { stats, loot }
        // Update stats and inventory
        setAdoptedPal(prev => ({
            ...prev!,
            role: {
                ...prev!.role!,
                stats: {
                    xp: prev!.role?.stats?.xp || 0,
                    level: prev!.role?.stats?.level || 1,
                    maxHp: prev!.role?.stats?.maxHp || 100,
                    hp: prev!.role?.stats?.hp || prev!.role?.stats?.maxHp || 100,
                    atk: prev!.role?.stats?.atk || 17, // Base Level 1 is 17
                    def: prev!.role?.stats?.def || 11,  // Base Level 1 is 11
                    // Fallback to legacy single-stat update if not.
                    ...(results.stats || { energy: results.stats?.energy })
                }
            }
        }));

        // Add Loot to Wallet
        if (results.loot) {
            setWallet(prev => ({ ...prev, gold: prev.gold + results.loot }));
        }

        setPhase(GAME_PHASES.GAME);
    };

    // --- UI STATE ---
    const [isFullscreen, setIsFullscreen] = useState(false);

    return (
        <AssetProvider>
            <div className={`w-full h-screen bg-gradient-to-b ${currentTheme.colors} transition-colors duration-700 font-cute flex flex-col items-center justify-center relative overflow-hidden text-white`}>

                {/* MODALS */}
                <SaveLoadModal
                    isOpen={isSaveLoadOpen}
                    onClose={() => setIsSaveLoadOpen(false)}
                    onSaveGame={saveGame}
                    onLoadGame={loadGame}
                    onExitToMenu={() => {
                        setPhase(GAME_PHASES.HUB);
                        setIsSaveLoadOpen(false);
                    }}
                />

                <ShopModal
                    isOpen={isShopOpen}
                    onClose={() => setIsShopOpen(false)}
                    wallet={wallet}
                    onUpdateWallet={setWallet}
                    inventory={inventory}
                    onUpdateInventory={setInventory}
                />

                {/* INVENTORY MODAL */}
                {adoptedPal && (
                    <InventoryModal
                        isOpen={isInventoryOpen}
                        onClose={() => setIsInventoryOpen(false)}
                        inventory={inventory}
                        onUpdateInventory={setInventory}
                        palData={adoptedPal}
                        onUpdatePal={setAdoptedPal}
                    />
                )}

                {/* EVOLUTION MODAL */}
                {adoptedPal && (
                    <EvolutionModal
                        isOpen={isEvolutionOpen}
                        onClose={() => setIsEvolutionOpen(false)}
                        palData={adoptedPal}
                        onEvolve={(newData) => {
                            setAdoptedPal(prev => {
                                if (!prev) return null;

                                // [NEW] Use EvolutionManager to apply correct stats
                                // 1. Re-calculate branch to be safe (or pass from modal?)
                                // Passing it from modal via newData would be cleaner but newData right now is just {name, emoji, desc}.
                                // Let's re-calculate to ensure security/consistency.
                                // @ts-ignore
                                const bond = prev.role?.stats?.bond || 0;
                                // @ts-ignore
                                const discipline = prev.role?.stats?.discipline || 0;
                                const archetype = calculateArchetype(bond, discipline).archetype;
                                const branch = getPotentialEvolution(archetype);

                                return evolvePal(prev, branch);
                            });
                            setIsEvolutionOpen(false);
                        }}
                    />
                )}

                <DebugMenu
                    isOpen={isDebugOpen}
                    onClose={() => setIsDebugOpen(false)}
                    wallet={wallet}
                    onUpdateWallet={setWallet}
                    palData={adoptedPal}
                    onUpdatePal={setAdoptedPal}
                    inventory={inventory}
                    onUpdateInventory={setInventory}
                />

                <ApiKeyModal
                    isOpen={isApiOpen}
                    onClose={() => setIsApiOpen(false)}
                    onSave={(key: string, lang: string) => {
                        setApiKey(key);
                        setLanguage(lang);
                    }}
                    onOpenDebug={() => setIsDebugOpen(true)}
                />

                <MissionLog
                    isOpen={isLogOpen}
                    onClose={() => setIsLogOpen(false)}
                    // @ts-ignore
                    campaign={useGame().campaign}
                />

                {/* NOTIFICATION TOAST */}
                {notification && (
                    <div className={`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 ${notification.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                        <div className="bg-white/20 p-1 rounded-full">
                            {notification.type === 'error' ? <Skull size={18} /> : <Zap size={18} />}
                        </div>
                        <span className="font-bold">{notification.message}</span>
                    </div>
                )}

                {/* BACKGROUND PATTERN */}
                <div className="absolute inset-0 opacity-30 pointer-events-none transition-all duration-700"
                    style={{ backgroundImage: currentTheme.bgPattern, backgroundSize: currentTheme.bgSize }}>
                </div>

                {/* --- CORE LAYER: INTRO CUTSCENE --- */}
                {showIntro && (
                    <IntroCutscene onComplete={handleIntroComplete} />
                )}

                {/* --- MAIN CONTENT LAYER --- */}
                <div className={`relative z-10 w-full h-full flex justify-center items-center transition-opacity duration-1000 ${showIntro ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

                    {/* PHASE: HUB */}
                    {phase === GAME_PHASES.HUB && (
                        <HubScreen
                            selectedWorld={selectedWorld}
                            setSelectedWorld={setSelectedWorld}
                            hasSavedGame={!!adoptedPal}
                            palData={adoptedPal} // Passed for Element display
                            onNewGame={() => {
                                resetGameState();
                                setPhase(GAME_PHASES.ADOPTION);
                            }}
                            onResumeGame={() => setPhase(GAME_PHASES.GAME)}
                            onOpenApi={() => setIsApiOpen(true)}
                            onOpenSaveLoad={() => setIsSaveLoadOpen(true)}
                            isFullscreen={isFullscreen}
                            toggleFullscreen={toggleFullscreen}
                            onOpenRigging={() => setPhase(GAME_PHASES.RIGGING)}
                        />
                    )}

                    {/* PHASE: ADOPTION FORM --- */}
                    {phase === GAME_PHASES.ADOPTION && (
                        <div className="absolute inset-0 z-50 animate-in fade-in duration-500">
                            <AdoptionForm
                                onComplete={(data) => {
                                    setAdoptedPal(data);
                                    setPhase(GAME_PHASES.GAME);
                                }}
                                genre={currentTheme.title} // Pass genre context
                                onBack={() => setPhase(GAME_PHASES.HUB)}
                            />
                        </div>
                    )}

                    {/* --- PHASE: GAME INTERFACE --- */}
                    {phase === GAME_PHASES.GAME && adoptedPal && (
                        <div className="absolute inset-0 z-50 animate-in fade-in duration-500">
                            <CuteInterface
                                palData={adoptedPal}
                                wallet={wallet}
                                onUpdateWallet={setWallet}
                                onExplore={handleExplore}
                                onOpenSettings={() => setIsSaveLoadOpen(true)}
                                onOpenShop={() => setIsShopOpen(true)}
                                onOpenInventory={() => setIsInventoryOpen(true)}
                                onOpenEvolution={() => setIsEvolutionOpen(true)}
                                onUpdateStats={(newStats) => {
                                    setAdoptedPal(prev => ({
                                        ...prev!,
                                        role: {
                                            ...prev!.role!,
                                            stats: { ...prev!.role!.stats, ...newStats }
                                        }
                                    }));
                                }}
                                onOpenLog={() => setIsLogOpen(true)}
                                onOpenDebug={() => setIsDebugOpen(true)}
                                genre={selectedWorld}
                            />
                        </div>
                    )}

                    {/* --- PHASE: ADVENTURE --- */}
                    {phase === GAME_PHASES.ADVENTURE && adoptedPal && (
                        <div className="absolute inset-0 z-50 animate-in fade-in duration-500">
                            <AdventureEngine
                                palData={adoptedPal}
                                onReturn={handleReturnFromAdventure}
                                genre={selectedWorld}
                                intent={adventureIntent}
                                inventory={inventory}
                                onUpdateInventory={setInventory}
                            />
                        </div>
                    )}

                    {/* --- PHASE: RIGGING STUDIO --- */}
                    {phase === GAME_PHASES.RIGGING && (
                        <div className="absolute inset-0 z-[60] animate-in fade-in duration-300">
                            <RiggingStudio
                                onBack={() => setPhase(GAME_PHASES.HUB)}
                                uiText={uiText}
                            />
                        </div>
                    )}

                </div>
            </div>
        </AssetProvider>
    );
};

export default OmniHub;
