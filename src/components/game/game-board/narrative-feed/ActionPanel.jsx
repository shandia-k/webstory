import React from 'react';
import { useGame } from '../../../../context/GameContext';
import {
    Zap, Shield, Activity, Dices, Cpu, Crosshair,
    Box, Swords, Eye, Key, Lock, Skull, Hand, MessageSquare
} from 'lucide-react';

// Map string names from AI to Lucide Components
const ICON_MAP = {
    'zap': Zap,
    'shield': Shield,
    'activity': Activity,
    'dices': Dices,
    'cpu': Cpu,
    'crosshair': Crosshair,
    'box': Box,
    'swords': Swords,
    'eye': Eye,
    'key': Key,
    'lock': Lock,
    'skull': Skull,
    'hand': Hand,
    'message': MessageSquare
};

export function ActionPanel() {
    const { choices, handleAction, isProcessing, gameOver } = useGame();

    if (!choices || choices.length === 0 || isProcessing || gameOver) return null;

    return (
        <div className="w-full mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {choices.map((choice, idx) => (
                <ActionButton
                    key={choice.id || idx}
                    choice={choice}
                    onClick={() => handleAction(choice.action)}
                />
            ))}
        </div>
    );
}

function ActionButton({ choice, onClick }) {
    const { label, type, meta, icon } = choice;

    // 1. Determine Icon
    // Priority: Explicit icon from AI -> Type-based default -> Fallback
    let Icon = Crosshair;

    if (icon && ICON_MAP[icon.toLowerCase()]) {
        Icon = ICON_MAP[icon.toLowerCase()];
    } else {
        // Type-based defaults
        switch (type) {
            case 'skill_check': Icon = Cpu; break;
            case 'dice': Icon = Dices; break;
            case 'resource': Icon = Zap; break;
            case 'loot': Icon = Box; break;
            case 'combat': Icon = Swords; break;
            case 'examine': Icon = Eye; break;
            default: Icon = Crosshair;
        }
    }

    // 2. Determine Colors
    let colorClass = "border-theme-accent text-theme-accent hover:bg-theme-accent/10";
    let glowClass = "shadow-[0_0_10px_rgba(var(--theme-accent-rgb),0.3)]";

    if (type === 'skill_check') {
        colorClass = "border-cyan-500 text-cyan-400 hover:bg-cyan-500/10";
        glowClass = "shadow-[0_0_15px_rgba(6,182,212,0.3)]";
    } else if (type === 'dice') {
        colorClass = "border-purple-500 text-purple-400 hover:bg-purple-500/10";
        glowClass = "shadow-[0_0_15px_rgba(168,85,247,0.3)]";
    } else if (type === 'resource') {
        colorClass = "border-amber-500 text-amber-400 hover:bg-amber-500/10";
        glowClass = "shadow-[0_0_15px_rgba(245,158,11,0.3)]";
    } else if (type === 'loot') {
        colorClass = "border-emerald-500 text-emerald-400 hover:bg-emerald-500/10";
        glowClass = "shadow-[0_0_15px_rgba(16,185,129,0.3)]";
    } else if (type === 'combat') {
        colorClass = "border-red-500 text-red-400 hover:bg-red-500/10";
        glowClass = "shadow-[0_0_15px_rgba(239,68,68,0.3)]";
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
                <div className="flex flex-col items-start text-left">
                    <span className="font-bold tracking-wide uppercase text-sm">{label}</span>

                    {/* Meta Info Display */}
                    {meta && (
                        <div className="flex flex-col gap-0.5 mt-1">
                            {/* Skill Check / Probability */}
                            {(meta.probability || meta.difficulty) && (
                                <span className="text-[10px] opacity-70 font-mono">
                                    {meta.stat && `[${meta.stat.toUpperCase()}] `}
                                    {meta.probability || meta.difficulty?.toUpperCase()}
                                </span>
                            )}

                            {/* Cost */}
                            {meta.cost && (
                                <span className="text-[10px] opacity-70 font-mono">
                                    COST: {meta.cost}
                                </span>
                            )}

                            {/* Loot Info */}
                            {meta.loot_item && (
                                <span className="text-[10px] opacity-70 font-mono text-emerald-400">
                                    LOOT: {meta.loot_item.name} (x{meta.loot_item.count || 1})
                                </span>
                            )}
                        </div>
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
