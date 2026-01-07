import React, { useState, useEffect, useRef } from 'react';
import {
    Heart, Star, Sparkles, Cloud, Crown
} from 'lucide-react';

import { useGame } from '../../../../context/GameContext';
import { generateGameSetup, generateCampaignStart } from '../../../../services/llmService';
import { GAME_CONTENT } from '../../../../constants/gameContent';

import PalSelector from './PalSelector';
import NamingPhase from './NamingPhase';

const AdoptionForm = ({ onComplete, genre }) => {
    // --- 1. STATE ---
    const { apiKey, language, uiText, setCampaign } = useGame();
    const [step, setStep] = useState(1); // 1: Choose Pal, 2: Name, 3: Confirm
    const [selectedPal, setSelectedPal] = useState(0);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [palsData, setPalsData] = useState(null); // Data dari AI
    const [error, setError] = useState(null);
    const fetchedRef = useRef(false);

    // --- 2. AI DATA FETCH (Real) ---
    useEffect(() => {
        const fetchPals = async () => {
            // ... existing fetch logic ...
            if (fetchedRef.current) return;
            fetchedRef.current = true;

            try {
                setLoading(true);
                const data = await generateGameSetup(apiKey, genre, language);

                if (data && data.candidates) {
                    setPalsData(data.candidates);
                } else {
                    throw new Error("AI returned invalid format");
                }
            } catch (err) {
                console.error("Adoption AI Error:", err);
                setError(err.message || "Failed to find pals.");
                setPalsData(GAME_CONTENT.FALLBACKS.ADOPTION);
            } finally {
                setLoading(false);
            }
        };
        fetchPals();
    }, [apiKey, genre, language]);

    const handleConfirm = async () => {
        if (!name) return;

        // [NEW] Generate Campaign Start
        setLoading(true); // Re-use loading state briefly
        let campaignData = null;
        try {
            const palInfo = { name, role: palsData[selectedPal] };
            campaignData = await generateCampaignStart(apiKey, genre, palInfo, language);
            campaignData.isActive = true;
        } catch (e) {
            console.warn("Campaign Gen Failed, using default", e);
            campaignData = { isActive: true, title: "My Adventure", mainGoal: "Explore", historySummary: [], currentChapter: 1 };
        }

        if (setCampaign) setCampaign(campaignData);

        const finalData = {
            name: name,
            role: palsData[selectedPal],
            items: palsData[selectedPal].items
        };
        onComplete(finalData);
    };

    // --- LOADING SCREEN ---
    if (loading) {
        return (
            <div className="w-full h-screen bg-pink-50 flex flex-col items-center justify-center font-fredoka text-pink-400">
                <div className="text-6xl animate-bounce mb-4">🥚</div>
                <p className="tracking-widest font-bold animate-pulse">{uiText.CUTE_UI.LOADING.EGGS}</p>
                <p className="text-xs text-pink-300 mt-2">{uiText.CUTE_UI.LOADING.CONNECTING}</p>
            </div>
        );
    }

    const currentPal = palsData && palsData[selectedPal] ? palsData[selectedPal] : palsData[0];

    return (
        <div className="w-full h-screen md:h-screen bg-gradient-to-b from-blue-50 to-pink-50 font-fredoka flex items-center justify-center p-0 md:p-4 relative overflow-hidden">
            {/* DECORATION (Desktop only mainly) */}
            <div className="absolute top-10 left-10 text-white/60 animate-float-vertical hidden md:block"><Cloud size={80} /></div>
            <div className="absolute bottom-20 right-10 text-yellow-200 animate-pulse hidden md:block"><Sparkles size={100} /></div>

            {/* CARD CONTAINER (RESPONSIVE) */}
            <div className="w-full h-screen md:h-auto md:max-w-5xl md:aspect-video bg-white/80 backdrop-blur-xl md:border-4 md:border-white md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-pop-in transition-all duration-500">

                {/* --- LEFT PANEL (VISUALS) --- */}
                <div className={`
                    relative transition-all duration-500
                    h-[35%] md:h-auto md:w-5/12
                    flex items-center justify-center
                    ${step === 3 ? 'bg-yellow-100/50' : 'bg-gradient-to-br from-blue-50/50 to-pink-50/50'}
                `}>
                    {/* Floating Decorative Elements */}
                    <div className="absolute top-4 left-4 text-white/50 animate-pulse"><Star size={24} /></div>
                    <div className="absolute bottom-10 right-10 text-white/50 animate-bounce"><Heart size={24} /></div>

                    {/* MAIN EMOJI DISPLAY */}
                    <div className="relative z-10 transition-transform duration-500">
                        <div className="text-[120px] md:text-[150px] animate-float-vertical drop-shadow-2xl filter leading-none">
                            {Array.from(currentPal.emoji)[0]}
                        </div>

                        {/* Crown for Step 3 */}
                        {step === 3 && (
                            <div className="absolute -top-10 right-0 text-yellow-400 animate-spin-slow">
                                <Crown size={60} fill="currentColor" />
                            </div>
                        )}
                    </div>
                </div>

                {/* --- RIGHT PANEL (CONTROLS) --- */}
                <div className="flex-1 flex flex-col h-[65%] md:h-auto md:w-7/12 relative bg-white/40 md:bg-transparent">

                    {/* Header Progress */}
                    <div className="p-6 pb-2 text-center md:text-left border-b border-gray-100/50 shrink-0">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-600 mb-2 flex items-center justify-center md:justify-between gap-2">
                            <span>{uiText.CUTE_UI.NEW_FRIEND}</span>
                            <span className="text-xs bg-pink-100 text-pink-500 px-2 py-1 rounded-full">{genre}</span>
                        </h1>
                        <div className="flex justify-center md:justify-start gap-2">
                            <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-pink-400' : 'bg-gray-200'}`}></div>
                            <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-pink-400' : 'bg-gray-200'}`}></div>
                            <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${step >= 3 ? 'bg-pink-400' : 'bg-gray-200'}`}></div>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center overflow-hidden">

                        {/* STEP 1: CHOOSE */}
                        {step === 1 && (
                            <PalSelector
                                palsData={palsData}
                                selectedPal={selectedPal}
                                setSelectedPal={setSelectedPal}
                                onChoose={() => setStep(2)}
                                uiText={uiText}
                            />
                        )}

                        {/* STEP 2 & 3: NAME & CONFIRM */}
                        {(step === 2 || step === 3) && (
                            <NamingPhase
                                step={step}
                                setStep={setStep}
                                name={name}
                                setName={setName}
                                currentPal={currentPal}
                                onConfirm={handleConfirm}
                                uiText={uiText}
                            />
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdoptionForm;
