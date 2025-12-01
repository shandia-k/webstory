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
    const [pendingGenre, setPendingGenre] = useState(null); // For confirmation dialog
    const { setApiKey, setLanguage, history, gameOver, uiText, setSetupData } = useGame();

    const hasActiveGame = history && history.length > 0 && !gameOver;

    const handleGenreClick = (genreId) => {
        if (hasActiveGame) {
            setPendingGenre(genreId);
        } else {
            // Clear cached setup data to force new generation
            if (setSetupData) setSetupData(null);
            onSelect(genreId);
        }
    };

    const confirmNewGame = () => {
        if (pendingGenre) {
            // Clear cached setup data to force new generation
            if (setSetupData) setSetupData(null);
            onSelect(pendingGenre);
            setPendingGenre(null);
        }
    };

    const genres = [
        { id: 'scifi', label: uiText.FIXED.GENRE_LABELS.SCIFI, icon: '🌆', desc: uiText.UI.GENRES.SCIFI.DESC, color: 'from-blue-600 to-purple-600' },
        { id: 'horror', label: uiText.FIXED.GENRE_LABELS.HORROR, icon: '👁️', desc: uiText.UI.GENRES.HORROR.DESC, color: 'from-red-900 to-black' },
        { id: 'romance', label: uiText.FIXED.GENRE_LABELS.ROMANCE, icon: '🌸', desc: uiText.UI.GENRES.ROMANCE.DESC, color: 'from-pink-500 to-rose-400' },
        { id: 'rpg', label: uiText.FIXED.GENRE_LABELS.RPG, icon: '🐉', desc: uiText.UI.GENRES.RPG.DESC, color: 'from-amber-700 to-orange-900' },
    ];

    return (
        <div className="fixed inset-0 z-50 bg-black overflow-y-auto custom-scrollbar">
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!pendingGenre}
                onCancel={() => setPendingGenre(null)}
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

                    <ActiveGameStatus
                        hasActiveGame={hasActiveGame}
                        gameOver={gameOver}
                        onContinue={onContinue}
                        uiText={uiText}
                    />

                    <GenreList
                        genres={genres}
                        handleGenreClick={handleGenreClick}
                    />

                </div>
            </div>
        </div>
    );
}
