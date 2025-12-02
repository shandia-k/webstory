import React, { useState, useRef } from 'react';
import { useGame } from '../../../context/GameContext';
import { GameMenu } from './header/GameMenu';
import { BackgroundLayer } from './BackgroundLayer';
import { ParticleLayer } from './ParticleLayer';
import { GameOverOverlay } from './GameOverOverlay';
import { QTEOverlay } from './QTEOverlay';

// Mode Imports
import { RPGMode } from '../modes/RPGMode';
import { StoryMode } from '../modes/StoryMode';

export function GameBoard({ setGameStarted, initialData }) {
    const {
        saveGame,
        loadGame,
        lastOutcome,
        quitGame,
        resetGame,
        gameMode,
        theme,
        gameOver,
        qteActive, setQteActive,
        feedback, triggerFeedback,
        setStats
    } = useGame();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isGameOverVisible, setIsGameOverVisible] = useState(false);
    const fileInputRef = useRef(null);

    // Show Game Over Overlay when game ends
    React.useEffect(() => {
        if (gameOver) {
            setIsGameOverVisible(true);
        }
    }, [gameOver]);

    const handleSaveGame = async () => {
        await saveGame();
        setIsMenuOpen(false);
    };

    const handleLoadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const success = await loadGame(file);
        if (success) {
            setGameStarted(true);
            setIsMenuOpen(false);
        }

        // Reset input so same file can be selected again if needed
        e.target.value = null;
    };

    // Determine feedback styles
    let wrapperClass = "";
    let overlayClass = "";

    if (lastOutcome === 'SUCCESS') {
        overlayClass = "bg-[radial-gradient(circle_at_center,transparent_20%,rgba(16,185,129,0.4)_100%)] mix-blend-hard-light animate-pulse";
    }
    if (lastOutcome === 'FAILURE') {
        wrapperClass = "animate-shake";
        overlayClass = "bg-[radial-gradient(circle_at_center,transparent_20%,rgba(220,38,38,0.6)_100%)] mix-blend-hard-light";
    }

    return (
        // Apply Theme Data Attribute
        <div className={`flex h-screen bg-transparent relative transition-all duration-300 ${wrapperClass}`} data-theme={theme}>
            <BackgroundLayer />
            <ParticleLayer />
            {/* Feedback Overlay - Sits on top of everything */}
            {lastOutcome && (
                <div className={`absolute inset-0 z-[100] pointer-events-none transition-all duration-300 ${overlayClass}`} />
            )}

            {/* Hidden File Input for Loading */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
            />

            {/* --- QTE OVERLAY --- */}
            {qteActive && (
                <QTEOverlay
                    duration={2000}
                    onComplete={(result) => {
                        if (result === 'success') {
                            triggerFeedback("DODGE SUCCESS!", "text-yellow-400");
                        } else {
                            triggerFeedback("TOO SLOW! -20 HP", "text-red-500");
                            setStats(prev => ({ ...prev, health: Math.max(0, prev.health - 20) }));
                        }
                        setQteActive(false);
                    }}
                />
            )}

            {/* --- FLOATING FEEDBACK --- */}
            {feedback && (
                <div className={`fixed left-1/2 top-1/4 -translate-x-1/2 text-3xl font-black tracking-widest z-[200] animate-float-up ${feedback.color} drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]`}>
                    {feedback.msg}
                </div>
            )}

            <GameOverOverlay
                isVisible={isGameOverVisible}
                onHide={() => setIsGameOverVisible(false)}
            />

            {/* --- GLOBAL MENU OVERLAY --- */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-[55]"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            <GameMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onSave={handleSaveGame}
                onLoad={handleLoadClick}
                onRestart={() => resetGame(gameMode, theme)}
                onExit={() => {
                    quitGame();
                    setGameStarted(false);
                }}
            />

            {/* --- MOBILE OVERLAY --- */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* --- MODE RENDERER --- */}
            {gameMode === 'rpg' ? (
                <RPGMode
                    setGameStarted={setGameStarted}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                    initialData={initialData}
                />
            ) : (
                <StoryMode
                    setGameStarted={setGameStarted}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                />
            )}
        </div>
    );
}
