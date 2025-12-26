import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Zap, Crown } from 'lucide-react';
import { useGame } from '../../../../context/GameContext';
import { Pal } from '../../../../types/game';
import { getPotentialEvolution } from '../../../../game-mechanics/EvolutionManager';
import { calculateArchetype } from '../../../../game-mechanics/PersonalitySystem';

interface EvolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    palData: Pal;
    onEvolve: (newData: { name: string; emoji: string; desc: string }) => void;
}

export const EvolutionModal: React.FC<EvolutionModalProps> = ({ isOpen, onClose, palData, onEvolve }) => {
    const { apiKey, language } = useGame();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ name: string; emoji: string; desc: string } | null>(null);
    const [phase, setPhase] = useState<'start' | 'generating' | 'revealed'>('start');

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setPhase('start');
            setResult(null);
            // Small timeout to allow render cycle to clear previous UI before starting new generation
            setTimeout(() => startEvolution(), 100);
        }
    }, [isOpen]);

    const startEvolution = async () => {
        setPhase('generating');
        setLoading(true);
        try {
            // Artificial delay for suspense
            await new Promise(r => setTimeout(r, 2000));

            // [NEW] Deterministic Logic
            // 1. Calculate Personality
            // @ts-ignore
            const bond = palData.role?.stats?.bond || 0;
            // @ts-ignore
            const discipline = palData.role?.stats?.discipline || 0;
            const archetype = calculateArchetype(bond, discipline).archetype;

            // 2. Get Branch
            const branch = getPotentialEvolution(archetype);

            setResult({
                name: branch.name,
                emoji: branch.emoji,
                desc: branch.description
            });
            setPhase('revealed');
        } catch (e) {
            console.error(e);
            onClose(); // Fail silently or show error
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (result) {
            onEvolve(result);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center p-4 text-white font-cute">

            {/* PHASE 1: GENERATING (SUSPENSE) */}
            {phase === 'generating' && (
                <div className="flex flex-col items-center animate-pulse">
                    <div className="text-9xl mb-8 animate-bounce grayscale brightness-0 invert">{palData.emoji}</div>
                    <h2 className="text-3xl font-bold tracking-widest text-[#f0f0f0]">WHAT IS HAPPENING?</h2>
                    <p className="text-gray-400 mt-4">Your Pal is evolving...</p>
                    <div className="mt-8 relative w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-white animate-[shimmer_2s_infinite] w-full" />
                    </div>
                </div>
            )}

            {/* PHASE 2: REVEALED */}
            {phase === 'revealed' && result && (
                <div className="flex flex-col items-center animate-in zoom-in duration-500 max-w-lg text-center max-h-[90vh] overflow-y-auto p-4 no-scrollbar">
                    <div className="relative mb-10">
                        <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-30 animate-pulse rounded-full"></div>
                        <div className="text-[150px] relative z-10 drop-shadow-[0_0_50px_rgba(255,255,255,0.5)] animate-[float_4s_infinite]">
                            {result.emoji}
                        </div>
                        <div className="absolute -top-4 -right-4 text-yellow-400 animate-spin-slow">
                            <Sparkles size={60} />
                        </div>
                    </div>

                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-amber-400 mb-2">
                        {result.name}
                    </h1>
                    <p className="text-xl text-gray-300 italic mb-8">"{result.desc}"</p>

                    <div className="bg-white/10 rounded-2xl p-6 w-full backdrop-blur-sm border border-white/10 mb-8">
                        <div className="flex justify-between items-center text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">
                            <span>Evolution Stats</span>
                            <Crown size={16} className="text-yellow-500" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span>HP</span>
                                <div className="flex items-center gap-2 text-green-400">
                                    <span>+50</span>
                                    <ArrowRight size={14} />
                                    <span>Max</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Power</span>
                                <div className="flex items-center gap-2 text-red-400">
                                    <span>Base Damage UP</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Skill</span>
                                <div className="flex items-center gap-2 text-blue-400">
                                    <span>New Tier Unlocked</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all text-white border border-indigo-400 ring-4 ring-indigo-900/50"
                    >
                        Acccept Evolution
                    </button>

                </div>
            )}
        </div>
    );
};
