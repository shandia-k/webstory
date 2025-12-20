import React, { useState } from 'react';
import { useCombat, COMBAT_PHASES } from '../../../../hooks/useCombat';
import CombatHUD from './CombatHUD';
import CoachingMenu from './CoachingMenu';
import NarrativeLog from './NarrativeLog';
import DiceRoller from './DiceRoller';

const CombatArena = ({ palData, enemyData, onCombatEnd }) => {
    // --- STATE ---
    const { phase, turn, logs, pal, enemy, handlePlayerCommand } = useCombat(palData, enemyData, onCombatEnd);

    return (
        <div className="w-full h-full flex flex-col items-center justify-between p-4 relative overflow-hidden">
            {/* --- VISUALS LAYER (Battlefield) --- */}
            {/* This div sits behind everything */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-indigo-900 to-purple-900 opacity-80 z-0 pointer-events-none" />

            {/* --- TOP HUD LAYER --- */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 w-full max-w-6xl mx-auto pointer-events-none">
                {/* PLAYER HUD (Moved to Top Left) */}
                <div className="pointer-events-auto animate-in slide-in-from-left duration-700">
                    <CombatHUD entity={pal} />
                </div>

                {/* ENEMY HUD (Top Right) */}
                <div className="pointer-events-auto animate-in slide-in-from-right duration-700">
                    <CombatHUD entity={enemy} isEnemy={true} />
                </div>
            </div>

            {/* --- CENTER STAGE (Sprites) --- */}
            <div className="flex-1 w-full max-w-5xl flex items-center justify-between px-10 md:px-20 z-10 mt-16">
                {/* PLAYER SPRITE (Left) */}
                <div className={`
                    flex flex-col items-center gap-4 transition-all duration-500
                    ${phase === COMBAT_PHASES.PAL_ACTION ? 'scale-110 translate-x-10' : ''}
                    ${phase === COMBAT_PHASES.DEFEAT ? 'grayscale blur-sm' : ''}
                `}>
                    <div className="text-[100px] md:text-[180px] animate-float drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]">
                        {pal.emoji || pal.role?.emoji || "🐲"}
                    </div>
                </div>

                {/* VS LOGO or TURN INDICATOR */}
                <div className="text-white/20 font-black text-6xl md:text-9xl absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    VS
                </div>

                {/* ENEMY SPRITE (Right) */}
                <div className={`
                    flex flex-col items-center gap-4 transition-all duration-500
                    ${phase === COMBAT_PHASES.ENEMY_ACTION ? 'scale-125 -translate-x-10' : ''}
                    ${phase === COMBAT_PHASES.VICTORY ? 'opacity-0 scale-50 rotate-180' : ''}
                `}>
                    <div className="text-[100px] md:text-[180px] animate-float drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]" style={{ animationDelay: '1s' }}>
                        {enemy.emoji || "👽"}
                    </div>
                </div>
            </div>

            {/* --- BOTTOM HUD (Player Status & Controls) --- */}
            <div className="w-full max-w-2xl relative z-10 flex flex-col gap-4 animate-in slide-in-from-bottom duration-700 mb-8">

                {/* LOGS */}
                <NarrativeLog logs={logs} />

                <div className="flex gap-4 items-end justify-center">
                    {/* ACTION DECK */}
                    <div className="flex-1 max-w-lg">
                        <CoachingMenu
                            onCommand={handlePlayerCommand}
                            disabled={phase !== COMBAT_PHASES.PLAYER_DECISION}
                        />
                    </div>
                </div>
            </div>

            {/* --- OVERLAYS --- */}
            {/* Victory/Defeat Screens could go here, or handled by AdventureEngine switching views */}
            {phase === COMBAT_PHASES.VICTORY && (
                <div className="absolute inset-0 bg-yellow-400/20 backdrop-blur-sm z-50 flex items-center justify-center animate-in zoom-in duration-300">
                    <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-xl stroke-black">VICTORY!</h1>
                </div>
            )}
            {phase === COMBAT_PHASES.DEFEAT && (
                <div className="absolute inset-0 bg-red-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in zoom-in duration-300">
                    <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-xl">DEFEATED...</h1>
                </div>
            )}

            {/* --- DICE ROLLER --- */}
            {/* Only show if we decide to visualize RNG, currently useCombat handles RNG internally */}
            {/* <DiceRoller /> */}

        </div>
    );
};

export default CombatArena;
