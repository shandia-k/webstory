import React from 'react';
import { Heart, Zap, Smile } from 'lucide-react';

const StatBar = ({ icon: Icon, value, max, color }) => (
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

// [BOLT] Optimized: Memoized to prevent re-renders when parent (CombatArena) updates logs but entity stats are stable.
const CombatHUD = React.memo(function CombatHUD({ entity, isEnemy = false }) {
    return (
        <div className={`
            absolute top-4 ${isEnemy ? 'right-4' : 'left-4'} 
            bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white
            w-64 flex flex-col gap-2 transition-all duration-500
            ${entity.hp <= 0 ? 'opacity-50 grayscale' : 'opacity-100'}
        `}>
            {/* NAME HEADER */}
            <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-700 truncate">{entity.name}</span>
                <span className="text-xl">{entity.emoji || (isEnemy ? "👹" : "🐱")}</span>
            </div>

            {/* HP BAR (Essential) */}
            <StatBar icon={Heart} value={entity.hp} max={entity.maxHp} color="pink" />

            {/* EXTRA STATS (Only for Player) */}
            {!isEnemy && entity.stats && (
                <>
                    <StatBar icon={Zap} value={entity.stats.energy} max={100} color="yellow" />
                    <StatBar icon={Smile} value={entity.stats.happiness} max={100} color="blue" />
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
});

export default CombatHUD;
