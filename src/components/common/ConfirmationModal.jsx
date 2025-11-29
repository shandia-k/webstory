import React from 'react';
import { AlertTriangle, X, Check, AlertOctagon } from 'lucide-react';

export function ConfirmationModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "warning" // warning | danger
}) {
    if (!isOpen) return null;

    const isDanger = variant === 'danger';
    const Icon = isDanger ? AlertOctagon : AlertTriangle;
    const accentColor = isDanger ? 'red' : 'yellow';

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Modal Container */}
            <div
                className={`bg-theme-panel border rounded-2xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 ${isDanger ? 'border-red-500/30' : 'border-yellow-500/30'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background Glow */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 blur-3xl rounded-full pointer-events-none opacity-20 ${isDanger ? 'bg-red-500' : 'bg-yellow-500'}`} />

                <div className="relative z-10 flex flex-col items-center text-center gap-4">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${isDanger ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                        <Icon size={32} />
                    </div>

                    {/* Content */}
                    <div>
                        <h3 className="text-xl font-bold text-theme-text mb-2 tracking-wide uppercase">{title}</h3>
                        <p className="text-sm text-theme-muted leading-relaxed">{message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 w-full mt-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-3 rounded-xl border border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-panel transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <X size={18} />
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-3 rounded-xl text-white font-bold transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg ${isDanger
                                    ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20'
                                    : 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-900/20'
                                }`}
                        >
                            <Check size={18} />
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
