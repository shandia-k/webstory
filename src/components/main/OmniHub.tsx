import React, { useState, useEffect } from 'react';
import { Skull, Zap } from 'lucide-react';
// Legacy Components (Keep imports until converted)
// @ts-ignore
import { SaveLoadModal } from './game/SaveLoadModal';
// @ts-ignore
import { ApiKeyModal } from './game/ApiKeyModal';
// @ts-ignore
import AdoptionForm from './game/character-creation/AdoptionForm';
// @ts-ignore
import CuteInterface from './game/CuteInterface';
// @ts-ignore
import AdventureEngine from './game/AdventureEngine';
// @ts-ignore
import { HubScreen } from './hub/HubScreen';
// @ts-ignore
import RiggingStudio from './tools/RiggingStudio';

import { WORLD_THEMES } from '../../constants/worldThemes'; // Still JS
import { GAME_PHASES } from '../../constants/enums';

// NEW: Store
import { useGameStore, GameStore } from '../../store/useGameStore';
import { Phase } from '../../types';

const OmniHub: React.FC = () => {
    // --- GLOBAL STATE VIA ZUSTAND ---
    const {
        phase, setPhase,
        world, setWorld,
        player, createPlayer,
        updateStats, updateWallet
        // TODO: Save/Load logic needs to be ported to store actions
    } = useGameStore();

    // Local UI State (Modals)
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSaveLoadOpen, setIsSaveLoadOpen] = useState(false);
    const [isApiOpen, setIsApiOpen] = useState(false);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    // MOCK: Legacy text support until full migration
    const uiText = { UI: {} }; // Placeholder

    const currentTheme = WORLD_THEMES[world] || WORLD_THEMES['scifi'];

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

    // --- PHASE TRANSITIONS ---
    const handleExplore = (currentStats: any) => {
        // In new system, stats are already in store, but legacy Adventure might pass them back.
        // We sync them just in case.
        if (currentStats) {
             updateStats(currentStats);
        }
        setPhase('adventure');
    };

    const handleReturnFromAdventure = (results: { hp: number; loot?: number; stats?: any }) => {
        // Update Stats
        if (results.stats) {
            updateStats(results.stats);
        } else {
            // Legacy fallback
             updateStats({ hp: results.hp });
        }

        // Add Loot
        if (results.loot) {
            updateWallet(results.loot, 0);
        }

        setPhase('game');
    };

    const handleAdoptionComplete = (data: any) => {
<<<<<<< HEAD
        // Data from AdoptionForm (Legacy format):
        // { name, role: { stats: {...}, trait: ... }, items: [] }

=======
        // Data from AdoptionForm (Legacy format):
        // { name, role: { stats: {...}, trait: ... }, items: [] }

>>>>>>> origin/main
        // Map to New Store Structure
        createPlayer(data.name, data.role.trait || 'brave', {
            hp: 100, maxHp: 100,
            energy: 100, maxEnergy: 100,
            happiness: 100,
            level: 1, xp: 0, maxXp: 100,
            attack: 10, defense: 5
        });

        setPhase('game');
    };

    return (
        <div className={`w-full h-screen bg-gradient-to-b ${currentTheme.colors} transition-colors duration-700 font-cute flex flex-col items-center justify-center relative overflow-hidden text-white`}>

            {/* MODALS */}
            <SaveLoadModal
                isOpen={isSaveLoadOpen}
                onClose={() => setIsSaveLoadOpen(false)}
                onSaveGame={() => console.log("Save implemented via Store persist")}
                onLoadGame={() => console.log("Load implemented via Store persist")}
                onExitToMenu={() => {
                    setPhase('hub');
                    setIsSaveLoadOpen(false);
                }}
            />

            <ApiKeyModal
                isOpen={isApiOpen}
                onClose={() => setIsApiOpen(false)}
                onSave={(key: string, lang: string) => {
                   localStorage.setItem('nexus_api_key', key);
                   // Store doesn't handle API key yet, keep in LocalStorage or add to GameSlice
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
                {phase === 'hub' && (
                    <HubScreen
                        selectedWorld={world}
                        setSelectedWorld={setWorld}
                        hasSavedGame={!!player}
                        palData={player ? { name: player.name, role: { stats: player.stats } } : null} // Adapt for Legacy Prop
                        onNewGame={() => setPhase('adoption')}
                        onResumeGame={() => setPhase('game')}
                        onOpenApi={() => setIsApiOpen(true)}
                        onOpenSaveLoad={() => setIsSaveLoadOpen(true)}
                        isFullscreen={isFullscreen}
                        toggleFullscreen={toggleFullscreen}
                        onOpenRigging={() => setPhase('rigging')}
                    />
                )}

                {/* PHASE: ADOPTION FORM --- */}
                {phase === 'adoption' && (
                    <div className="absolute inset-0 z-50 animate-in fade-in duration-500">
                        <AdoptionForm
                            onComplete={handleAdoptionComplete}
                            genre={currentTheme.title}
                            onBack={() => setPhase('hub')}
                        />
                    </div>
                )}

                {/* --- PHASE: GAME INTERFACE --- */}
                {phase === 'game' && player && (
                    <div className="absolute inset-0 z-50 animate-in fade-in duration-500">
                        <CuteInterface
<<<<<<< HEAD
                            // Adapt Store Data to Legacy Props if needed,
                            // OR ideally CuteInterface should use store directly (next step)
                            palData={{
                                name: player.name,
                                role: { stats: player.stats }
=======
                            // Adapt Store Data to Legacy Props if needed,
                            // OR ideally CuteInterface should use store directly (next step)
                            palData={{
                                name: player.name,
                                role: { stats: player.stats }
>>>>>>> origin/main
                            }}
                            wallet={player.wallet}
                            onExplore={handleExplore}
                            onOpenSettings={() => setIsSaveLoadOpen(true)}
                            onUpdateStats={updateStats}
                        />
                    </div>
                )}

                {/* --- PHASE: ADVENTURE --- */}
                {phase === 'adventure' && player && (
                    <div className="absolute inset-0 z-50 animate-in fade-in duration-500">
                        <AdventureEngine
<<<<<<< HEAD
                            palData={{
                                name: player.name,
                                role: { stats: player.stats }
=======
                            palData={{
                                name: player.name,
                                role: { stats: player.stats }
>>>>>>> origin/main
                            }}
                            onReturn={handleReturnFromAdventure}
                            genre={world}
                        />
                    </div>
                )}

                {/* --- PHASE: RIGGING STUDIO --- */}
                {phase === 'rigging' && (
                    <div className="absolute inset-0 z-[60] animate-in fade-in duration-300">
                        <RiggingStudio
                            onBack={() => setPhase('hub')}
                            uiText={uiText}
                        />
                    </div>
                )}

            </div>
        </div>
    );
};

export default OmniHub;
