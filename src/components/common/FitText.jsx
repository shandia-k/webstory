import React, { useRef, useState, useEffect } from 'react';

/**
 * FitText Component
 * @param {string} children - Text content to display
 * @param {number} maxFontSize - Maximum font size (default: 100 which allows full size)
 * @param {number} minFontSize - Minimum font size (default: 8)
 * @param {string} className - Wrapper classes
 * @param {number} compression - How aggressive to compress (default: 1)
 */
const FitText = ({
    children,
    className = "",
    maxFontSize,
    minFontSize = 8,
    compression = 1,
    transformOrigin
}) => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const resize = () => {
            if (!containerRef.current || !textRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;
            const textWidth = textRef.current.scrollWidth;

            if (textWidth > containerWidth) {
                const newScale = (containerWidth / textWidth) * compression;
                // Clamp to minFontSize equivalent relative to CURRENT font size
                // We assume the rendered font size is the 'max' size.
                // If maxFontSize is provided, it IS the size. If not, it's inherited.
                // We generally just limit scale to avoid microscopic text if possible, 
                // but strictly speaking, FitText should just fit.
                // We'll use a safe lower bound for scale to prevent 0.
                setScale(Math.max(newScale, 0.1));
            } else {
                setScale(1);
            }
        };

        // If maxFontSize is changing, we might need to wait for render?
        // Actually, style update happens in render. resize runs after.
        // We might need a small delay or useLayoutEffect if we were measuring layout strictly, 
        // but useEffect is likely fine for this visual adjustment.
        // To be safe against font loading or layout shifts:
        const timeoutId = setTimeout(resize, 0);

        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
            clearTimeout(timeoutId);
        };
    }, [children, compression, maxFontSize, minFontSize]);

    const textStyle = {
        transform: `scale(${scale})`,
        transformOrigin: transformOrigin || 'center',
        whiteSpace: 'nowrap',
        display: 'block',
        transition: 'transform 0.1s ease-out'
    };

    if (maxFontSize) {
        textStyle.fontSize = maxFontSize;
    }

    return (
        <div ref={containerRef} className={`w-full h-full flex items-center justify-center overflow-hidden ${className}`}>
            <span
                ref={textRef}
                style={textStyle}
            >
                {children}
            </span>
        </div>
    );
};

export default FitText;
