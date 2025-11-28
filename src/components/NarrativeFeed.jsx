import React, { useEffect, useRef } from 'react';

export function NarrativeFeed({ history, isProcessing, handleSend }) {
    const scrollRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, isProcessing]);

    return (
        <div className="flex-1 overflow-y-auto p-4 lg:p-0" ref={scrollRef}>
            <div className="max-w-3xl mx-auto py-8 lg:py-12 space-y-8">

                {history.map((msg) => {
                    if (msg.role === 'system') {
                        return (
                            <div key={msg.id} className="flex flex-col items-center gap-2">
                                <div className="flex justify-center">
                                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-theme-panel text-theme-muted border border-theme-border">
                                        {msg.content}
                                    </span>
                                </div>
                                {msg.action && (
                                    <button
                                        onClick={() => handleSend(msg.action)}
                                        className="text-xs bg-theme-accent/10 hover:bg-theme-accent/20 text-theme-accent px-3 py-1 rounded-full transition-colors border border-theme-accent/20 hover:border-theme-accent/40 flex items-center gap-1 cursor-pointer"
                                    >
                                        {msg.actionLabel}
                                    </button>
                                )}
                            </div>
                        );
                    }

                    if (msg.role === 'ai') {
                        return (
                            <div key={msg.id} className="group">
                                <div className="pl-4 border-l-2 border-theme-accent/50 group-hover:border-theme-accent transition-colors">
                                    <p className="text-lg leading-relaxed text-theme-text font-serif tracking-wide">
                                        {msg.content}
                                    </p>
                                </div>
                            </div>
                        );
                    }

                    if (msg.role === 'user') {
                        return (
                            <div key={msg.id} className="flex flex-col items-end gap-2">
                                <div className="bg-theme-panel text-theme-text px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm border border-theme-border">
                                    <p className="text-sm">{msg.content}</p>
                                </div>
                                <span className="text-[10px] text-theme-muted mr-2">{msg.timestamp}</span>
                            </div>
                        );
                    }
                    return null;
                })}

                {isProcessing && (
                    <div className="flex items-center gap-2 pl-4 py-2">
                        <div className="w-2 h-2 bg-theme-accent rounded-full animate-typing delay-100" />
                        <div className="w-2 h-2 bg-theme-accent rounded-full animate-typing delay-200" />
                        <div className="w-2 h-2 bg-theme-accent rounded-full animate-typing delay-300" />
                        <span className="text-xs text-theme-muted font-mono ml-2 animate-pulse">Nexus processing...</span>
                    </div>
                )}

            </div>
        </div>
    );
}
