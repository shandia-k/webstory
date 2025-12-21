import React, { useState, useEffect } from 'react';
import CombatHUD from './CombatHUD';
// @ts-ignore
import NarrativeLog from './NarrativeLog'; // Keep legacy for now or convert if small
// @ts-ignore
import CoachingMenu from './CoachingMenu'; // Keep legacy for now

import { useGameStore } from '../../../../store/useGameStore';
// Logic imports would go here (e.g. from combatSlice)

interface CombatArenaProps {
    playerStats: any; // Legacy format
    enemyData: any; // { name, hp, maxHp, element, emoji }
    onCombatEnd: (result: 'win' | 'loss', loot?: any) => void;
}

const CombatArena: React.FC<CombatArenaProps> = ({ playerStats, enemyData, onCombatEnd }) => {
    // --- STORE ---
    // Ideally we use combatSlice actions here.
    // For this migration step, we can bridge local state to props, OR fully switch to slice.
    // Let's use local state for simplicity in migration (as logic is complex),
    // but sync result back to store.

    // Initial State
    const [pStats, setPStats] = useState(playerStats);
    const [eStats, setEStats] = useState(enemyData);
    const [turn, setTurn] = useState<'player' | 'enemy'>('player');
    const [logs, setLogs] = useState<string[]>([]);

    // Effects
    useEffect(() => {
        if (eStats.hp <= 0) {
            setTimeout(() => onCombatEnd('win', { xp: 50, gold: 20 }), 1000);
        } else if (pStats.hp <= 0) {
            setTimeout(() => onCombatEnd('loss'), 1000);
        }
    }, [eStats.hp, pStats.hp, onCombatEnd]);

    // Actions
    const handleAttack = () => {
        if (turn !== 'player') return;

        // Player Attack Logic
        const dmg = Math.floor(Math.random() * 10) + 5;
        setEStats((prev: any) => ({ ...prev, hp: Math.max(0, prev.hp - dmg) }));
        addLog(`You attacked ${eStats.name} for ${dmg} damage!`);

        setTurn('enemy');
    };

    const handleCoaching = (tactic: string) => {
        if (turn !== 'player') return;

        addLog(`Coach: "Try ${tactic}!"`);
        // Buff or special effect
        handleAttack(); // For now, just attack with style
    };

    // Enemy AI (Simple)
    useEffect(() => {
        if (turn === 'enemy' && eStats.hp > 0) {
            const timer = setTimeout(() => {
                const dmg = Math.floor(Math.random() * 8) + 2;
                setPStats((prev: any) => ({ ...prev, hp: Math.max(0, prev.hp - dmg) }));
                addLog(`${eStats.name} attacked you for ${dmg} damage!`);
                setTurn('player');
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [turn, eStats.hp, eStats.name]);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, msg]);
    };

    return (
        <div className="w-full h-full relative bg-gray-900 overflow-hidden flex flex-col items-center justify-center">

            {/* BACKGROUND EFFECT */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-black/80 to-black z-0"></div>

            {/* HUD */}
            <CombatHUD
                playerStats={pStats}
                enemyStats={eStats}
            />

            {/* ARENA VISUALS */}
            <div className="relative z-10 w-full max-w-4xl flex justify-between items-end px-10 pb-32 h-full">

                {/* PLAYER */}
                <div className={`transition-all duration-300 ${turn === 'player' ? 'scale-110 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'opacity-80'}`}>
                    {/* Placeholder for Pal Visual */}
                    <div className="text-[100px] animate-bounce-slow">🦸</div>
                </div>

                {/* ENEMY */}
                <div className={`transition-all duration-300 ${turn === 'enemy' ? 'scale-110 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'opacity-80'}`}>
                    <div className="text-[120px] animate-pulse-slow grayscale-[0.2]">
                        {eStats.emoji || '👹'}
                    </div>
                </div>
            </div>

            {/* CONTROLS & LOGS (BOTTOM) */}
            <div className="absolute bottom-0 w-full h-[30%] bg-black/80 backdrop-blur-lg border-t border-white/10 z-20 flex">

                {/* LEFT: COACHING MENU */}
                <div className="w-1/2 p-4 border-r border-white/10">
                    <h3 className="text-white/50 text-xs font-bold uppercase mb-2">Command Center</h3>
                    {turn === 'player' ? (
                        <div className="grid grid-cols-2 gap-2">
                             <button onClick={handleAttack} className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded">
                                Attack
                             </button>
                             <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded">
                                Defend
                             </button>
                             <button className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 rounded col-span-2">
                                Special
                             </button>
                        </div>
                    ) : (
                        <div className="text-white text-center animate-pulse mt-4">
                            Enemy is thinking...
                        </div>
                    )}
                </div>

                {/* RIGHT: LOGS */}
                <div className="w-1/2 p-4 overflow-y-auto font-mono text-xs">
                    <NarrativeLog logs={logs} />
                </div>
            </div>

        </div>
    );
};

export default CombatArena;
