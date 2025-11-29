import React from 'react';
import { PlayCircle, Skull } from 'lucide-react';

export function ActiveGameStatus({ hasActiveGame, gameOver, onContinue, uiText }) {
    if (hasActiveGame) {
        return (
            <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 sticky top-4 z-20 md:static">
                <button
                    onClick={onContinue}
                    className="group relative px-6 py-3 md:px-8 md:py-4 bg-theme-accent/20 hover:bg-theme-accent/30 border border-theme-accent/50 rounded-xl flex items-center gap-4 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(79,70,229,0.3)] backdrop-blur-md"
                >
                    <div className="p-2 bg-theme-accent rounded-full text-white group-hover:animate-pulse">
                        <PlayCircle size={24} />
                    </div>
                    <div className="text-left">
                        <div className="text-xs md:text-sm text-theme-accent font-medium tracking-wider">{uiText.UI.GENRE_SELECTION.LABEL_ACTIVE}</div>
                        <div className="text-lg md:text-xl font-bold text-white">{uiText.UI.GENRE_SELECTION.BTN_RESUME}</div>
                    </div>
                </button>
            </div>
        );
    }

    if (gameOver) {
        return (
            <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="px-6 py-3 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3">
                    <Skull size={20} className="text-red-500" />
                    <span className="text-red-400 font-medium">{uiText.UI.GENRE_SELECTION.STATUS_GAME_OVER}</span>
                </div>
            </div>
        );
    }

    return null;
}
