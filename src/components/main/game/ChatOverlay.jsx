import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, Sparkles } from 'lucide-react';
import MessageList from './MessageList';

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
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none">
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
                            <h3 className="font-bold text-gray-700">Chat with {palName}</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                <span className="text-xs text-green-500 font-bold uppercase tracking-wider">Online</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white rounded-full text-gray-400 hover:text-pink-500 transition-colors shadow-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 md:p-6 bg-white/50"
                >
                    <MessageList messages={messages} isTyping={isTyping} />
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
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:border-pink-300 focus:bg-white transition-all text-sm md:text-base placeholder:text-gray-400"
                            autoFocus
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
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
