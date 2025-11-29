import React from 'react';
import { Send } from 'lucide-react';
import { useGame } from '../../../../context/GameContext';

export function InputArea({ inputValue, setInputValue, handleSend, handleKeyDown }) {
    const { uiText } = useGame();

    return (
        <div className="p-4 lg:p-6 pb-6 lg:pb-10">
            <div className="max-w-3xl mx-auto relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={uiText.UI.INPUT_PLACEHOLDER}
                    className="w-full bg-theme-panel text-theme-text placeholder:text-theme-muted pl-5 pr-14 py-4 rounded-xl border border-theme-border focus:border-theme-accent focus:ring-2 focus:ring-theme-accent-transparent focus:outline-none shadow-lg shadow-black/20 transition-all"
                />
                <button
                    onClick={() => handleSend()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-theme-accent hover:opacity-90 text-white rounded-lg transition-colors"
                >
                    <Send size={18} />
                </button>
            </div>
            <div className="text-center mt-3">
                <p className="text-[10px] text-theme-muted">{uiText.UI.INPUT_FOOTER}</p>
            </div>
        </div>
    );
}
