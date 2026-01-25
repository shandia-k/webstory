import React, { memo } from 'react';
import FormattedText from '../../common/FormattedText';

// Optimization: Separated to prevent re-renders when parent input state changes.
// Only re-renders when 'messages' or 'isTyping' props update.
const MessageList = memo(function MessageList({ messages, isTyping }) {
    return (
        <>
            {/* Welcome Bubble */}
            <div className="flex justify-center mb-6">
                <span className="text-xs text-gray-400 bg-gray-100/50 px-3 py-1 rounded-full">
                    Today
                </span>
            </div>

            {messages.map((msg, idx) => (
                <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div className={`
                        max-w-[80%] rounded-2xl px-4 py-3 text-sm md:text-base shadow-sm
                        ${msg.role === 'user'
                            ? 'bg-gradient-to-br from-pink-400 to-purple-400 text-white rounded-br-none'
                            : 'bg-white border border-gray-100 text-gray-600 rounded-bl-none'}
                    `}>
                        {msg.role === 'model' ? <FormattedText text={msg.text} /> : msg.text}

                    </div>
                </div>
            ))}

            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex gap-1">
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                </div>
            )}
        </>
    );
});

export default MessageList;
