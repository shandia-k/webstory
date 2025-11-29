import React from 'react';
import { ArrowLeft } from 'lucide-react';

export function CreationHeader({ uiText, setupData, onBack }) {
    return (
        <>
            {/* Back Button */}
            <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={onBack}
                    className="p-2 text-theme-muted hover:text-white transition-colors flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-white/10"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm hidden md:inline">{uiText.UI.CHARACTER_CREATION.BTN_ABORT_FULL}</span>
                </button>
            </div>

            {/* Header */}
            <header className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700 mt-8 md:mt-0">
                <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-theme-accent to-purple-500 mb-2">
                    {uiText.UI.CHARACTER_CREATION.TITLE}
                </h1>
                <p className="text-theme-muted italic max-w-2xl mx-auto">
                    "{setupData.intro_narrative}"
                </p>
            </header>
        </>
    );
}
