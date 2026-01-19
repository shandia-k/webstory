import React, { useState, useEffect, useRef } from 'react';
import { Heart, Zap, Utensils } from 'lucide-react';

const StatPill = ({ icon: Icon, value, color, barColor, label }) => {
    const [animClass, setAnimClass] = useState('');
    const prevValueRef = useRef(value);

    const styles = `
        @keyframes flow-gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes pulse-grow {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); filter: brightness(1.1); }
            100% { transform: scale(1); }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
        }
        .animate-pulse-grow { animation: pulse-grow 0.4s ease-in-out; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
    `;

    useEffect(() => {
        if (value > prevValueRef.current) {
            setAnimClass('animate-pulse-grow');
        } else if (value < prevValueRef.current) {
            setAnimClass('animate-shake');
        }

        const timer = setTimeout(() => setAnimClass(''), 400);
        prevValueRef.current = value;
        return () => clearTimeout(timer);
    }, [value]);

    return (
        <div
            className={`flex flex-col w-full gap-1 transform transition-all duration-300 ${animClass}`}
            role="progressbar"
            aria-label={label}
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            <style>{styles}</style>
            <div className="flex justify-between text-xs font-bold text-gray-500 px-1" aria-hidden="true">
                <span className="flex items-center gap-1"><Icon size={12} className={color} /> {label}</span>
                <span>{value}%</span>
            </div>
            <div className="h-4 bg-white rounded-full p-1 shadow-sm border border-gray-100 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${barColor}`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
};

const StatsDisplay = ({ happiness, energy, hunger, uiText }) => {
    return (
        <div className="bg-white/50 rounded-3xl p-6 space-y-4 shadow-sm border border-white/40 backdrop-blur-sm">
            <StatPill icon={Heart} label={uiText.CUTE_UI.STATS.HAPPY} value={happiness} color="text-pink-400" barColor="bg-pink-400" />
            <StatPill icon={Zap} label={uiText.CUTE_UI.STATS.ENERGY} value={energy} color="text-yellow-400" barColor="bg-yellow-400" />
            <StatPill icon={Utensils} label={uiText.CUTE_UI.STATS.BELLY} value={hunger} color="text-orange-400" barColor="bg-orange-400" />
        </div>
    );
};

export default StatsDisplay;
