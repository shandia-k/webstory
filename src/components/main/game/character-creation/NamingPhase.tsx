import React from 'react';
import { RefreshCw, Check } from 'lucide-react';
import FitText from '../../../common/FitText';
import { Pal } from '../../../../types/game';

interface NamingPhaseProps {
    step: number;
    setStep: (n: number) => void;
    name: string;
    setName: (s: string) => void;
    currentPal: Pal;
    onConfirm: () => void;
    uiText: any;
}

const NamingPhase: React.FC<NamingPhaseProps> = ({
    step,
    setStep,
    name,
    setName,
    currentPal,
    onConfirm,
    uiText
}) => {

    if (step === 2) {
        return (
            <div className="flex flex-col h-full justify-center space-y-4 md:space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="space-y-2 w-full">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">{uiText.CUTE_UI.GIVE_NAME}</label>
                    {/* Unified Input Group */}
                    <div className="flex items-stretch gap-2 w-full h-14 md:h-16">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Bubu"
                            className="min-w-0 flex-1 text-xl md:text-2xl font-bold text-gray-700 bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 focus:border-pink-400 focus:bg-white outline-none transition-all placeholder:text-gray-300"
                            autoFocus
                        />
                        <button
                            onClick={() => {
                                const aiNames = currentPal.suggested_names || [];
                                const genericNames = ["Mochi", "Pudding", "Glitch", "Sparky", "Boba", "Pippin", "Zappy"];
                                const pool = aiNames.length > 0 ? aiNames : genericNames;

                                // Pick random, avoid current name if possible
                                let newName = pool[Math.floor(Math.random() * pool.length)];
                                if (newName === name && pool.length > 1) {
                                    newName = pool.find(n => n !== name) || newName;
                                }
                                setName(newName);
                            }}
                            className="shrink-0 aspect-square h-full bg-gray-100 rounded-2xl text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors flex items-center justify-center"
                            title="Random Name from AI"
                        >
                            <RefreshCw size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={() => setStep(3)}
                        disabled={!name}
                        className="w-full h-14 md:h-16 bg-pink-400 text-white rounded-2xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-500 hover:scale-[1.02] transition-all flex items-center justify-center"
                    >
                        {uiText.CUTE_UI.BTN_CONTINUE}
                    </button>
                    <button
                        onClick={() => setStep(1)}
                        className="text-gray-400 font-bold hover:text-gray-600 text-sm py-2"
                    >
                        {uiText.CUTE_UI.BTN_BACK}
                    </button>
                </div>
            </div>
        );
    }

    // STEP 3: CONFIRM
    return (
        <div className="flex flex-col h-full justify-between animate-in fade-in slide-in-from-right-8 duration-500 py-2">
            <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-800 leading-tight">
                        {name}
                    </h2>
                    {currentPal.trait && (
                        <span className="text-[10px] bg-pink-100 text-pink-500 px-2 py-0.5 rounded-full uppercase font-black tracking-tighter">
                            {currentPal.trait}
                        </span>
                    )}
                </div>
                <p className="text-pink-400 font-bold tracking-wide text-xs italic line-clamp-2 mb-2 px-4 md:px-0">
                    "{currentPal.desc || currentPal.role?.desc || "A loyal friend."}"
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2">
                    <div className="h-px bg-gray-100 flex-1 hidden md:block"></div>
                    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">{uiText.CUTE_UI.READY}</p>
                    <div className="h-px bg-gray-100 flex-1"></div>
                </div>
            </div>

            <div className="bg-white/60 border-2 border-white/80 p-4 rounded-3xl shadow-inner relative mx-2 md:mx-0">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-3 text-center md:text-left tracking-widest">{uiText.CUTE_UI.STARTER_PACK}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {/* Support both 'items' and 'inventory' from AI/Fallbacks */}
                    {(currentPal.inventory || (currentPal as any).items)?.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-white/80 px-3 py-2 rounded-2xl border border-gray-50 shadow-sm">
                            <span className="text-xl">{item.icon}</span>
                            <div className="text-left">
                                <div className="text-[10px] font-black text-gray-600 leading-tight">{item.name}</div>
                            </div>
                        </div>
                    ))}
                    {(!currentPal.inventory && !(currentPal as any).items) && (
                        <div className="text-gray-400 text-sm">No items</div>
                    )}
                </div>
            </div>

            <div className="px-2 md:px-0">
                <button
                    onClick={onConfirm}
                    className="w-full py-4 md:py-5 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-[2rem] font-black shadow-xl hover:shadow-green-200/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-lg shrink-0"
                >
                    <FitText maxFontSize={20}>
                        <div className="flex items-center gap-2 uppercase tracking-widest">
                            <Check size={24} strokeWidth={3} />
                            {uiText.CUTE_UI.BTN_ADOPT} {name.toUpperCase()}
                        </div>
                    </FitText>
                </button>
            </div>
        </div>
    );
};

export default NamingPhase;

