import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, Sparkles } from 'lucide-react';
import FormattedText from '../../common/FormattedText';

const ChatOverlay = ({ isOpen, onClose, palName, messages, onSendMessage, isTyping }) => {
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    if (!isOpen) return null;

    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input);
        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-title"
        >
            {/* Backdrop Area - Closes on click */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity animate-in fade-in"
                onClick={onClose}
            ></div>

            {/* Chat Window */}
            <div className="
                w-full md:w-[400px] h-[80vh] md:h-[600px] 
                bg-white/90 backdrop-blur-xl shadow-2xl 
                rounded-t-[2.5rem] md:rounded-[2.5rem] 
                flex flex-col overflow-hidden pointer-events-auto
                animate-in slide-in-from-bottom-10 duration-300
                border-t border-l border-r border-white/50
            ">
                {/* Header */}
                <div className="p-4 md:p-6 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100/50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                            💬
                        </div>
                        <div>
                            <h3 id="chat-title" className="font-bold text-gray-700">Chat with {palName}</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                <span className="text-xs text-green-500 font-bold uppercase tracking-wider">Online</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close chat"
                        className="p-2 bg-white rounded-full text-gray-400 hover:text-pink-500 transition-colors shadow-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-white/50"
                >
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
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            aria-label="Chat input"
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:border-pink-300 focus:bg-white transition-all text-sm md:text-base placeholder:text-gray-400"
                            autoFocus
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            aria-label="Send message"
                            className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                        >
                            <Send size={20} className={input.trim() ? "ml-1" : ""} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatOverlay;
