import React, { useState, useEffect, useRef } from 'react';
import {
    Heart, Star, Sparkles, Cloud, Crown
} from 'lucide-react';

import { useGame } from '../../../../context/GameContext';
import { generateGameSetup, generateCampaignStart } from '../../../../services/llmService';
import { GAME_CONTENT } from '../../../../constants/gameContent';

import PalSelector from './PalSelector';
import NamingPhase from './NamingPhase';
import { Pal, Campaign } from '../../../../types/game';
import FormattedText from '../../../common/FormattedText';

interface AdoptionFormProps {
    onComplete: (data: any) => void;
    genre: string;
    onBack?: () => void;
}

const AdoptionForm: React.FC<AdoptionFormProps> = ({ onComplete, genre, onBack }) => {
    // --- 1. STATE ---
    const { apiKey, language, uiText, setCampaign } = useGame();
    const [step, setStep] = useState(1); // 1: Choose Pal, 2: Name, 3: Confirm
    const [selectedPal, setSelectedPal] = useState(0);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingPhase, setLoadingPhase] = useState<'initial' | 'adopting'>('initial');
    const [introNarrative, setIntroNarrative] = useState("");
    const [palsData, setPalsData] = useState<Pal[] | null>(null); // Data dari AI
    const [error, setError] = useState<string | null>(null);
    const fetchedRef = useRef(false);

    // --- 2. AI DATA FETCH (Real) ---
    useEffect(() => {
        const fetchPals = async () => {
            // ... existing fetch logic ...
            if (fetchedRef.current) return;
            fetchedRef.current = true;

            try {
                setLoading(true);
                // @ts-ignore
                const data = await generateGameSetup(apiKey, genre, language);

                if (data && data.candidates) {
                    setPalsData(data.candidates);
                    setIntroNarrative(data.intro_narrative || "");
                } else {
                    throw new Error("AI returned invalid format");
                }
            } catch (err: any) {
                console.error("Adoption AI Error:", err);
                setError(err.message || "Failed to find pals.");
                // @ts-ignore
                setPalsData(GAME_CONTENT.FALLBACKS.ADOPTION);
            } finally {
                setLoading(false);
            }
        };
        fetchPals();
    }, [apiKey, genre, language]);

    const handleConfirm = async () => {
        if (!name || !palsData) return;

        // [NEW] Generate Campaign Start
        setLoadingPhase('adopting');
        setLoading(true); // Re-use loading state briefly
        let campaignData: Campaign | null = null;
        try {
            const palInfo = { name, role: palsData[selectedPal] };
            // @ts-ignore
            campaignData = await generateCampaignStart(apiKey, genre, palInfo, language);
            if (campaignData) campaignData.isActive = true;
        } catch (e) {
            console.warn("Campaign Gen Failed, using default", e);
            campaignData = { isActive: true, title: "My Adventure", mainGoal: "Explore", historySummary: [], currentChapter: 1, antagonist: "Unknown" };
        }

        if (setCampaign && campaignData) setCampaign(campaignData);

        const finalData = {
            name: name,
            role: palsData[selectedPal],
            items: palsData[selectedPal].inventory || []
        };
        onComplete(finalData);
    };

    // --- STYLES ---
    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&display=swap');
        .font-cute { font-family: 'Fredoka', sans-serif; }
        
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes pop { 0% { scale: 0.8; opacity: 0; } 100% { scale: 1; opacity: 1; } }
        
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pop { animation: pop 0.5s cubic-bezier(0.17, 0.67, 0.83, 0.67); }
    `;

    // --- LOADING SCREEN ---
    if (loading) {
        const isAdopting = loadingPhase === 'adopting';
        return (
            <div className="w-full h-screen bg-pink-50 flex flex-col items-center justify-center font-cute text-pink-400">
                <style>{styles}</style>
                <div className="text-6xl animate-bounce mb-4">{isAdopting ? "📜" : "🥚"}</div>
                <p className="tracking-widest font-bold animate-pulse">
                    {(isAdopting ? uiText.CUTE_UI.LOADING.ADOPTING : uiText.CUTE_UI.LOADING.EGGS)}
                </p>
                <p className="text-xs text-pink-300 mt-2">{uiText.CUTE_UI.LOADING.CONNECTING}</p>
            </div>
        );
    }

    const currentPal = palsData && palsData[selectedPal] ? palsData[selectedPal] : (palsData?.[0] as Pal);
    if (!currentPal) return <div>Error loading pals.</div>;

    return (
        <div className="w-full h-screen md:h-screen bg-gradient-to-b from-blue-50 to-pink-50 font-cute flex items-center justify-center p-0 md:p-4 relative overflow-hidden">
            <style>{styles}</style>

            {/* DECORATION (Desktop only mainly) */}
            <div className="absolute top-10 left-10 text-white/60 animate-float hidden md:block"><Cloud size={80} /></div>
            <div className="absolute bottom-20 right-10 text-yellow-200 animate-pulse hidden md:block"><Sparkles size={100} /></div>

            {/* CARD CONTAINER (RESPONSIVE) */}
            <div className="w-full h-screen md:h-auto md:max-w-5xl md:aspect-video bg-white/80 backdrop-blur-xl md:border-4 md:border-white md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-pop transition-all duration-500">

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
                        <div className="text-[120px] md:text-[150px] animate-float drop-shadow-2xl filter leading-none">
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
                <div className="flex-1 flex flex-col h-[65%] md:h-auto md:w-7/12 relative bg-white/40 md:bg-transparent overflow-hidden">

                    {/* Header Progress */}
                    <div className="p-5 md:p-6 pb-2 text-center md:text-left border-b border-gray-100/50 shrink-0 bg-white/40 backdrop-blur-md md:bg-transparent">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                            <h1 className="text-xl md:text-2xl font-black text-gray-700">
                                {uiText.CUTE_UI.NEW_FRIEND}
                            </h1>
                            <div className="flex justify-center">
                                <span className="text-[10px] bg-pink-500 text-white px-3 py-1 rounded-full uppercase font-black tracking-widest shadow-sm">
                                    {genre}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-center md:justify-start gap-1.5 px-4 md:px-0">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-pink-400 w-full' : 'bg-gray-200 w-2'}`}></div>
                            ))}
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center overflow-hidden">

                        {/* STEP 1: CHOOSE */}
                        {step === 1 && (
                            <>
                                {introNarrative && (
                                    <div className="mb-4 p-3 bg-blue-50/50 rounded-2xl border border-blue-100 text-blue-600 text-sm italic relative">
                                        <div className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-bold uppercase tracking-wider text-blue-400">Message</div>
                                        "<FormattedText text={introNarrative} />"
                                    </div>
                                )}
                                <PalSelector
                                    palsData={palsData}
                                    selectedPal={selectedPal}
                                    setSelectedPal={setSelectedPal}
                                    onChoose={() => setStep(2)}
                                    uiText={uiText}
                                />
                            </>
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
