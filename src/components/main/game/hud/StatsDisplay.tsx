import React, { useState, useEffect, useRef } from 'react';
import { Heart, Zap, Utensils, Smile, LucideIcon } from 'lucide-react';

interface StatPillProps {
    icon: LucideIcon;
    value: number;
    color: string;
    barColor: string;
    label: string;
}

const StatPill: React.FC<StatPillProps> = ({ icon: Icon, value, color, barColor, label }) => {
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
        <div className={`flex flex-col w-full gap-0.5 md:gap-1 transform transition-all duration-300 ${animClass}`}>
            <style>{styles}</style>
            <div className="flex justify-between text-[10px] md:text-xs font-bold text-gray-500 px-1">
                <span className="flex items-center gap-1"><Icon size={10} className={`${color} md:size-[12px]`} /> {label}</span>
                <span>{value}%</span>
            </div>
            <div className="h-3 md:h-4 bg-white rounded-full p-0.5 md:p-1 shadow-sm border border-gray-100 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${barColor}`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
};

interface StatsDisplayProps {
    happiness: number;
    energy: number;
    hunger: number;
    hp: number;
    maxHp: number;
    atk: number;
    def: number;
    skills: any[];
    uiText: any;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ happiness, energy, hunger, hp, maxHp, atk, def, skills, uiText }) => {
    const hpPercent = (hp / maxHp) * 100;
    const hpColor = hpPercent <= 25 ? "text-red-500" : "text-green-500";
    const hpBarColor = hpPercent <= 25 ? "bg-red-500" : "bg-green-500";

    return (
        <div className="bg-white/50 rounded-2xl md:rounded-3xl p-2 md:p-3 shadow-sm border border-white/40 backdrop-blur-sm flex flex-col gap-2 md:grid md:grid-cols-2 lg:flex lg:flex-row md:gap-4">

            {/* TOP ROW: VITALITY (Horizontal Grid on Mobile) */}
            <div className="flex flex-col gap-1 md:space-y-2 md:flex-1">
                {/* Header hidden on mobile for compactness, or minimal */}
                <div className="grid grid-cols-3 gap-1.5 md:flex md:flex-col md:gap-2">
                    {/* 1. HAPPINESS */}
                    <StatPill icon={Heart} label={uiText.CUTE_UI.STATS.HAPPY} value={happiness} color="text-pink-400" barColor="bg-pink-400" />

                    {/* 2. ENERGY */}
                    <StatPill icon={Zap} label={uiText.CUTE_UI.STATS.ENERGY} value={energy} color="text-yellow-400" barColor="bg-yellow-400" />

                    {/* 3. BELLY */}
                    <StatPill icon={Utensils} label={uiText.CUTE_UI.STATS.BELLY} value={hunger} color="text-orange-400" barColor="bg-orange-400" />
                </div>
            </div>

            {/* BOTTOM ROW: COMBAT (Horizontal Grid) */}
            <div className="pt-1 border-t border-white/30 md:border-t-0 md:border-l md:pt-0 md:pl-4 md:flex-1">
                <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                    <div className="bg-white/40 p-1 md:p-2 rounded-xl border border-white/50 flex flex-col items-center justify-center">
                        <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase">HP</span>
                        <div className="flex items-baseline gap-0.5">
                            <span className={`text-xs md:text-sm font-bold ${hpColor}`}>{hp}</span>
                        </div>
                        <div className="w-full h-1 bg-gray-200 rounded-full mt-0.5 overflow-hidden">
                            <div className={`h-full ${hpBarColor}`} style={{ width: `${hpPercent}%` }} />
                        </div>
                    </div>
                    <div className="bg-white/40 p-1 md:p-2 rounded-xl border border-white/50 flex flex-col items-center justify-center">
                        <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase">ATK</span>
                        <span className="text-xs md:text-sm font-bold text-indigo-500">{atk}</span>
                    </div>
                    <div className="bg-white/40 p-1 md:p-2 rounded-xl border border-white/50 flex flex-col items-center justify-center">
                        <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase">DEF</span>
                        <span className="text-xs md:text-sm font-bold text-emerald-500">{def}</span>
                    </div>
                </div>

                {/* SKILLS */}
                <div className="flex flex-col gap-1.5 mt-1.5 md:mt-2">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {skills.map((skill, idx) => (
                            <div key={idx} className="bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg flex items-center gap-1.5" title={skill.description}>
                                <span className="text-xs">{skill.emoji}</span>
                                <span className="text-[10px] font-bold text-indigo-600 whitespace-nowrap">{skill.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );

};

export default StatsDisplay;
