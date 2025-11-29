import React, { useEffect, useRef } from 'react';
import { useGame } from '../../../../context/GameContext';
import { ActionPanel } from './ActionPanel';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

export function NarrativeFeed() {
    const { history, isProcessing, uiText } = useGame();
    const feedRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [history, isProcessing]);

    return (
        <div
            ref={feedRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth custom-scrollbar"
        >
            {history.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} uiText={uiText} />
            ))}

            {/* Typing Indicator */}
            {isProcessing && <TypingIndicator uiText={uiText} />}

            {/* Dynamic Action Choices */}
            <ActionPanel />

            {/* Spacer for bottom input area */}
            <div className="h-4" />
        </div>
    );
}
