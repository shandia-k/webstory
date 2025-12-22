import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface LoadingDisplayProps {
    genre: string;
    emoji: string;
}

const LoadingDisplay: React.FC<LoadingDisplayProps> = ({ genre, emoji }) => {
    const [msgIndex, setMsgIndex] = useState(0);

    const messages: Record<string, string[]> = {
        scifi: ["Calibrating Flux Capacitor...", "Downloading Universe Data...", "Waking up the Aliens...", "Engaging Hyperdrive..."],
        fantasy: ["Sharpening Swords...", "Brewing Potions...", "Summoning Dragons...", "Polishing Magic Wand..."],
        horror: ["Checking under the bed...", "Lighting candles...", "Running from ghosts...", "Locking the doors..."],
        romance: ["Writing love letters...", "Buying flowers...", "Practicing pickup lines...", "Looking in the mirror..."],
        default: ["Loading Adventure...", "Preparing fun stuff...", "Wait a sec...", "Almost there..."]
    };

    const flavorText = messages[genre?.toLowerCase().replace("-", "")?.replace("_", "")] || messages[genre] || messages.default;

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % flavorText.length);
        }, 1500);
        return () => clearInterval(interval);
    }, [flavorText]);

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center w-full h-full overflow-hidden font-space">
            {/* Warp Tunnel Effect */}
            <div className="absolute inset-0 z-0 opacity-50 bg-[radial-gradient(circle_at_center,theme(colors.white)_0%,transparent_100%)] animate-[pulse_0.5s_ease-in-out_infinite]" />
            <div className="absolute inset-0 z-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] animate-[spin_2s_linear_infinite] opacity-10" />

            {/* Flying Character */}
            <div className="z-10 text-[100px] md:text-[150px] animate-bounce filter drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                {emoji}
            </div>

            {/* Scrolling Text */}
            <div className="z-10 mt-8 text-center">
                <div className="text-2xl md:text-3xl font-bold text-white tracking-widest animate-[pulse_1s_ease-in-out_infinite]">
                    WARPING TO SECTOR...
                </div>
                <div key={msgIndex} className="text-white/80 text-lg mt-2 font-mono animate-[slide-up_0.3s_ease-out]">
                    {">"} {flavorText[msgIndex]}
                </div>
            </div>

            {/* Speed Lines Overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_49%,#fff_50%,transparent_51%)] bg-[length:200%_100%] animate-[slide-left_0.2s_linear_infinite]" />
            <style>{`
                @keyframes slide-left { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
            `}</style>
        </div>,
        document.body
    );
};

export default LoadingDisplay;
