import React, { useRef, useState } from 'react';
import { Zap, Shield, Crosshair, Dices, Cpu, Box } from 'lucide-react';

export function HoloCard({ card, index, total, onSelect, isSelected, isComboMode, isSelectedForCombo }) {
    const cardRef = useRef(null);
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    const [glow, setGlow] = useState({ x: 50, y: 50 });

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Reduced tilt for mobile/performance
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        setRotate({ x: rotateX, y: rotateY });
        setGlow({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
    };

    const handleMouseLeave = () => {
        setRotate({ x: 0, y: 0 });
        setGlow({ x: 50, y: 50 });
    };

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
    }

    const colors = {
        cyan: 'from-cyan-500/20 to-cyan-900/80 border-cyan-500 text-cyan-400',
        purple: 'from-purple-500/20 to-purple-900/80 border-purple-500 text-purple-400',
        amber: 'from-amber-500/20 to-amber-900/80 border-amber-500 text-amber-400',
        emerald: 'from-emerald-500/20 to-emerald-900/80 border-emerald-500 text-emerald-400',
        blue: 'from-blue-500/20 to-blue-900/80 border-blue-500 text-blue-400',
    };

    const themeClass = colors[colorTheme] || colors.cyan;
    const borderColor = colorTheme === 'cyan' ? '#06b6d4' : colorTheme === 'amber' ? '#f59e0b' : colorTheme === 'purple' ? '#a855f7' : '#10b981';

    // Arc Layout Calculation (Desktop Only)
    // On mobile, we might want a simpler stack or scroll
    const isMobile = window.innerWidth < 768;
    const offset = index - (total - 1) / 2;
    const rotateZ = isMobile ? 0 : offset * 5;
    const translateY = isMobile ? 0 : Math.abs(offset) * 10;

    // Selection State
    const isActive = isSelected || isSelectedForCombo;

    return (
        <div
            className={`
                relative w-36 h-56 md:w-48 md:h-72 transition-all duration-300 ease-out perspective-1000 flex-shrink-0
                ${isActive ? '-translate-y-12 md:-translate-y-24 scale-110 z-50' : `hover:-translate-y-8 hover:scale-105 hover:z-40 z-${index}`}
                cursor-pointer
            `}
            style={{
                transform: isActive
                    ? `rotate(0deg) translateY(${isMobile ? -40 : -80}px)`
                    : `rotate(${rotateZ}deg) translateY(${translateY}px)`,
                marginLeft: isMobile ? '0px' : '-40px', // Overlap only on desktop
                marginRight: isMobile ? '10px' : '0px',
            }}
            onClick={() => onSelect(card)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div
                ref={cardRef}
                className={`
                    w-full h-full rounded-xl border-2 bg-gradient-to-b backdrop-blur-md shadow-2xl flex flex-col p-3 md:p-4 relative overflow-hidden group
                    ${themeClass}
                    ${isSelectedForCombo ? 'ring-4 ring-white ring-opacity-50' : ''}
                `}
                style={{
                    transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
                    boxShadow: isActive
                        ? `0 0 30px ${borderColor}80`
                        : `0 10px 20px -5px rgba(0,0,0,0.5)`,
                }}
            >
                {/* Holographic Sheen */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-300 mix-blend-overlay"
                    style={{
                        background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.8), transparent 60%)`
                    }}
                />

                {/* Combo Badge */}
                {isSelectedForCombo && (
                    <div className="absolute top-2 right-2 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full z-20 animate-pulse">
                        COMBO
                    </div>
                )}

                {/* Cost/Stat Badge */}
                {card.meta && (
                    <div className="absolute top-0 left-0 px-2 py-1 bg-black/60 rounded-br-xl border-r border-b border-white/10 text-[10px] font-mono z-10">
                        {card.meta.cost || card.meta.probability || 'ACTION'}
                    </div>
                )}

                {/* Icon Area */}
                <div className="flex-1 flex items-center justify-center my-2 relative">
                    <div className="absolute inset-0 bg-black/30 rounded-lg border border-white/10" />
                    <div className={`relative z-10 p-3 rounded-full bg-black/50 border border-current shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                        <Icon size={isMobile ? 24 : 32} />
                    </div>
                </div>

                {/* Details */}
                <div className="text-center relative z-10">
                    <h3 className="font-bold uppercase tracking-wider text-xs md:text-sm mb-1 line-clamp-2">{card.label}</h3>
                    <div className="w-full h-px bg-white/20 mb-2" />
                    <p className="text-[10px] leading-tight opacity-80 font-mono line-clamp-3">
                        {card.description || card.action}
                    </p>
                </div>

                {/* Scanline Texture */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:100%_3px] pointer-events-none opacity-20" />
            </div>
        </div>
    );
}
