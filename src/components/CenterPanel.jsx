import React, { useState, useRef, useEffect } from 'react';

export default function CenterPanel({ chatLog, onInput }) {
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatLog]);

    const handleSubmit = () => {
        if (input.trim()) {
            onInput(input);
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        <div className="panel">
            <h3>Narrative Feed</h3>
            <div className="chat-area" id="chat-feed">
                {chatLog.map((msg) => (
                    <div
                        key={msg.id}
                        className={`message msg-${msg.type}`}
                        dangerouslySetInnerHTML={{ __html: msg.text }}
                    />
                ))}
                <div ref={chatEndRef} />
            </div>
            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Apa tindakan Anda selanjutnya?"
                />
                <button onClick={handleSubmit}>ACT</button>
            </div>
        </div>
    );
}
