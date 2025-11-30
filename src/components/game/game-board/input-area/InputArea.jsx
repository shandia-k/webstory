import React from 'react';
import { Send } from 'lucide-react';
import { useGame } from '../../../../context/GameContext';

export function InputArea({ inputValue, setInputValue, handleSend, handleKeyDown, disabled, isShrunk }) {
    const { uiText } = useGame();

    return (
        <div className={`relative z-50 transition-all duration-500 ease-in-out ${isShrunk ? 'p-2 pb-2 opacity-90 hover:opacity-100' : 'p-4 lg:p-6 pb-6 lg:pb-10'}`}>
            <div className={`max-w-3xl mx-auto relative transition-all duration-500`}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={disabled ? "CONNECTION TERMINATED" : (isShrunk ? "Type command..." : uiText.UI.INPUT_PLACEHOLDER)}
                    className={`
                        w-full bg-theme-panel text-theme-text placeholder:text-theme-muted 
                        rounded-xl border border-theme-border focus:border-theme-accent focus:ring-2 focus:ring-theme-accent-transparent focus:outline-none 
                        shadow-lg shadow-black/20 transition-all 
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        ${isShrunk ? 'py-2 pl-4 pr-10 text-sm' : 'py-4 pl-5 pr-14'}
                    `}
                />
                <button
                    onClick={() => handleSend()}
                    disabled={disabled}
                    className={`
                        absolute right-2 top-1/2 -translate-y-1/2 bg-theme-accent hover:opacity-90 text-white rounded-lg transition-colors 
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        ${isShrunk ? 'p-1' : 'p-2'}
                    `}
                >
                    <Send size={isShrunk ? 14 : 18} />
                </button>
            </div>
            {!isShrunk && (
                <div className="text-center mt-3">
                    <p className="text-[10px] text-theme-muted">{uiText.UI.INPUT_FOOTER}</p>
                </div>
            )}
        </div>
    );
}
