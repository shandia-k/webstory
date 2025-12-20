import React, { useState, useEffect } from 'react';

const DiceRoller = ({ result, onComplete }) => {
    // result is the final number (e.g. 6 or 20)
    // For visual simulation, we might just show a bouncing CSS cube

    const [rolling, setRolling] = useState(true);
    const [displayVal, setDisplayVal] = useState(1);

    useEffect(() => {
        if (!rolling) return;

        const interval = setInterval(() => {
            setDisplayVal(Math.floor(Math.random() * 20) + 1);
        }, 100);

        const timeout = setTimeout(() => {
            clearInterval(interval);
            setRolling(false);
            setDisplayVal(result || 20); // Fallback
            if (onComplete) onComplete();
        }, 1000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center animate-bounce">
                <div className="text-6xl font-bold text-indigo-600 font-mono">
                    {displayVal}
                </div>
                <div className="text-xs text-gray-400 font-bold tracking-widest mt-2">D20 ROLL</div>
            </div>
        </div>
    );
};

export default DiceRoller;
