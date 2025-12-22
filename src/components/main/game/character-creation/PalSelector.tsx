import React, { Dispatch, SetStateAction } from 'react';
import { ArrowRight } from 'lucide-react';
import FitText from '../../../common/FitText';

import FormattedText from '../../../common/FormattedText';
import { Pal } from '../../../../types/game';

interface PalSelectorProps {
    palsData: Pal[] | null;
    selectedPal: number;
    setSelectedPal: Dispatch<SetStateAction<number>>;
    onChoose: () => void;
    uiText: any;
}

const PalSelector: React.FC<PalSelectorProps> = ({
    palsData,
    selectedPal,
    setSelectedPal,
    onChoose,
    uiText
}) => {
    // If palsData is null or empty, provide a fallback or handle safely. 
    // Ideally parent ensures it's not null when this component is rendered.
    const currentPal = palsData && palsData[selectedPal] ? palsData[selectedPal] : (palsData?.[0] || null);

    if (!currentPal || !palsData) return null;

    return (
        <div className="flex flex-col h-full justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center md:text-left space-y-1 md:space-y-2">
                <div className="h-10 md:h-12 flex items-center justify-center md:justify-start gap-2">
                    <h2 className="text-2xl md:text-3xl font-black text-purple-600 leading-none">
                        <FitText maxFontSize={32}>{currentPal.name}</FitText>
                    </h2>
                    <span className="text-2xl filter drop-shadow-sm" title={currentPal.element || "api"}>
                        {currentPal.element === 'air' ? '💧' : currentPal.element === 'tumbuhan' ? '🌿' : '🔥'}
                    </span>
                    {currentPal.trait && (
                        <span className="hidden md:inline-block text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full uppercase tracking-tighter font-black">
                            {currentPal.trait}
                        </span>
                    )}
                </div>
                <div className="text-gray-500 font-medium leading-snug line-clamp-2 md:line-clamp-3 text-xs md:text-sm italic">
                    <FormattedText text={currentPal.desc || currentPal.role?.desc || currentPal.role?.name || "A mysterious pal."} />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 md:gap-3 py-1 md:py-2">
                <div className="bg-pink-50/50 border border-pink-100/50 p-2 md:p-3 rounded-2xl text-center shadow-sm">
                    <div className="text-xl md:text-2xl mb-1">❤️</div>
                    <div className="text-[10px] uppercase tracking-tighter font-black text-pink-400 opacity-60">{uiText.CUTE_UI.STATS.HAPPY}</div>
                    <div className="font-black text-gray-600 text-xs md:text-base">{currentPal.role?.stats?.happiness || currentPal.stats?.happiness || 100}%</div>
                </div>
                <div className="bg-yellow-50/50 border border-yellow-100/50 p-2 md:p-3 rounded-2xl text-center shadow-sm">
                    <div className="text-xl md:text-2xl mb-1">⚡</div>
                    <div className="text-[10px] uppercase tracking-tighter font-black text-yellow-500 opacity-60">{uiText.CUTE_UI.STATS.ENERGY}</div>
                    <div className="font-black text-gray-600 text-xs md:text-base">{currentPal.role?.stats?.energy || currentPal.stats?.energy || 100}%</div>
                </div>
                <div className="bg-orange-50/50 border border-orange-100/50 p-2 md:p-3 rounded-2xl text-center shadow-sm">
                    <div className="text-xl md:text-2xl mb-1">🍖</div>
                    <div className="text-[10px] uppercase tracking-tighter font-black text-orange-400 opacity-60">{uiText.CUTE_UI.STATS.BELLY}</div>
                    <div className="font-black text-gray-600 text-xs md:text-base">{currentPal.role?.stats?.hunger || currentPal.stats?.hunger || 100}%</div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3 md:gap-4 shrink-0 pt-2">
                <button
                    onClick={() => setSelectedPal((prev) => (prev - 1 + palsData.length) % palsData.length)}
                    className="w-12 h-12 md:w-14 md:h-14 bg-white border-2 border-gray-100 rounded-full text-gray-400 hover:border-pink-300 hover:text-pink-500 transition-all active:scale-95 shadow-sm flex items-center justify-center"
                >
                    <ArrowRight size={20} className="rotate-180" />
                </button>

                <button
                    onClick={onChoose}
                    className="flex-1 h-12 md:h-14 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-2xl font-black shadow-lg text-sm md:text-base hover:scale-[1.02] transition-all active:scale-95 px-4 overflow-hidden uppercase tracking-widest"
                >
                    <FitText maxFontSize={16}>{uiText.CUTE_UI.BTN_CHOOSE}</FitText>
                </button>

                <button
                    onClick={() => setSelectedPal((prev) => (prev + 1) % palsData.length)}
                    className="w-12 h-12 md:w-14 md:h-14 bg-white border-2 border-gray-100 rounded-full text-gray-400 hover:border-pink-300 hover:text-pink-500 transition-all active:scale-95 shadow-sm flex items-center justify-center"
                >
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default PalSelector;

