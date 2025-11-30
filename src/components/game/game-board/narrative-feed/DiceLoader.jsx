import React, { useEffect, useState } from 'react';
import { useGame } from '../../../../context/GameContext';

// Pip Patterns for D6
const PIP_PATTERNS = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
};

const DieFace = ({ value, rotateClass }) => {
    const pips = PIP_PATTERNS[value] || [];
    return (
        <div className={`dice-face ${rotateClass}`}>
            <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="flex justify-center items-center">
                        {pips.includes(i) && <div className="pip w-3 h-3 md:w-4 md:h-4" />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export function DiceLoader({ outcome }) {
    const { genre, history } = useGame();
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [showResult, setShowResult] = useState(false);

    // Theme mapping
    const themeClass = {
        'horror': 'dice-theme-horror',
        'fantasy': 'dice-theme-fantasy',
        'scifi': 'dice-theme-scifi'
    }[genre] || 'dice-theme-scifi';

    useEffect(() => {
        // Initial Spin
        const spinInterval = setInterval(() => {
            setRotation(prev => ({
                x: prev.x + 20 + Math.random() * 20, // Faster spin
                y: prev.y + 20 + Math.random() * 20
            }));
        }, 50); // Faster updates

        // If outcome is determined, land on specific face
        if (outcome) {
            clearInterval(spinInterval);

            // Target Rotations for D6
            // 1: x0, y0
            // 6: x180, y0
            // 2: x-90, y0
            // 5: x90, y0
            // 3: x0, y-90
            // 4: x0, y90

            let targetFace = 1; // Default
            if (outcome === 'SUCCESS') targetFace = 6; // High roll
            if (outcome === 'FAILURE') targetFace = 1; // Low roll
            if (outcome === 'NEUTRAL') targetFace = Math.floor(Math.random() * 6) + 1;

            const targets = {
                1: { x: 0, y: 0 },
                6: { x: 180, y: 0 },
                2: { x: -90, y: 0 },
                5: { x: 90, y: 0 },
                3: { x: 0, y: -90 },
                4: { x: 0, y: 90 },
            };

            // Add multiple full spins (360 * 3) + target
            const extraSpins = 1080;
            const target = targets[targetFace];

            // We need to set a fixed final rotation that matches the target visual
            // To ensure smooth transition, we might need to calculate from current, 
            // but for simplicity in this "overlay" mode, we can just set a high rotation value.

            setRotation({
                x: extraSpins + target.x,
                y: extraSpins + target.y
            });

            setTimeout(() => setShowResult(true), 800);
        }

        return () => clearInterval(spinInterval);
    }, [outcome]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">

            {/* Atmosphere Text */}
            <div className="mb-12 text-center">
                <h2 className={`text-3xl md:text-5xl font-bold tracking-[0.2em] animate-pulse ${outcome === 'SUCCESS' ? 'text-emerald-500' :
                    outcome === 'FAILURE' ? 'text-red-600' : 'text-theme-muted'
                    }`}>
                    {outcome ? outcome : (
                        history.filter(m => m.role === 'user').slice(-1)[0]?.content.toUpperCase().slice(0, 20) + "..." || 'FATE IS TURNING...'
                    )}
                </h2>
            </div>

            {/* 3D SCENE */}
            <div className={`scene ${themeClass}`}>
                <div
                    className="cube"
                    style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
                >
                    <DieFace value={1} rotateClass="face-front" />
                    <DieFace value={6} rotateClass="face-back" />
                    <DieFace value={2} rotateClass="face-top" />
                    <DieFace value={5} rotateClass="face-bottom" />
                    <DieFace value={3} rotateClass="face-right" />
                    <DieFace value={4} rotateClass="face-left" />
                </div>
            </div>

            {/* Result Text (Appears after landing) */}
            <div className={`mt-16 transition-opacity duration-500 ${showResult ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-theme-text text-lg font-mono">
                    {outcome === 'SUCCESS' && "CRITICAL SUCCESS"}
                    {outcome === 'FAILURE' && "CRITICAL FAILURE"}
                </p>
            </div>
        </div>
    );
}
