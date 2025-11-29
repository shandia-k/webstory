import React from 'react';
import { User, Dice5 } from 'lucide-react';

export function NameSection({ uiText, name, setName, handleRandomizeName }) {
    return (
        <div className="bg-theme-panel border border-theme-border rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <User size={64} />
            </div>
            <label className="block text-xs font-bold text-theme-accent tracking-widest mb-2 uppercase">{uiText.UI.CHARACTER_CREATION.LABEL_NAME}</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 bg-black/50 border border-theme-border rounded-lg px-4 py-3 focus:border-theme-accent focus:ring-1 focus:ring-theme-accent outline-none transition-all text-lg"
                    placeholder={uiText.UI.CHARACTER_CREATION.PLACEHOLDER_NAME}
                />
                <button
                    onClick={handleRandomizeName}
                    className="p-3 bg-theme-accent/10 border border-theme-accent/30 rounded-lg hover:bg-theme-accent/20 transition-colors text-theme-accent"
                    title={uiText.UI.CHARACTER_CREATION.TITLE_RANDOMIZE}
                >
                    <Dice5 size={24} />
                </button>
            </div>
        </div>
    );
}
