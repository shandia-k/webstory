import React from 'react';

export function TypingIndicator({ uiText }) {
    return (
        <div className="flex items-start animate-pulse">
            <div className="bg-theme-panel border border-theme-border rounded-2xl rounded-bl-none p-4 shadow-lg">
                <div className="flex gap-1">
                    <span className="w-2 h-2 bg-theme-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-theme-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-theme-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <div className="text-[10px] mt-2 text-theme-muted uppercase tracking-widest">
                    {uiText.UI.NARRATIVE.PROCESSING}
                </div>
            </div>
        </div>
    );
}
