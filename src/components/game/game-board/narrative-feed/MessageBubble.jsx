import React from 'react';

export function MessageBubble({ msg, uiText }) {
    return (
        <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            <div className={`
                max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-lg relative overflow-hidden
                ${msg.role === 'user'
                    ? 'bg-theme-accent text-white rounded-br-none'
                    : 'bg-theme-panel border border-theme-border text-theme-text rounded-bl-none'
                }
            `}>
                {/* Role Label */}
                <div className={`text-[10px] font-bold mb-1 uppercase tracking-wider opacity-70 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.role === 'user' ? 'YOU' : uiText.UI.NARRATIVE.SYSTEM_NAME}
                </div>

                {/* Content */}
                <div
                    className="text-sm md:text-base leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: msg.content }}
                />

                {/* Timestamp */}
                <div className={`text-[10px] mt-2 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                </div>
            </div>
        </div>
    );
}
