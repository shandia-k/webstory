import React, { useState } from 'react';
import { Menu, ChevronRight, MoreHorizontal, Download, Upload, Zap, X } from 'lucide-react';
import { useGame } from '../../../../context/GameContext';
import { ConfirmationModal } from '../../../common/ConfirmationModal';

export function Header({
    isSidebarOpen,
    setIsSidebarOpen,
    isMenuOpen,
    setIsMenuOpen,
    handleSaveGame,
    handleLoadClick,
    setGameStarted
}) {
    const { quest, resetGame, genre, quitGame, uiText } = useGame();
    const [confirmAction, setConfirmAction] = useState(null); // 'restart' | 'exit' | 'load'

    const handleConfirm = () => {
        if (confirmAction === 'restart') {
            resetGame(genre);
            setIsMenuOpen(false);
        } else if (confirmAction === 'exit') {
            quitGame();
            setGameStarted(false);
            setIsMenuOpen(false);
        } else if (confirmAction === 'load') {
            handleLoadClick(); // Trigger file input after confirmation
            setIsMenuOpen(false);
        }
        setConfirmAction(null);
    };

    return (
        <>
            <ConfirmationModal
                isOpen={!!confirmAction}
                onCancel={() => setConfirmAction(null)}
                onConfirm={handleConfirm}
                title={
                    confirmAction === 'restart' ? uiText.UI.MENU.CONFIRM_RESTART_TITLE :
                        confirmAction === 'exit' ? uiText.UI.MENU.CONFIRM_EXIT_TITLE :
                            uiText.UI.MENU.CONFIRM_LOAD_TITLE
                }
                message={
                    confirmAction === 'restart' ? uiText.UI.MENU.CONFIRM_RESTART_MSG :
                        confirmAction === 'exit' ? uiText.UI.MENU.CONFIRM_EXIT_MSG :
                            uiText.UI.MENU.CONFIRM_LOAD_MSG
                }
                confirmLabel={uiText.UI.MENU.BTN_CONFIRM}
                cancelLabel={uiText.UI.MENU.BTN_CANCEL}
                variant={confirmAction === 'load' ? 'warning' : 'danger'}
            />

            <header className={`h-16 flex items-center justify-between px-4 lg:px-8 border-b border-theme-border bg-theme-main/80 backdrop-blur sticky top-0 transition-colors duration-500 ${isMenuOpen ? 'z-[60]' : 'z-30'}`}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 -ml-2 text-theme-muted hover:text-theme-text rounded-lg hover:bg-theme-panel transition-colors"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center text-sm text-theme-muted gap-2">
                        <span>{uiText.UI.HEADER.MISSION_LABEL}</span>
                        <ChevronRight size={14} />
                        <span className="text-theme-text font-medium">{quest}</span>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-theme-muted hover:text-theme-text p-2 rounded-lg hover:bg-theme-panel transition-colors"
                    >
                        <MoreHorizontal size={20} />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-theme-panel border border-theme-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-1">
                                    <button
                                        onClick={handleSaveGame}
                                        className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-main rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Download size={14} />
                                        {uiText.UI.MENU.SAVE_GAME}
                                    </button>
                                    <button
                                        onClick={() => setConfirmAction('load')}
                                        className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-main rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Upload size={14} />
                                        {uiText.UI.MENU.LOAD_GAME}
                                    </button>
                                    <div className="h-px bg-theme-border my-1" />
                                    <button
                                        onClick={() => setConfirmAction('restart')}
                                        className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-main rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Zap size={14} />
                                        {uiText.UI.MENU.RESTART_MISSION}
                                    </button>
                                    <div className="h-px bg-theme-border my-1" />
                                    <button
                                        onClick={() => setConfirmAction('exit')}
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <X size={14} />
                                        {uiText.UI.MENU.EXIT_SIMULATION}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </header>
        </>
    );
}
