import React, { useState, useEffect, useRef } from 'react';
import { Heart, Zap, Utensils } from 'lucide-react';

const StatPill = React.memo(({ icon: Icon, value, color, barColor, label }) => {
    const [animClass, setAnimClass] = useState('');
    const prevValueRef = useRef(value);

    useEffect(() => {
        if (value > prevValueRef.current) {
            setAnimClass('animate-pulse-grow');
        } else if (value < prevValueRef.current) {
            setAnimClass('animate-shake-x');
        }

        const timer = setTimeout(() => setAnimClass(''), 400);
        prevValueRef.current = value;
        return () => clearTimeout(timer);
    }, [value]);

    return (
        <div className={`flex flex-col w-full gap-1 transform transition-all duration-300 ${animClass}`}>
            <div className="flex justify-between text-xs font-bold text-gray-500 px-1">
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
});

StatPill.displayName = 'StatPill';

const StatsDisplay = React.memo(({ happiness, energy, hunger, uiText }) => {
    return (
        <div className="bg-white/50 rounded-3xl p-6 space-y-4 shadow-sm border border-white/40 backdrop-blur-sm">
            <StatPill icon={Heart} label={uiText.CUTE_UI.STATS.HAPPY} value={happiness} color="text-pink-400" barColor="bg-pink-400" />
            <StatPill icon={Zap} label={uiText.CUTE_UI.STATS.ENERGY} value={energy} color="text-yellow-400" barColor="bg-yellow-400" />
            <StatPill icon={Utensils} label={uiText.CUTE_UI.STATS.BELLY} value={hunger} color="text-orange-400" barColor="bg-orange-400" />
        </div>
    );
});

StatsDisplay.displayName = 'StatsDisplay';

export default StatsDisplay;
