import React from 'react';
import { Heart, Zap, Smile, LucideIcon } from 'lucide-react';

interface StatBarProps {
    icon: LucideIcon;
    value: number;
    max: number;
    color: string;
}

const StatBar: React.FC<StatBarProps> = ({ icon: Icon, value, max, color }) => (
    <div className="flex items-center gap-2 w-full">
        <Icon size={16} className={`text-${color}-500`} />
        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
            <div
                className={`h-full bg-${color}-400 transition-all duration-500`}
                style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
            />
        </div>
        <span className="text-xs font-bold text-gray-500 w-8 text-right">{value}</span>
    </div>
);

interface CombatHUDProps {
    entity: any; // Using any for entity as structure might vary between Pal and Enemy. TODO: Unify.
    isEnemy?: boolean;
}

const CombatHUD: React.FC<CombatHUDProps> = ({ entity, isEnemy = false }) => {
    const hpPercent = (entity.hp / entity.maxHp) * 100;
    const hpColor = hpPercent <= 25 ? 'red' : 'green';

    return (
        <div className={`
            relative
            bg-white/90 backdrop-blur-sm p-3 md:p-4 rounded-2xl shadow-lg border border-white
            w-full md:w-64 flex flex-col gap-2 transition-all duration-500
            ${entity.hp <= 0 ? 'opacity-50 grayscale' : 'opacity-100'}
        `}>
            {/* NAME HEADER */}
            <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-700 truncate">{entity.name}</span>
                <span className="text-xl">{entity.emoji || (isEnemy ? "👹" : "🐱")}</span>
            </div>

            {/* 1. HP BAR (Essential) - Green/Red */}
            <StatBar icon={Heart} value={entity.hp} max={entity.maxHp} color={hpColor} />

            {/* EXTRA STATS (Only for Player) */}
            {!isEnemy && entity.stats && (
                <>
                    {/* 2. HAPPINESS (Pink) */}
                    <StatBar icon={Smile} value={entity.stats.happiness} max={100} color="pink" />

                    {/* 3. ENERGY (Yellow) */}
                    <StatBar icon={Zap} value={entity.stats.energy} max={100} color="yellow" />
                </>
            )}

            {/* TRAIT BADGE (Only for Player) */}
            {!isEnemy && entity.role?.trait && (
                <div className="mt-1 flex justify-end">
                    <span className="text-[10px] bg-indigo-100 text-indigo-500 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                        {entity.role.trait}
                    </span>
                </div>
            )}
        </div>
    );
};

export default CombatHUD;
