import React from 'react';

export function TypingIndicator({ uiText }) {
    console.log("TypingIndicator Rendered", uiText); // DEBUG LOG
    const [loadingText, setLoadingText] = React.useState(uiText.UI.NARRATIVE.PROCESSING);

    React.useEffect(() => {
        const messages = [
            "Rolling Dice...",
            "Calculating Probabilities...",
            "Consulting Archives...",
            "Generating Narrative...",
            "Simulating World..."
        ];
        // Pick a random message on mount
        setLoadingText(messages[Math.floor(Math.random() * messages.length)]);

        // Optional: Cycle every 2 seconds if it takes long
        const interval = setInterval(() => {
            setLoadingText(messages[Math.floor(Math.random() * messages.length)]);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-start animate-pulse">
            <div className="bg-theme-panel border border-theme-border rounded-2xl rounded-bl-none p-4 shadow-lg">
                <div className="flex gap-1 mb-2">
                    <span className="w-2 h-2 bg-theme-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-theme-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-theme-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <div className="text-[10px] text-theme-muted uppercase tracking-widest font-mono">
                    {loadingText}
                </div>
            </div>
        </div>
    );
}
