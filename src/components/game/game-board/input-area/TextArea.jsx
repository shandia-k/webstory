import React, { useState, useRef, useEffect } from 'react';
import { Keyboard, Send, X, Activity, Hash, AlertTriangle } from 'lucide-react';

export function TextArea({ inputValue, setInputValue, handleSend, disabled, isExpanded, setIsExpanded }) {
    const inputRef = useRef(null);
    const [errorState, setErrorState] = useState(null);

    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!inputValue.trim()) {
                // Optional error feedback
                return;
            }
            handleSend();
            // Keep expanded or collapse? Usually collapse after send in this UI style
            // setIsExpanded(false); 
        }
        if (e.key === 'Escape') {
            setIsExpanded(false);
        }
    };

    return (
        <div
            className={`
                relative w-full h-full rounded-xl md:rounded-2xl bg-slate-900/90 backdrop-blur-md overflow-hidden
                flex flex-col transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                ${isExpanded
                    ? 'border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)] cursor-default z-50'
                    : 'border-2 border-dashed border-slate-600 hover:border-slate-400 hover:bg-slate-800/50 cursor-pointer'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => !isExpanded && !disabled && setIsExpanded(true)}
        >
            {/* --- LAYER 1: PASSIVE STATE --- */}
            <div className={`
                absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500 transition-all duration-500
                ${isExpanded ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}
            `}>
                <Keyboard size={32} />
                <span className="text-xs font-bold uppercase tracking-widest">Manual Input</span>
            </div>

            {/* --- LAYER 2: ACTIVE TERMINAL STATE --- */}
            <div className={`
                absolute inset-0 z-20 flex flex-col p-4 md:p-6 bg-slate-950/95
                transition-all duration-500 ease-out
                ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}
            `}>
                {/* Header */}
                <div className="flex justify-between items-start mb-4 border-b border-cyan-500/20 pb-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/50">
                            <Keyboard size={24} className="text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-2xl font-black tracking-widest uppercase text-cyan-400">
                                COMMAND_LINE
                            </h2>
                            <div className="flex items-center gap-2 text-[10px] md:text-xs opacity-60 font-mono mt-1 text-cyan-200">
                                <Activity size={12} className="animate-pulse" />
                                AWAITING_INPUT // SECURE_CHANNEL
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Text Area Container */}
                <div className="flex-1 relative bg-black/60 rounded-xl border border-cyan-500/30 p-1 shadow-inner overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center px-3 py-1 bg-black/40 border-b border-cyan-500/10 text-[9px] font-mono text-cyan-500/50">
                        <span>INPUT_STREAM</span>
                        <span>Ln 1, Col 1</span>
                    </div>
                    <textarea
                        ref={inputRef}
                        className="flex-1 w-full h-full bg-transparent border-none outline-none text-sm md:text-lg font-mono p-4 resize-none text-cyan-100 placeholder-slate-600 focus:bg-cyan-950/5 transition-colors leading-relaxed custom-scrollbar"
                        placeholder="Enter command override..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-2 pointer-events-none">
                        <span className="text-[10px] opacity-30 font-mono tracking-widest text-cyan-400">
                            {inputValue.length} CHARS
                        </span>
                        <Hash size={12} className="opacity-20 text-cyan-400" />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSend();
                        }}
                        disabled={!inputValue.trim() || disabled}
                        className={`
                            relative overflow-hidden group flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-cyan-500 text-cyan-400 font-bold tracking-[0.2em] uppercase rounded-lg transition-colors duration-300
                            ${(!inputValue.trim() || disabled) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-950/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]'}
                        `}
                    >
                        <span className="relative z-10 flex items-center gap-2 text-xs md:text-sm">
                            EXECUTE <Send size={16} />
                        </span>
                    </button>
                </div>
            </div>

            {/* Scanline Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:100%_3px] pointer-events-none opacity-20 z-30 rounded-xl md:rounded-2xl" />
        </div>
    );
}
