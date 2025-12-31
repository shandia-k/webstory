import React, { useState, useEffect, useCallback } from 'react';
import { Skull, Zap } from 'lucide-react';
import { SaveLoadModal } from './game/SaveLoadModal';
import { ApiKeyModal } from './game/ApiKeyModal';
import { useGame } from '../../context/GameContext';
import AdoptionForm from './game/character-creation/AdoptionForm';
import CuteInterface from './game/CuteInterface';
import AdventureEngine from './game/AdventureEngine';
import { HubScreen } from './hub/HubScreen';
import RiggingStudio from './tools/RiggingStudio';
import { WORLD_THEMES } from '../../constants/worldThemes';
import { GAME_PHASES } from '../../constants/enums';

const OmniHub = () => {
    // --- GLOBAL STATE VIA CONTEXT ---
    const {
        phase, setPhase,
        selectedWorld, setSelectedWorld,
        adoptedPal, setAdoptedPal,
        wallet, setWallet,
        uiText,
        apiKey, setApiKey,
        language, setLanguage,
        saveGame, loadGame,
        notification
    } = useGame();

    const [isFullscreen, setIsFullscreen] = useState(false);

    // MODALS UI STATE
    const [isSaveLoadOpen, setIsSaveLoadOpen] = useState(false);
    const [isApiOpen, setIsApiOpen] = useState(false);

    const currentTheme = WORLD_THEMES[selectedWorld] || WORLD_THEMES['scifi'];

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // --- PHASE TRANSITIONS ---
    const handleExplore = useCallback((currentStats) => {
        // Sync stats before adventure
        if (adoptedPal) {
            setAdoptedPal(prev => ({
                ...prev,
                role: {
                    ...prev.role,
                    stats: { ...prev.role.stats, ...currentStats }
                }
            }));
        }
        setPhase(GAME_PHASES.ADVENTURE);
    }, [adoptedPal, setAdoptedPal, setPhase]);

    const handleReturnFromAdventure = useCallback((results) => {
        // Results: { hp, loot }
        // Update stats and inventory
        setAdoptedPal(prev => ({
            ...prev,
            role: {
                ...prev.role,
                stats: {
                    ...prev.role.stats,
                    // If results.stats exists (New System), use it. 
                    // Fallback to legacy single-stat update if not.
                    ...(results.stats || { energy: results.hp })
                }
            }
        }));

        // Add Loot to Wallet
        if (results.loot) {
            setWallet(prev => ({ ...prev, gold: prev.gold + results.loot }));
        }

        setPhase(GAME_PHASES.GAME);
    }, [setAdoptedPal, setWallet, setPhase]);

    // Memoize callbacks passed to CuteInterface
    const handleOpenSettings = useCallback(() => setIsSaveLoadOpen(true), []);
    const handleOpenApi = useCallback(() => setIsApiOpen(true), []);
    const handleNewGame = useCallback(() => setPhase(GAME_PHASES.ADOPTION), [setPhase]);
    const handleResumeGame = useCallback(() => setPhase(GAME_PHASES.GAME), [setPhase]);
    const handleOpenRigging = useCallback(() => setPhase(GAME_PHASES.RIGGING), [setPhase]);
    const handleExitToMenu = useCallback(() => {
        setPhase(GAME_PHASES.HUB);
        setIsSaveLoadOpen(false);
    }, [setPhase]);

    const handleUpdateStats = useCallback((newStats) => {
        setAdoptedPal(prev => ({
            ...prev,
            role: {
                ...prev.role,
                stats: { ...prev.role.stats, ...newStats }
            }
        }));
    }, [setAdoptedPal]);

    return (
        <div className={`w-full h-screen bg-gradient-to-b ${currentTheme.colors} transition-colors duration-700 font-cute flex flex-col items-center justify-center relative overflow-hidden text-white`}>

            {/* MODALS */}
            <SaveLoadModal
                isOpen={isSaveLoadOpen}
                onClose={() => setIsSaveLoadOpen(false)}
                onSaveGame={saveGame}
                onLoadGame={loadGame}
                onExitToMenu={handleExitToMenu}
            />

            <ApiKeyModal
                isOpen={isApiOpen}
                onClose={() => setIsApiOpen(false)}
                onSave={(key, lang) => {
                    setApiKey(key);
                    setLanguage(lang);
                }}
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

            {/* --- MAIN CONTENT LAYER --- */}
            <div className="relative z-10 w-full h-full flex justify-center items-center">

                {/* PHASE: HUB */}
                {phase === GAME_PHASES.HUB && (
                    <HubScreen
                        selectedWorld={selectedWorld}
                        setSelectedWorld={setSelectedWorld}
                        hasSavedGame={!!adoptedPal}
                        palData={adoptedPal} // Passed for Element display
                        onNewGame={handleNewGame}
                        onResumeGame={handleResumeGame}
                        onOpenApi={handleOpenApi}
                        onOpenSaveLoad={handleOpenSettings}
                        isFullscreen={isFullscreen}
                        toggleFullscreen={toggleFullscreen}
                        onOpenRigging={handleOpenRigging}
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
                            onExplore={handleExplore}
                            onOpenSettings={handleOpenSettings}
                            onUpdateStats={handleUpdateStats}
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
    );
};

export default OmniHub;
