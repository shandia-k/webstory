import React from 'react';
import { useGame } from '../../../../context/GameContext';
import { Zap, Shield, Activity, Dices, Cpu, Crosshair } from 'lucide-react';

export function ActionPanel() {
    const { choices, handleAction, isProcessing } = useGame();

    if (!choices || choices.length === 0 || isProcessing) return null;

    return (
        <div className="w-full mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {choices.map((choice, idx) => (
                <ActionButton
                    key={idx}
                    choice={choice}
                    onClick={() => handleAction(choice.action)}
                />
            ))}
        </div>
    );
}

function ActionButton({ choice, onClick }) {
    const { label, type, meta } = choice;

    // Determine Icon & Color based on Type
    let Icon = Crosshair;
    let colorClass = "border-theme-accent text-theme-accent hover:bg-theme-accent/10";
    let glowClass = "shadow-[0_0_10px_rgba(var(--theme-accent-rgb),0.3)]";

    if (type === 'skill_check') {
        Icon = Cpu;
        colorClass = "border-cyan-500 text-cyan-400 hover:bg-cyan-500/10";
        glowClass = "shadow-[0_0_15px_rgba(6,182,212,0.3)]";
    } else if (type === 'dice') {
        Icon = Dices;
        colorClass = "border-purple-500 text-purple-400 hover:bg-purple-500/10";
        glowClass = "shadow-[0_0_15px_rgba(168,85,247,0.3)]";
    } else if (type === 'resource') {
        Icon = Zap;
        colorClass = "border-amber-500 text-amber-400 hover:bg-amber-500/10";
        glowClass = "shadow-[0_0_15px_rgba(245,158,11,0.3)]";
    }

    return (
        <button
            onClick={onClick}
            className={`
                group relative flex items-center justify-between p-4 rounded-lg border 
                bg-black/40 backdrop-blur-sm transition-all duration-300
                hover:scale-[1.02] active:scale-95
                ${colorClass} ${glowClass}
            `}
        >
            {/* Holographic Scanline Effect */}
            <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none opacity-20">
                <div className="w-full h-[200%] bg-gradient-to-b from-transparent via-white/10 to-transparent animate-scanline" />
            </div>

            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md bg-black/50 border border-current opacity-80 group-hover:opacity-100 transition-opacity`}>
                    <Icon size={20} />
                </div>
                <div className="flex flex-col items-start">
                    <span className="font-bold tracking-wide uppercase text-sm">{label}</span>
                    {type === 'skill_check' && meta && (
                        <span className="text-[10px] opacity-70 font-mono">
                            [{meta.stat?.toUpperCase()}] {meta.probability} SUCCESS
                        </span>
                    )}
                    {type === 'dice' && meta && (
                        <span className="text-[10px] opacity-70 font-mono">
                            {meta.probability}
                        </span>
                    )}
                    {type === 'resource' && meta && (
                        <span className="text-[10px] opacity-70 font-mono">
                            COST: {meta.cost}
                        </span>
                    )}
                </div>
            </div>

            {/* Arrow Indicator */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                →
            </div>
        </button>
    );
}
