import React from 'react';
import { Heart, Shield, Zap, Skull, ArrowRight, MapPin, Sparkles } from 'lucide-react';

interface Choice {
    label: string;
    effect?: {
        hp?: number;
        loot?: number;
    };
    isReturn?: boolean;
}

interface Scene {
    type?: 'normal' | 'conflict' | 'ending';
    visual: string;
    text: string;
    choices?: Choice[];
}

interface AdventureUIProps {
    scene: Scene;
    onChoice: (choice: Choice) => void;
    stats: {
        hp: number;
        maxHp: number;
    };
    loot: number;
    sectorName?: string;
    themeColor?: string;
}

const AdventureUI: React.FC<AdventureUIProps> = ({
    scene, onChoice, stats, loot, sectorName, themeColor = "from-indigo-900 to-purple-900"
}) => {

    // Animation variants based on scene type
    const isConflict = scene.type === 'conflict';
    const isEnding = scene.type === 'ending';

    return (
        <div className={`w-full h-full flex flex-col relative overflow-hidden bg-gradient-to-br ${themeColor} transition-colors duration-1000`}>

            {/* --- HEADER (HUD) --- */}
            <div className="w-full p-4 flex justify-between items-start z-20 bg-gradient-to-b from-black/60 to-transparent">

                {/* LOCATION BADGE */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest">
                        <MapPin size={14} />
                        <span>Current Sector</span>
                    </div>
                    <h2 className="text-2xl font-black text-white drop-shadow-lg font-cute tracking-wide">
                        {sectorName || "Unknown Region"}
                    </h2>
                </div>

                {/* MINI STATS */}
                <div className="flex gap-3">
                    <div className="bg-black/40 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10 flex items-center gap-3">
                        <Heart className="text-rose-400 fill-rose-400/20" size={20} />
                        <div className="flex flex-col">
                            <span className="text-xs text-white/60 font-bold">Health</span>
                            <span className="text-white font-mono font-bold leading-none">{stats.hp}/{stats.maxHp}</span>
                        </div>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10 flex items-center gap-3">
                        <span className="text-yellow-400 text-xl">🪙</span>
                        <div className="flex flex-col">
                            <span className="text-xs text-white/60 font-bold">Loot</span>
                            <span className="text-white font-mono font-bold leading-none">{loot}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN SCENE CONTENT --- */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">

                {/* VISUAL EMOJI */}
                <div className={`
                    text-[120px] md:text-[150px] mb-8 drop-shadow-2xl filter transition-all duration-500
                    ${isConflict ? 'animate-bounce-slow grayscale-[0.2] scale-110' : 'animate-float'}
                    ${isEnding ? 'animate-spin-slow text-yellow-200' : ''}
                `}>
                    {scene.visual}
                </div>

                {/* SCENE CARD */}
                <div className="w-full max-w-2xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">

                    {/* TYPE INDICATOR */}
                    {isConflict && (
                         <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-rose-500/30">
                            <Skull size={14} /> Danger Encounter
                         </div>
                    )}
                    {isEnding && (
                         <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/30">
                            <Sparkles size={14} /> Complete
                         </div>
                    )}

                    {/* NARRATIVE TEXT */}
                    <p className="text-lg md:text-xl text-white/90 leading-relaxed font-medium mb-8 text-center"
                       dangerouslySetInnerHTML={{ __html: scene.text || "..." }}>
                    </p>

                    {/* CHOICES GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scene.choices?.map((choice, idx) => (
                            <button
                                key={idx}
                                onClick={() => onChoice(choice)}
                                className={`
                                    group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300
                                    border-2 hover:-translate-y-1 active:scale-95
                                    ${choice.isReturn
                                        ? 'bg-emerald-600 border-emerald-400 hover:bg-emerald-500 col-span-full text-center'
                                        : 'bg-white/10 border-white/10 hover:bg-white/20 hover:border-white/30'
                                    }
                                `}
                            >
                                <div className="relative z-10">
                                    <span className="text-white font-bold text-lg block mb-1">
                                        {choice.label}
                                    </span>
                                    {/* Preview Effect (Optional) */}
                                    {choice.effect && (choice.effect.hp || choice.effect.loot) && (
                                        <div className="flex gap-3 text-xs opacity-70 group-hover:opacity-100 transition-opacity">
                                            {choice.effect.hp && choice.effect.hp < 0 && (
                                                <span className="text-rose-300 flex items-center gap-1">
                                                    <Heart size={10} fill="currentColor" /> {choice.effect.hp} HP
                                                </span>
                                            )}
                                            {choice.effect.loot && choice.effect.loot > 0 && (
                                                <span className="text-yellow-300 flex items-center gap-1">
                                                    + {choice.effect.loot} Gold
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full"></div>
                            </button>
                        ))}
                    </div>

                </div>

            </div>

            {/* Background Particles (Optional CSS based) */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        </div>
    );
};

export default AdventureUI;
