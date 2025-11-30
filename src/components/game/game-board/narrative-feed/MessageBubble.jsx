import React, { useMemo } from 'react';
import { TypewriterText } from './TypewriterText';

export function MessageBubble({ msg, uiText, shouldAnimate, onUpdate }) {
    const isUser = msg.role === 'user';
    const isSystem = msg.role === 'system';
    const visual_effect = msg.visual_effect;

    // Generate Dynamic Styles if visual_effect is present
    const dynamicStyleId = useMemo(() => `anim-${Math.random().toString(36).substr(2, 9)}`, []);

    const customStyle = useMemo(() => {
        if (!visual_effect) return {};

        const style = {};
        if (visual_effect.color) style.color = visual_effect.color;

        if (visual_effect.animation && visual_effect.keyframes) {
            style.animation = `${dynamicStyleId} ${visual_effect.animation}`;
        }

        return style;
    }, [visual_effect, dynamicStyleId]);

    return (
        <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            {/* Dynamic Keyframes Injection */}
            {visual_effect?.keyframes && (
                <style>
                    {`@keyframes ${dynamicStyleId} { ${visual_effect.keyframes} }`}
                </style>
            )}

            <div
                className={`
                    max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-lg relative overflow-hidden transition-all
                    ${isUser
                        ? 'bg-theme-accent text-white rounded-br-none'
                        : isSystem
                            ? 'bg-red-900/20 border border-red-500/50 text-red-200 w-full text-center font-mono text-xs'
                            : 'bg-theme-panel border border-theme-border text-theme-text rounded-bl-none'
                    }
                `}
                style={isUser ? {} : customStyle}
            >
                {/* Role Label */}
                <div className={`text-[10px] font-bold mb-1 uppercase tracking-wider opacity-70 ${isUser ? 'text-right' : 'text-left'}`}>
                    {isUser ? 'YOU' : uiText?.UI?.NARRATIVE?.SYSTEM_NAME || 'SYSTEM'}
                </div>

                {/* Content */}
                <div
                    className="text-sm md:text-base leading-relaxed whitespace-pre-wrap"
                    style={visual_effect?.font_style ? { cssText: visual_effect.font_style } : {}}
                >
                    {shouldAnimate ? (
                        <TypewriterText
                            content={msg.content}
                            speed={10}
                            onUpdate={onUpdate}
                        />
                    ) : (
                        <span dangerouslySetInnerHTML={{ __html: msg.content }} />
                    )}
                </div>

                {/* Timestamp */}
                <div className={`text-[10px] mt-2 opacity-50 ${isUser ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                </div>
            </div>
        </div>
    );
}
