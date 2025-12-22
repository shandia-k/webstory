import React, { useMemo } from 'react';
import './AdventureUI.css';

const StarBackground = React.memo(() => {
    // Memoize star positions to prevent re-calculation on every render
    const stars = useMemo(() => [...Array(20)].map((_, i) => ({
        id: i,
        top: Math.random() * 100 + '%',
        left: Math.random() * 100 + '%',
        animationDelay: Math.random() * 2 + 's',
        fontSize: Math.random() * 10 + 5 + 'px'
    })), []);

    return (
        <div className="absolute inset-0 pointer-events-none">
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="absolute text-yellow-200 animate-twinkle"
                    style={{
                        top: star.top,
                        left: star.left,
                        animationDelay: star.animationDelay,
                        fontSize: star.fontSize
                    }}
                >
                    ✦
                </div>
            ))}
        </div>
    );
});

export default StarBackground;
