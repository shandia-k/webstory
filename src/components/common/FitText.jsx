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
        // Function to update scale based on container/text widths
        const updateScale = () => {
            if (!containerRef.current || !textRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;
            const textWidth = textRef.current.scrollWidth;

            if (textWidth > containerWidth) {
                const newScale = (containerWidth / textWidth) * compression;
                // Clamp to minFontSize equivalent relative to CURRENT font size
                // We assume the rendered font size is the 'max' size.
                setScale(Math.max(newScale, 0.1));
            } else {
                setScale(1);
            }
        };

        // Run initially to set the correct scale
        // Using requestAnimationFrame ensures we measure after initial layout
        const rafId = window.requestAnimationFrame(updateScale);

        // Use ResizeObserver to detect container size changes
        // This is much more efficient than window.addEventListener('resize')
        // as it only fires when THIS specific element changes size.
        const observer = new ResizeObserver(() => {
            // Wrap in rAF to avoid "ResizeObserver loop limit exceeded" errors
            // if the state update triggers immediate layout changes
            window.requestAnimationFrame(updateScale);
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            observer.disconnect();
            window.cancelAnimationFrame(rafId);
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
