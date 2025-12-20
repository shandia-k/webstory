import { ArrowRight } from 'lucide-react';
import FitText from '../../../common/FitText';

import FormattedText from '../../../common/FormattedText';

const PalSelector = ({
    palsData,
    selectedPal,
    setSelectedPal,
    onChoose,
    uiText
}) => {
    const currentPal = palsData && palsData[selectedPal] ? palsData[selectedPal] : palsData[0];

    return (
        <div className="flex flex-col h-full justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center md:text-left space-y-2">
                <h2 className="text-3xl font-bold text-purple-600 leading-tight flex items-center justify-center md:justify-start gap-2">
                    {currentPal.name}
                    <span className="text-2xl" title={currentPal.element || "api"}>
                        {currentPal.element === 'air' ? '💧' : currentPal.element === 'tumbuhan' ? '🌿' : '🔥'}
                    </span>
                </h2>
                <div className="text-gray-500 font-medium leading-snug line-clamp-3">
                    <FormattedText text={currentPal.desc} />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 md:gap-3 py-2">
                <div className="bg-pink-50 p-2 md:p-3 rounded-2xl text-center">
                    <div className="text-lg md:text-xl mb-1">❤️</div>
                    <div className="text-[10px] md:text-xs font-bold text-pink-400">{uiText.CUTE_UI.STATS.HAPPY}</div>
                    <div className="font-black text-gray-600 text-sm md:text-base">{currentPal.stats.happiness}%</div>
                </div>
                <div className="bg-yellow-50 p-2 md:p-3 rounded-2xl text-center">
                    <div className="text-lg md:text-xl mb-1">⚡</div>
                    <div className="text-[10px] md:text-xs font-bold text-yellow-400">{uiText.CUTE_UI.STATS.ENERGY}</div>
                    <div className="font-black text-gray-600 text-sm md:text-base">{currentPal.stats.energy}%</div>
                </div>
                <div className="bg-orange-50 p-2 md:p-3 rounded-2xl text-center">
                    <div className="text-lg md:text-xl mb-1">🍖</div>
                    <div className="text-[10px] md:text-xs font-bold text-orange-400">{uiText.CUTE_UI.STATS.BELLY}</div>
                    <div className="font-black text-gray-600 text-sm md:text-base">{currentPal.stats.hunger}%</div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
                <button
                    onClick={() => setSelectedPal((prev) => (prev - 1 + palsData.length) % palsData.length)}
                    className="p-3 md:p-4 bg-white border-2 border-gray-100 rounded-full text-gray-400 hover:border-pink-300 hover:text-pink-500 transition-all active:scale-95"
                >
                    <ArrowRight size={20} className="rotate-180" />
                </button>

                <button
                    onClick={onChoose}
                    className="flex-1 py-3 md:py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-2xl font-bold shadow-lg text-sm md:text-base hover:scale-[1.02] transition-all active:scale-95 px-4 overflow-hidden"
                >
                    <FitText maxFontSize={16}>{uiText.CUTE_UI.BTN_CHOOSE}</FitText>
                </button>

                <button
                    onClick={() => setSelectedPal((prev) => (prev + 1) % palsData.length)}
                    className="p-3 md:p-4 bg-white border-2 border-gray-100 rounded-full text-gray-400 hover:border-pink-300 hover:text-pink-500 transition-all active:scale-95"
                >
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default PalSelector;
