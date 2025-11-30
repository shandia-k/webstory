import React, { useState, useEffect, useRef, useMemo } from 'react';

export function TypewriterText({ content = "", speed = 15, onComplete, onUpdate }) {
    if (!content) return null;
    const [displayedContent, setDisplayedContent] = useState('');
    const timeoutRef = useRef(null);
    const isMounted = useRef(true);

    // Split content into tokens: tags vs text
    // Regex captures the delimiter (tags) so they are included in the result array
    const tokens = useMemo(() => {
        return content.split(/(<[^>]*>)/g);
    }, [content]);

    useEffect(() => {
        isMounted.current = true;
        let currentTokenIndex = 0;
        let charIndexInToken = 0;
        let accumulatedText = "";

        // Clear any existing timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        const typeNextChar = () => {
            if (!isMounted.current) return;

            if (currentTokenIndex >= tokens.length) {
                if (onComplete) onComplete();
                return;
            }

            const token = tokens[currentTokenIndex];

            if (!token) {
                // Empty token (can happen from split), skip
                currentTokenIndex++;
                typeNextChar();
                return;
            }

            if (token.startsWith('<')) {
                // It's a tag, append immediately
                accumulatedText += token;
                setDisplayedContent(accumulatedText);
                if (onUpdate) onUpdate(); // Trigger scroll
                currentTokenIndex++;
                // Small delay even for tags to prevent freezing on large blocks
                timeoutRef.current = setTimeout(typeNextChar, 0);
            } else {
                // It's text, type one char
                if (charIndexInToken < token.length) {
                    accumulatedText += token[charIndexInToken];
                    setDisplayedContent(accumulatedText);
                    if (onUpdate) onUpdate(); // Trigger scroll
                    charIndexInToken++;
                    // Randomize speed slightly for realism
                    const randomSpeed = speed + (Math.random() * 10 - 5);
                    timeoutRef.current = setTimeout(typeNextChar, randomSpeed);
                } else {
                    // Finished this text token, move to next
                    currentTokenIndex++;
                    charIndexInToken = 0;
                    timeoutRef.current = setTimeout(typeNextChar, 0);
                }
            }
        };

        typeNextChar();

        return () => {
            isMounted.current = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [tokens, speed, onComplete, onUpdate]);

    return <span dangerouslySetInnerHTML={{ __html: displayedContent }} />;
}
