import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { ApiKeyModal } from './ApiKeyModal';
import { useGame } from '../../../context/GameContext';
import { ConfirmationModal } from '../../common/ConfirmationModal';
import { GenreHeader } from './GenreHeader';
import { ActiveGameStatus } from './ActiveGameStatus';
import { GenreList } from './GenreList';

export function GenreSelection({ onSelect, onContinue }) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectionStep, setSelectionStep] = useState('mode'); // 'mode' | 'theme'
    const [selectedMode, setSelectedMode] = useState(null);
    const [pendingSelection, setPendingSelection] = useState(null); // For confirmation dialog

    const { setApiKey, setLanguage, history, gameOver, uiText, setSetupData } = useGame();

    const hasActiveGame = history && history.length > 0 && !gameOver;

    // --- STEP 1: SELECT MODE ---
    const handleModeSelect = (modeId) => {
        setSelectedMode(modeId);
        setSelectionStep('theme');
    };

    // --- STEP 2: SELECT THEME (Finalize) ---
    const handleThemeSelect = (themeId) => {
        if (hasActiveGame) {
            setPendingSelection({ mode: selectedMode, theme: themeId });
        } else {
            finalizeSelection(selectedMode, themeId);
        }
    };

    const finalizeSelection = (mode, theme) => {
        // Clear cached setup data to force new generation
        if (setSetupData) setSetupData(null);
        onSelect(mode, theme);
    };

    const confirmNewGame = () => {
        if (pendingSelection) {
            finalizeSelection(pendingSelection.mode, pendingSelection.theme);
            setPendingSelection(null);
        }
    };

    const handleBack = () => {
        setSelectionStep('mode');
        setSelectedMode(null);
    };

    const modes = [
        { id: 'rpg', label: 'RPG ADVENTURE', icon: '🐉', desc: 'Immersive experience with Stats, Inventory, and Maps.', color: 'from-amber-700 to-orange-900' },
        { id: 'chatbot', label: 'STORY MODE', icon: '💬', desc: 'Pure narrative focus. No stats, just you and the story.', color: 'from-blue-600 to-cyan-600' },
    ];

    const themes = [
        { id: 'scifi', label: 'Sci-Fi', icon: '🚀', color: 'from-blue-600 to-purple-600' },
        { id: 'horror', label: 'Horror', icon: '👁️', color: 'from-red-900 to-black' },
        { id: 'romance', label: 'Romance', icon: '🌸', color: 'from-pink-500 to-rose-400' },
        { id: 'fantasy', label: 'Fantasy', icon: '🏰', color: 'from-emerald-600 to-teal-700' },
        { id: 'slice_of_life', label: 'Slice of Life', icon: '☕', color: 'from-orange-400 to-yellow-500' },
        { id: 'isekai', label: 'Isekai', icon: '🌀', color: 'from-indigo-500 to-purple-500' },
        { id: 'mythology', label: 'Mythology', icon: '⚡', color: 'from-yellow-600 to-amber-700' },
        { id: 'wild_west', label: 'Wild West', icon: '🤠', color: 'from-orange-700 to-red-800' },
        { id: 'dark', label: 'Dark', icon: '🌑', color: 'from-gray-800 to-black' },
        { id: 'comedy', label: 'Comedy', icon: '🎭', color: 'from-pink-400 to-yellow-400' },
        { id: 'world_war', label: 'World War', icon: '🎖️', color: 'from-green-800 to-stone-700' },
        { id: 'surreal', label: 'Surreal', icon: '🍄', color: 'from-fuchsia-600 to-pink-600' },
    ];

    return (
        <div className="fixed inset-0 z-50 bg-black overflow-y-auto custom-scrollbar">
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!pendingSelection}
                onCancel={() => setPendingSelection(null)}
                onConfirm={confirmNewGame}
                title={uiText.UI.GENRE_SELECTION.WARNING_TITLE}
                message={uiText.UI.GENRE_SELECTION.WARNING_MSG}
                confirmLabel={uiText.UI.GENRE_SELECTION.BTN_CONFIRM}
                cancelLabel={uiText.UI.GENRE_SELECTION.BTN_CANCEL}
                variant="danger"
            />

            <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative">

                {/* Settings Button */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2 text-theme-muted hover:text-white transition-colors flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full"
                    >
                        <Settings size={20} />
                        <span className="text-sm hidden md:inline">{uiText.UI.GENRE_SELECTION.BTN_SETTINGS}</span>
                    </button>
                </div>

                <ApiKeyModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    onSave={(key, lang) => {
                        setApiKey(key);
                        setLanguage(lang);
                    }}
                />

                <div className="max-w-4xl w-full space-y-8 my-8 md:my-0">

                    <GenreHeader uiText={uiText} />

                    {/* Active Game Status (Only show on Step 1) */}
                    {selectionStep === 'mode' && (
                        <ActiveGameStatus
                            hasActiveGame={hasActiveGame}
                            gameOver={gameOver}
                            onContinue={onContinue}
                            uiText={uiText}
                        />
                    )}

                    {/* STEP 1: MODE SELECTION */}
                    {selectionStep === 'mode' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl text-center text-theme-muted uppercase tracking-widest mb-6">Select Game Mode</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {modes.map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => handleModeSelect(mode.id)}
                                        className={`group relative overflow-hidden rounded-2xl border border-white/10 p-6 text-left transition-all hover:border-white/30 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br ${mode.color} bg-opacity-20`}
                                    >
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                        <div className="relative z-10 flex flex-col gap-2">
                                            <div className="text-4xl mb-2">{mode.icon}</div>
                                            <h3 className="text-2xl font-bold text-white tracking-wide">{mode.label}</h3>
                                            <p className="text-white/70 text-sm">{mode.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: THEME SELECTION */}
                    {selectionStep === 'theme' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={handleBack}
                                    className="text-theme-muted hover:text-white transition-colors flex items-center gap-2"
                                >
                                    ← Back to Modes
                                </button>
                                <h2 className="text-xl text-theme-muted uppercase tracking-widest">Select Theme</h2>
                                <div className="w-20" /> {/* Spacer */}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {themes.map((theme) => (
                                    <button
                                        key={theme.id}
                                        onClick={() => handleThemeSelect(theme.id)}
                                        className={`group relative overflow-hidden rounded-xl border border-white/10 p-4 text-center transition-all hover:border-white/30 hover:scale-[1.02] active:scale-[0.98]`}
                                    >
                                        <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${theme.color}`} />
                                        <div className="relative z-10 flex flex-col items-center gap-2">
                                            <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{theme.icon}</div>
                                            <span className="font-medium text-white/90 text-sm">{theme.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
