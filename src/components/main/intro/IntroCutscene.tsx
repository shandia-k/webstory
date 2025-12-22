import React, { useState, useEffect } from 'react';
import { ArrowRight, SkipForward } from 'lucide-react';

interface IntroCutsceneProps {
    onComplete: () => void;
}

// Helper to handle Vite base path
const getAssetPath = (path: string) => {
    const base = import.meta.env.BASE_URL;
    // Remove leading slash if base already has trailing slash to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    return `${cleanBase}${cleanPath}`;
};

const SLIDES = [
    {
        id: 'stable',
        image: getAssetPath('assets/intro/slide_stable.png'),
        bgGradient: 'from-cyan-500 to-blue-600',
        title: "THE OMNI-NET",
        text: "Dahulu, Omni-Net adalah surga digital yang sempurna. Tempat di mana miliaran kesadaran hidup dalam harmoni...",
        effect: 'animate-float'
    },
    {
        id: 'collapse',
        image: getAssetPath('assets/intro/slide_glitch.jpg'),
        bgGradient: 'from-red-900 to-black',
        title: "THE COLLAPSE",
        text: "Tapi... The Corruption datang merobek inti sistem. Realitas mulai terpecah. Data menjadi korup.",
        effect: 'animate-glitch'
    },
    {
        id: 'awakening',
        image: getAssetPath('assets/intro/slide_core.png'),
        bgGradient: 'from-gray-900 to-indigo-900',
        title: "SYSTEM FAILURE",
        text: "Sistem gagal... Kami butuh Arsitek. Kami butuh... Karyamu. Tolong... Stabilkan kami.",
        effect: 'animate-bounce-slow'
    }
];

const IntroCutscene: React.FC<IntroCutsceneProps> = ({ onComplete }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [textIndex, setTextIndex] = useState(0);
    const [isTextDone, setIsTextDone] = useState(false);

    const slide = SLIDES[currentSlide];

    // Typewriter Effect
    useEffect(() => {
        setTextIndex(0);
        setIsTextDone(false);
        const interval = setInterval(() => {
            setTextIndex(prev => {
                if (prev >= slide.text.length) {
                    clearInterval(interval);
                    setIsTextDone(true);
                    return prev;
                }
                return prev + 1;
            });
        }, 40); // Speed

        return () => clearInterval(interval);
    }, [currentSlide]);

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className={`fixed inset-0 z-[60] flex flex-col items-center justify-center text-white overflow-hidden transition-colors duration-1000 bg-gradient-to-br ${slide.bgGradient}`}>

            {/* BACKGROUND IMAGE */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${slide.effect}`}>
                <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover opacity-60 mix-blend-overlay md:mix-blend-normal md:opacity-40"
                />
                {/* Gradient Overlay for Text Readability */}
                <div className={`absolute inset-0 bg-gradient-to-t ${slide.bgGradient} opacity-80 mix-blend-multiply`}></div>
            </div>

            {/* SCANLINES OVERLAY */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent bg-[length:100%_4px] opacity-10 pointer-events-none"></div>

            {/* CONTENT CARD */}
            <div className="relative z-10 max-w-2xl px-8 py-12 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center text-center gap-6 mx-4">

                <h1 className="text-4xl md:text-6xl font-black tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-in slide-in-from-top-10 duration-1000">
                    {slide.title}
                </h1>

                <p className="text-lg md:text-2xl font-medium leading-relaxed min-h-[100px] text-shadow-sm">
                    {slide.text.substring(0, textIndex)}
                    <span className="animate-pulse">|</span>
                </p>

                {/* CONTROLS */}
                <div className={`transition-opacity duration-500 ${isTextDone ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <button
                        onClick={handleNext}
                        className="group flex items-center gap-3 bg-white text-black px-8 py-3 rounded-full font-bold text-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]"
                    >
                        {currentSlide === SLIDES.length - 1 ? "INITIALIZE LINK" : "NEXT"}
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* SKIP BUTTON */}
            <button
                onClick={onComplete}
                className="absolute top-8 right-8 text-white/50 hover:text-white flex items-center gap-2 text-sm font-bold tracking-widest uppercase transition-colors"
            >
                <SkipForward size={16} /> Skip Intro
            </button>

            {/* PROGRESS INDICATOR */}
            <div className="absolute bottom-12 flex gap-4">
                {SLIDES.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-12 bg-white box-shadow-[0_0_10px_white]' : 'w-4 bg-white/20'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default IntroCutscene;
