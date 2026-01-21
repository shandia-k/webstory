import React, { useState } from 'react';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';
import FitText from '../../../common/FitText';
import { validateInput } from '../../../../utils/security';

const NamingPhase = ({
    step,
    setStep,
    name,
    setName,
    currentPal,
    onConfirm,
    uiText
}) => {
    const [validationError, setValidationError] = useState(null);

    const handleNameChange = (e) => {
        const newVal = e.target.value;
        setName(newVal);
        const { isValid, error } = validateInput(newVal, 'name');
        setValidationError(isValid ? null : error);
    };

    const handleRandomName = () => {
        const aiNames = currentPal.suggested_names || [];
        const genericNames = ["Mochi", "Pudding", "Glitch", "Sparky", "Boba", "Pippin", "Zappy"];
        const pool = aiNames.length > 0 ? aiNames : genericNames;

        // Pick random, avoid current name if possible
        let newName = pool[Math.floor(Math.random() * pool.length)];
        if (newName === name && pool.length > 1) {
            newName = pool.find(n => n !== name) || newName;
        }
        setName(newName);
        // Reset validation for generated names (assumed safe)
        setValidationError(null);
    };

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
                            onChange={handleNameChange}
                            placeholder="e.g. Bubu"
                            className={`min-w-0 flex-1 text-xl md:text-2xl font-bold text-gray-700 bg-gray-50 border-2 rounded-2xl px-4 outline-none transition-all placeholder:text-gray-300 ${validationError ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-gray-200 focus:border-pink-400 focus:bg-white'}`}
                            autoFocus
                        />
                        <button
                            onClick={handleRandomName}
                            className="shrink-0 aspect-square h-full bg-gray-100 rounded-2xl text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors flex items-center justify-center"
                            title="Random Name from AI"
                        >
                            <RefreshCw size={24} />
                        </button>
                    </div>
                    {/* Validation Error Message */}
                    {validationError && (
                        <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold pl-1 animate-pulse">
                            <AlertCircle size={12} />
                            {validationError}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={() => setStep(3)}
                        disabled={!name || !!validationError}
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
        <div className="flex flex-col h-full justify-between animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center md:text-left mt-4 md:mt-0">
                <h2 className="text-3xl font-bold text-gray-800 leading-tight">{name}</h2>
                <p className="text-pink-400 font-bold uppercase tracking-wide text-sm">{uiText.CUTE_UI.READY}</p>
            </div>

            <div className="bg-white border-2 border-gray-100 p-4 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3 text-center md:text-left">{uiText.CUTE_UI.STARTER_PACK}</p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    {currentPal.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-transparent">
                            <span className="text-xl">{item.icon}</span>
                            <div className="text-left">
                                <div className="text-[10px] font-bold text-gray-600 leading-tight">{item.name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={onConfirm}
                className="w-full py-4 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-2xl font-bold shadow-xl hover:shadow-green-200/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-lg shrink-0 mb-2 md:mb-0"
            >
                <FitText maxFontSize={18}>
                    <div className="flex items-center gap-2">
                        <Check size={24} />
                        {uiText.CUTE_UI.BTN_ADOPT} {name.toUpperCase()}
                    </div>
                </FitText>
            </button>
        </div>
    );
};

export default NamingPhase;
