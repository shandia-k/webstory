import React, { useState, useRef, useEffect } from 'react';
import { Keyboard, Send, X, Terminal, ChevronRight } from 'lucide-react';

export function TextArea({ inputValue, setInputValue, handleSend, disabled, isExpanded, setIsExpanded }) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!inputValue.trim()) return;
            handleSend();
        }
        if (e.key === 'Escape') {
            setIsExpanded(false);
        }
    };

    // --- COLLAPSED STATE ---
    if (!isExpanded) {
        return (
            <button
                onClick={() => !disabled && setIsExpanded(true)}
                disabled={disabled}
                className={`
                    relative w-full h-full flex-shrink-0 rounded-xl border-2 flex flex-col p-3 transition-all duration-300
                    bg-theme-panel/80 border-theme-accent text-theme-accent hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]
                    backdrop-blur-md
                    ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                {/* Top-Right: Icon & Label */}
                <div className="absolute top-2 right-2 flex flex-col items-end">
                    <Terminal size={20} />
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-80 mt-1">SYSTEM</span>
                </div>

                {/* Center: Label */}
                <div className="flex-1 flex flex-col justify-center items-center text-center mt-4">
                    <h3 className="font-bold text-sm uppercase leading-tight mb-2 line-clamp-2">
                        MANUAL OVERRIDE
                    </h3>

                    {/* Under Center: Description */}
                    <p className="text-[10px] opacity-70 font-mono leading-tight line-clamp-3">
                        Direct Command Input
                    </p>
                </div>

                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:100%_3px] pointer-events-none opacity-20 rounded-xl" />
            </button>
        );
    }

    // --- EXPANDED STATE (TERMINAL) ---
    return (
        <div className="relative w-full h-full rounded-xl border-2 bg-theme-panel/80 border-theme-accent text-theme-accent backdrop-blur-md shadow-[0_0_30px_rgba(239,68,68,0.3)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Terminal Header - Styled to blend with card */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-theme-accent/30 bg-theme-accent/5">
                <div className="flex items-center gap-2 text-theme-accent">
                    <Terminal size={16} />
                    <span className="text-xs font-bold tracking-widest uppercase">Command_Link_Active</span>
                </div>
                <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 hover:bg-theme-accent hover:text-white rounded transition-colors text-theme-accent/70"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Input Area */}
            <div className="flex-1 relative p-4 bg-black/20 min-h-0">
                <div className="flex h-full font-mono text-sm md:text-base">
                    <span className="text-theme-accent mr-3 mt-1 select-none">{`>`}</span>
                    <textarea
                        ref={inputRef}
                        className="flex-1 bg-transparent border-none outline-none resize-none text-theme-text placeholder-theme-muted/30 leading-relaxed custom-scrollbar"
                        placeholder="Enter system command..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        spellCheck={false}
                    />
                </div>
            </div>

            {/* Footer / Actions */}
            <div className="px-4 py-3 bg-theme-main/30 border-t border-theme-accent/10 flex justify-end items-center gap-2">
                <span className="text-[10px] text-theme-muted/50 font-mono uppercase tracking-widest mr-auto">
                    System_Ready
                </span>
                <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || disabled}
                    className={`
                        flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all
                        ${!inputValue.trim() || disabled
                            ? 'text-theme-muted opacity-50 cursor-not-allowed bg-theme-main/20'
                            : 'bg-theme-accent text-white hover:bg-theme-accent-hover shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] hover:-translate-y-0.5'
                        }
                    `}
                >
                    Execute <ChevronRight size={14} />
                </button>
            </div>

            {/* Decorative Scanline */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0)_2px,rgba(0,0,0,0.1)_1px)] bg-[size:100%_3px] opacity-20" />
        </div>
    );
}
