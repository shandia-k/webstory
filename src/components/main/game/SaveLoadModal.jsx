import React, { useRef } from 'react';
import { Download, Upload, Database, X } from 'lucide-react';

export function SaveLoadModal({ isOpen, onClose, onSaveGame, onLoadGame, onExitToMenu }) {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onLoadGame(file);
            onClose();
        }
    };

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${isOpen ? 'opacity-100 visible backdrop-blur-sm bg-black/40' : 'opacity-0 invisible backdrop-blur-none bg-black/0 pointer-events-none'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-load-title"
        >
            <div className={`bg-white/95 backdrop-blur-xl border-4 border-white/50 rounded-[2.5rem] p-6 md:p-8 w-full max-w-lg shadow-2xl relative overflow-hidden ring-4 ring-black/5 transition-all duration-300 ease-out delay-75 ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}`}>

                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 text-gray-400 hover:text-gray-800 transition-colors z-20 hover:rotate-90 duration-300 bg-white/50 rounded-full p-2"
                    aria-label="Close save menu"
                >
                    <X size={24} />
                </button>

                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-6">

                    {/* HEADER */}
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-white shadow-inner border border-white rounded-full flex items-center justify-center mx-auto text-indigo-500 mb-4 animate-float">
                            <Database size={32} strokeWidth={2.5} />
                        </div>
                        <h2 id="save-load-title" className="text-2xl font-bold text-gray-800 tracking-tight">Save & Load</h2>
                        <p className="text-sm font-medium text-gray-500 max-w-xs mx-auto leading-relaxed">Manage your adventure data</p>
                    </div>

                    {/* ACTIONS */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => { onSaveGame(); onClose(); }}
                                className="group flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-emerald-200 transition-all active:scale-95 hover:-translate-y-1"
                            >
                                <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition-colors">
                                    <Download size={24} />
                                </div>
                                <span className="font-bold">Save Game</span>
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="group flex flex-col items-center justify-center gap-2 bg-white border-2 border-dashed border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-500 p-6 rounded-2xl transition-all active:scale-95 hover:-translate-y-1 hover:bg-indigo-50"
                            >
                                <div className="bg-gray-100 p-3 rounded-full group-hover:bg-white transition-colors">
                                    <Upload size={24} />
                                </div>
                                <span className="font-bold">Load Game</span>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".json"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* EXIT BUTTON */}
                        <button
                            onClick={onExitToMenu}
                            className="w-full text-red-500 hover:bg-red-50 font-bold py-3 rounded-xl transition-colors border border-transparent hover:border-red-100"
                        >
                            Exit to Main Menu
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
