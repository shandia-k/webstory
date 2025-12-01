import React, { useMemo } from 'react';
import { useGame } from '../../../context/GameContext';

export function ParticleLayer() {
    const { environment, genre } = useGame();

    // Determine particle config based on environment
    const config = useMemo(() => {
        let env = (environment || '').toUpperCase();

        // Fallback to genre if environment is empty
        if (!env) {
            if (genre === 'rpg') env = 'DUNGEON';
            else if (genre === 'horror') env = 'HORROR';
        }

        if (env.includes('FOREST') || env.includes('JUNGLE')) {
            return { type: 'spores', count: 20, color: 'bg-emerald-400' };
        }
        if (env.includes('CYBERPUNK') || env.includes('CITY') || env.includes('LAB')) {
            return { type: 'rain', count: 30, color: 'bg-cyan-400' };
        }
        if (env.includes('HORROR') || env.includes('DUNGEON')) {
            return { type: 'embers', count: 15, color: 'bg-red-500' };
        }
        if (env.includes('SPACE')) {
            return { type: 'stars', count: 50, color: 'bg-white' };
        }

        // Default (Subtle Dust)
        return { type: 'dust', count: 10, color: 'bg-gray-400' };
    }, [environment, genre]);

    // Generate random particles
    const particles = useMemo(() => {
        return Array.from({ length: config.count }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            delay: `${Math.random() * 5}s`,
            duration: `${3 + Math.random() * 5}s`,
            size: Math.random() * 4 + 1
        }));
    }, [config]);

    return (
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
            {particles.map(p => (
                <div
                    key={p.id}
                    className={`absolute rounded-full opacity-60 ${config.color} ${getAnimationClass(config.type)}`}
                    style={{
                        left: p.left,
                        top: p.top,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        animationDelay: p.delay,
                        animationDuration: p.duration
                    }}
                />
            ))}

            {/* CSS Animations */}
            <style>{`
                @keyframes float-up {
                    0% { transform: translateY(0) translateX(0); opacity: 0; }
                    50% { opacity: 0.8; }
                    100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
                }
                @keyframes rain-drop {
                    0% { transform: translateY(-20px); opacity: 0; }
                    10% { opacity: 1; }
                    100% { transform: translateY(100vh); opacity: 0; }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0.2; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                @keyframes ember-rise {
                    0% { transform: translateY(0) scale(1); opacity: 1; }
                    100% { transform: translateY(-200px) scale(0); opacity: 0; }
                }

                .animate-spores { animation: float-up linear infinite; }
                .animate-rain { animation: rain-drop linear infinite; height: 20px !important; width: 1px !important; }
                .animate-stars { animation: twinkle ease-in-out infinite; }
                .animate-embers { animation: ember-rise ease-out infinite; }
                .animate-dust { animation: float-up ease-in-out infinite; }
            `}</style>
        </div>
    );
}

function getAnimationClass(type) {
    switch (type) {
        case 'spores': return 'animate-spores';
        case 'rain': return 'animate-rain shadow-[0_0_5px_cyan]';
        case 'stars': return 'animate-stars';
        case 'embers': return 'animate-embers shadow-[0_0_5px_red]';
        default: return 'animate-dust';
    }
}
