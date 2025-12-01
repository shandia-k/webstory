import React, { useEffect, useRef } from 'react';
import { useGame } from '../../../../context/GameContext';
import { MessageBubble } from './MessageBubble';
import { DiceLoader } from './DiceLoader';

export function NarrativeFeed({
    history: propHistory,
    isProcessing: propIsProcessing,
    uiText: propUiText,
    suspenseOutcome: propSuspenseOutcome
}) {
    const gameContext = useGame();

    // Use props if available, otherwise fallback to context
    const history = propHistory || gameContext.history;
    const isProcessing = propIsProcessing !== undefined ? propIsProcessing : gameContext.isProcessing;
    const uiText = propUiText || gameContext.uiText;
    const suspenseOutcome = propSuspenseOutcome !== undefined ? propSuspenseOutcome : gameContext.suspenseOutcome;

    console.log("NarrativeFeed Render:", { isProcessing, suspenseOutcome }); // DEBUG LOG
    const feedRef = useRef(null);
    const [showFullHistory, setShowFullHistory] = React.useState(false);

    // Auto-scroll to bottom
    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [history, isProcessing, showFullHistory]);

    // Stable callback for TypewriterText to trigger scroll
    const handleScrollUpdate = React.useCallback(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, []);

    // Filter history for Scene View
    const visibleHistory = showFullHistory
        ? history
        : history.slice(-4); // Show last 4 messages in scene view

    return (
        <div className="flex flex-col h-full relative">
            {/* History Toggle (Absolute Top-Right) */}
            <div className="absolute top-2 right-4 z-10">
                <button
                    onClick={() => setShowFullHistory(!showFullHistory)}
                    className="text-[10px] uppercase tracking-widest text-theme-muted hover:text-theme-accent transition-colors bg-black/50 backdrop-blur-sm px-2 py-1 rounded border border-theme-border"
                >
                    {showFullHistory ? "Hide Log" : "Show Log"}
                </button>
            </div>

            <div
                ref={feedRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth custom-scrollbar"
            >
                {/* Spacer for top */}
                {!showFullHistory && <div className="h-12" />}

                {visibleHistory.map((msg, idx) => {
                    // Calculate opacity for Scene View
                    // The last item is index (length-1). 
                    // We want the last 2 items to be full opacity.
                    // Items before that fade out.
                    let opacityClass = "opacity-100";
                    if (!showFullHistory) {
                        const reverseIdx = visibleHistory.length - 1 - idx;
                        if (reverseIdx >= 2) opacityClass = "opacity-40 grayscale blur-[1px]";
                    }

                    return (
                        <div key={msg.id} className={`transition-all duration-500 ${opacityClass}`}>
                            <MessageBubble
                                msg={msg}
                                uiText={uiText}
                                shouldAnimate={idx === visibleHistory.length - 1 && msg.role === 'ai'}
                                onUpdate={handleScrollUpdate}
                            />
                        </div>
                    );
                })}

                {/* Suspense / Loading Indicator */}
                {(isProcessing || suspenseOutcome) && (
                    <DiceLoader outcome={suspenseOutcome} uiText={uiText} />
                )}

                {/* Spacer for bottom input area */}
                <div className="h-4" />
            </div>
        </div>
    );
}
