import React from 'react';
import { useGame } from '../../../context/GameContext';

export function BackgroundLayer() {
    const { environment, genre } = useGame();
    console.log("BackgroundLayer Environment:", environment); // DEBUG LOG

    // Map environment tags to image paths
    const bgMap = {
        'FOREST': '/webstory/assets/backgrounds/forest.png',
        'DUNGEON': '/webstory/assets/backgrounds/dungeon.png',
        'CYBERPUNK': '/webstory/assets/backgrounds/cyberpunk.png',
        'CITY': '/webstory/assets/backgrounds/cyberpunk.png',
        'LAB': '/webstory/assets/backgrounds/cyberpunk.png', // Fallback to cyberpunk
        'SPACE': '/webstory/assets/backgrounds/cyberpunk.png', // Fallback to cyberpunk
        'HORROR': '/webstory/assets/backgrounds/dungeon.png', // Fallback to dungeon
        'SCIFI': '/webstory/assets/backgrounds/cyberpunk.png' // Default Fallback
    };

    // Determine effective environment key
    let envKey = environment;
    if (!envKey) {
        if (genre === 'rpg') envKey = 'DUNGEON';
        else if (genre === 'horror') envKey = 'HORROR';
        else envKey = 'SCIFI';
    }

    // Default to SCIFI if environment is missing or not found
    const currentBg = bgMap[envKey] || bgMap[environment] || bgMap['SCIFI'];

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Base Dark Background */}
            <div className="absolute inset-0 bg-black" />

            {/* Dynamic Image Layer */}
            {currentBg && (
                <div
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out opacity-40"
                    style={{ backgroundImage: `url(${currentBg})` }}
                />
            )}

            {/* Vignette Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

            {/* Scanline/Noise Overlay (Optional, low opacity) */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        </div>
    );
}
