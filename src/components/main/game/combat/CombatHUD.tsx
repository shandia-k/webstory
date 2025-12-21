import React from 'react';
import { Heart, Shield, Zap, Sword } from 'lucide-react';

interface CombatHUDProps {
    playerStats: {
        hp: number;
        maxHp: number;
        energy: number;
        maxEnergy: number;
    };
    enemyStats: {
        name: string;
        hp: number;
        maxHp: number;
        element: string; // 'api', 'air', etc
    };
}

const CombatHUD: React.FC<CombatHUDProps> = ({ playerStats, enemyStats }) => {

    // Calculate Percentages
    const playerHpPct = (playerStats.hp / playerStats.maxHp) * 100;
    const enemyHpPct = (enemyStats.hp / enemyStats.maxHp) * 100;

    return (
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-20">

            {/* --- PLAYER HUD (LEFT) --- */}
            <div className="flex flex-col gap-2 w-1/3 max-w-[200px] animate-in slide-in-from-left duration-500">
                <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border-l-4 border-blue-500 shadow-lg">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-white font-bold text-sm tracking-widest uppercase">HERO</span>
                        <Shield size={14} className="text-blue-400" />
                    </div>

                    {/* HP BAR */}
                    <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden mb-1 relative">
                         <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                            style={{ width: `${playerHpPct}%` }}
                         ></div>
                    </div>
                    <div className="flex justify-between text-xs font-mono font-bold">
                        <span className="text-emerald-400">{playerStats.hp}/{playerStats.maxHp}</span>
                    </div>

                    {/* ENERGY BAR */}
                    <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden mt-1 opacity-80">
                         <div
                            className="h-full bg-yellow-400 transition-all duration-500"
                            style={{ width: `${(playerStats.energy / playerStats.maxEnergy) * 100}%` }}
                         ></div>
                    </div>
                </div>
            </div>

            {/* --- VS BADGE (CENTER) --- */}
            <div className="mt-2 animate-bounce-slow">
                <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] italic">VS</span>
            </div>

            {/* --- ENEMY HUD (RIGHT) --- */}
            <div className="flex flex-col gap-2 w-1/3 max-w-[200px] items-end animate-in slide-in-from-right duration-500">
                <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border-r-4 border-rose-500 shadow-lg w-full text-right">
                    <div className="flex justify-between items-center mb-1 flex-row-reverse">
                        <span className="text-white font-bold text-sm tracking-widest uppercase truncate ml-2">
                            {enemyStats.name}
                        </span>
                        <Sword size={14} className="text-rose-400" />
                    </div>

                    {/* ENEMY HP BAR */}
                    <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden mb-1 relative flex justify-end">
                         <div
                            className="h-full bg-gradient-to-l from-rose-600 to-rose-500 transition-all duration-500"
                            style={{ width: `${enemyHpPct}%` }}
                         ></div>
                    </div>
                    <div className="text-xs font-mono font-bold text-rose-400">
                        {enemyStats.hp}/{enemyStats.maxHp}
                    </div>

                    {/* ELEMENT BADGE */}
                    <div className="mt-1">
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/70 uppercase">
                            {enemyStats.element}
                        </span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CombatHUD;
