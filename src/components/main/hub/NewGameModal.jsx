import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const NewGameModal = ({ isOpen, onClose, onConfirm, uiText }) => {
    const cancelRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            cancelRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-game-title"
            aria-describedby="new-game-desc"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header Pattern */}
                <div className="h-24 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                    <AlertTriangle size={48} className="text-white drop-shadow-md animate-pulse" />
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/20"
                    aria-label="Close"
                >
                    <X size={24} />
                </button>

                <div className="p-6 text-center space-y-4">
                    <h3
                        id="new-game-title"
                        className="text-2xl font-bold text-gray-800"
                    >
                        {uiText.HUB.NOTIFICATIONS.CONFIRM_NEW_GAME_TITLE}
                    </h3>

                    <p
                        id="new-game-desc"
                        className="text-gray-600 leading-relaxed"
                    >
                        {uiText.HUB.NOTIFICATIONS.CONFIRM_NEW_GAME}
                    </p>

                    <div className="flex gap-3 pt-4">
                        <button
                            ref={cancelRef}
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-gray-300 focus:outline-none"
                        >
                            {uiText.HUB.BTN_CANCEL}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg transform transition-all active:scale-95 focus:ring-2 focus:ring-orange-300 focus:outline-none"
                        >
                            {uiText.HUB.BTN_START}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewGameModal;
