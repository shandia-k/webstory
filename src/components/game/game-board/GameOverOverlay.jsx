import React from 'react';
import { AlertTriangle, Zap, Loader2 } from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { useSmartTranslation } from '../../../hooks/useSmartTranslation';

import { Eye } from 'lucide-react'; // Import Eye icon

export function GameOverOverlay({ isVisible, onHide }) {
    const { gameOver, resetGame, genre, uiText } = useGame();
    const { isLoading } = useSmartTranslation('GAME_OVER');

    if (!gameOver || !isVisible) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-1000">
            <div className="max-w-md w-full bg-theme-panel border border-red-500/50 rounded-2xl p-8 text-center shadow-2xl shadow-red-900/20 relative overflow-hidden">
                {/* Background Pulse */}
                <div className="absolute inset-0 bg-red-500/5 animate-pulse" />

                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2 animate-bounce">
                        <AlertTriangle size={40} />
                    </div>

                    <div className="space-y-2">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-2 animate-pulse text-red-400">
                                <Loader2 size={24} className="animate-spin" />
                                <span className="text-xs font-mono tracking-widest">DECIPHERING SIGNAL...</span>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold text-white tracking-widest uppercase">{uiText.UI.GAME_OVER.TITLE}</h2>
                                <p className="text-red-400 font-mono text-sm">{uiText.UI.GAME_OVER.MESSAGE}</p>
                            </>
                        )}
                    </div>

                    <div className="w-full h-px bg-red-500/20" />

                    <div className="w-full space-y-3">
                        <button
                            onClick={() => resetGame(genre)}
                            className="group relative px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 w-full"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Zap size={18} />
                                {uiText.UI.GAME_OVER.BUTTON_REBOOT}
                            </span>
                        </button>

                        <button
                            onClick={onHide}
                            className="group relative px-8 py-3 bg-transparent border border-red-500/30 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-bold rounded-lg transition-all w-full"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                                <Eye size={16} />
                                VIEW AFTERMATH
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
