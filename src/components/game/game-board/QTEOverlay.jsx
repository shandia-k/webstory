import React, { useState, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';

export function QTEOverlay({ onComplete, duration = 2000 }) {
    const [qteResult, setQteResult] = useState(null); // 'success' | 'fail' | null
    const [qteProgress, setQteProgress] = useState(100);
    const timerRef = useRef(null);
    const isActive = useRef(true);

    const handleSuccess = () => {
        if (!isActive.current || qteResult) return;
        isActive.current = false;
        clearInterval(timerRef.current);
        setQteResult('success');

        setTimeout(() => {
            onComplete('success');
        }, 1000);
    };

    const handleFail = () => {
        if (!isActive.current || qteResult) return;
        isActive.current = false;
        clearInterval(timerRef.current);
        setQteResult('fail');

        setTimeout(() => {
            onComplete('fail');
        }, 1000);
    };

    // Timer Logic
    useEffect(() => {
        let progress = 100;
        const intervalTime = 20;
        const decrement = 100 / (duration / intervalTime);

        timerRef.current = setInterval(() => {
            progress -= decrement;
            setQteProgress(progress);

            if (progress <= 0) {
                handleFail();
            }
        }, intervalTime);

        return () => clearInterval(timerRef.current);
    }, [duration]);

    // Spacebar Listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleSuccess();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [qteResult]);

    return (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">

            {/* Visual Indicator */}
            <div className={`
                relative w-64 h-64 border-4 rounded-full flex items-center justify-center transition-all duration-100
                ${qteResult === 'success' ? 'border-green-500 scale-110' : ''}
                ${qteResult === 'fail' ? 'border-red-600 opacity-50' : ''}
                ${!qteResult ? 'border-white animate-pulse-fast' : ''}
            `}>

                {/* Action Icon/Text */}
                {!qteResult && (
                    <div className="text-center animate-scale-loop">
                        <Zap className="w-16 h-16 mx-auto mb-2 text-yellow-400" />
                        <span className="text-2xl font-black bg-white text-black px-4 py-1 rounded">SPACE</span>
                    </div>
                )}

                {qteResult === 'success' && <span className="text-4xl font-bold text-green-400 animate-bounce">NICE!</span>}
                {qteResult === 'fail' && <span className="text-4xl font-bold text-red-600 animate-shake">MISS!</span>}

                {/* Circular Progress (Using SVG stroke-dashoffset trick) */}
                {!qteResult && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                        <circle
                            cx="128" cy="128" r="120"
                            stroke="currentColor" strokeWidth="8" fill="transparent"
                            className="text-red-600 transition-all duration-75 ease-linear"
                            strokeDasharray={2 * Math.PI * 120}
                            strokeDashoffset={2 * Math.PI * 120 * (1 - qteProgress / 100)}
                        />
                    </svg>
                )}
            </div>

            {!qteResult && (
                <button
                    onClick={handleSuccess}
                    className="mt-8 px-12 py-4 bg-yellow-500 text-black font-black text-xl rounded hover:bg-yellow-400 active:scale-95 transition-transform pointer-events-auto shadow-lg shadow-yellow-500/20"
                >
                    DODGE!
                </button>
            )}

            <style>{`
                @keyframes scale-loop {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .animate-scale-loop {
                    animation: scale-loop 0.5s infinite ease-in-out;
                }
                .animate-pulse-fast {
                    animation: pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
}
