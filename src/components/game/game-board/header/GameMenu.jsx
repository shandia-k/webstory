import React, { useState } from 'react';
import { Download, Upload, Zap, X } from 'lucide-react';
import { useGame } from '../../../../context/GameContext';
import { ConfirmationModal } from '../../../common/ConfirmationModal';

export function GameMenu({
    isOpen,
    onClose,
    onSave,
    onLoad,
    onRestart,
    onExit
}) {
    const { uiText } = useGame();
    const [confirmAction, setConfirmAction] = useState(null); // 'restart' | 'exit' | 'load'

    const handleConfirm = () => {
        if (confirmAction === 'restart') {
            onRestart();
        } else if (confirmAction === 'exit') {
            onExit();
        } else if (confirmAction === 'load') {
            onLoad();
        }
        setConfirmAction(null);
        onClose();
    };

    if (!isOpen && !confirmAction) return null;

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

            {/* Dropdown Menu - Positioned absolutely relative to the GameBoard container */}
            {isOpen && (
                <div className={`absolute right-4 lg:right-8 top-16 mt-2 w-48 z-[60] ${isOpen ? 'pointer-events-none' : ''}`}>
                    <div className="bg-theme-panel border border-theme-border rounded-xl shadow-xl overflow-hidden animate-scale-in origin-top-right pointer-events-auto p-1">
                        <button
                            onClick={() => { onSave(); onClose(); }}
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
            )}
        </>
    );
}
