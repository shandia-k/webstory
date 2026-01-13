import React, { useRef, useState, useEffect, memo } from 'react';

/**
 * FitText Component
 * @param {string} children - Text content to display
 * @param {number} maxFontSize - Maximum font size (default: 100 which allows full size)
 * @param {number} minFontSize - Minimum font size (default: 8)
 * @param {string} className - Wrapper classes
 * @param {number} compression - How aggressive to compress (default: 1)
 */
const FitText = memo(({
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

        // Use ResizeObserver for more efficient and accurate resizing
        // This avoids global window resize listeners which can cause layout thrashing
        // and ensures the text refits even if only the container changes size (not the window)
        const resizeObserver = new ResizeObserver(() => {
            // Wrap in requestAnimationFrame to avoid "ResizeObserver loop limit exceeded"
            requestAnimationFrame(resize);
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Initial check
        resize();

        return () => {
            resizeObserver.disconnect();
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
});

// Display name for debugging
FitText.displayName = 'FitText';

export default FitText;
