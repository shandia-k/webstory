import React from 'react';
import { Swords, Shield, Zap, Crosshair, Box, Cpu, Dices } from 'lucide-react';

export function ActionCard({ card, onClick, disabled }) {
    // Determine Icon & Color based on Type
    let Icon = Crosshair;
    let colorTheme = 'cyan';

    if (card.type === 'skill_check') {
        Icon = Cpu;
        colorTheme = 'cyan';
    } else if (card.type === 'dice') {
        Icon = Dices;
        colorTheme = 'purple';
    } else if (card.type === 'resource') {
        Icon = Zap;
        colorTheme = 'amber';
    } else if (card.type === 'item') {
        Icon = Box;
        colorTheme = 'emerald';
    } else if (card.type === 'defend') {
        Icon = Shield;
        colorTheme = 'blue';
    } else if (card.type === 'attack') {
        Icon = Swords;
        colorTheme = 'red';
    }

    const colors = {
        cyan: 'bg-cyan-950/80 border-cyan-500 text-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]',
        purple: 'bg-purple-950/80 border-purple-500 text-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]',
        amber: 'bg-amber-950/80 border-amber-500 text-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]',
        emerald: 'bg-emerald-950/80 border-emerald-500 text-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]',
        blue: 'bg-blue-950/80 border-blue-500 text-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]',
        red: 'bg-red-950/80 border-red-500 text-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]',
        slate: 'bg-slate-800 border-slate-500 text-slate-300 hover:shadow-[0_0_20px_rgba(148,163,184,0.4)]'
    };

    const themeClass = colors[colorTheme] || colors.cyan;

    // Item Cost Logic (if card has a cost that is an item)
    // For now, we assume 'meta.cost' might contain item info or we pass it explicitly
    // This is a placeholder for the "Item Icon Overlay" logic
    const itemCost = card.itemCost; // Expecting { icon: <Icon/>, name: "Medkit" } if exists

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                relative w-full h-full flex-shrink-0 rounded-xl border-2 flex flex-col p-3 transition-all duration-300
                ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}
                ${themeClass}
                backdrop-blur-md
            `}
        >
            {/* Top-Right: Action Type */}
            <div className="absolute top-2 right-2 flex flex-col items-end">
                <Icon size={20} />
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-80 mt-1">{card.type}</span>
            </div>

            {/* Top-Left Overlay: Item Cost */}
            {itemCost && (
                <div className="absolute top-0 left-0 p-2 z-10">
                    <div className="bg-black/60 rounded-lg p-1.5 border border-white/10 backdrop-blur-sm">
                        {itemCost.icon}
                    </div>
                    <div className="mt-1 text-[8px] font-mono leading-tight max-w-[40px] truncate text-left">
                        {itemCost.name}
                    </div>
                </div>
            )}

            {/* Center: Label */}
            <div className="flex-1 flex flex-col justify-center items-center text-center mt-4">
                <h3 className="font-bold text-sm uppercase leading-tight mb-2 line-clamp-2">
                    {card.label}
                </h3>

                {/* Under Center: Description */}
                <p className="text-[10px] opacity-70 font-mono leading-tight line-clamp-3">
                    {card.description || card.action}
                </p>
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:100%_3px] pointer-events-none opacity-20 rounded-xl" />
        </button>
    );
}
