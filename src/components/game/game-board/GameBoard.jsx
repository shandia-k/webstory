import React, { useState, useRef } from 'react';
import { useGame } from '../../../context/GameContext';
import { Sidebar } from './sidebar/Sidebar';
import { Header } from './header/Header';
import { NarrativeFeed } from './narrative-feed/NarrativeFeed';
import { InputArea } from './input-area/InputArea';
import { GameOverOverlay } from './GameOverOverlay';

export function GameBoard({ setGameStarted }) {
    const {
        handleAction,
        saveGame,
        loadGame,
        lastOutcome,
        quitGame,
        resetGame,
        genre
    } = useGame();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [inputValue, setInputValue] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const fileInputRef = useRef(null);

    const handleSend = (action) => {
        const input = typeof action === 'string' ? action : inputValue;
        if (input.trim()) {
            handleAction(input);
            setInputValue("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

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
    // Determine feedback styles
    let wrapperClass = "";
    let overlayClass = "";

    if (lastOutcome === 'SUCCESS') {
        // Cinematic Emerald Vignette with subtle pulse
        overlayClass = "bg-[radial-gradient(circle_at_center,transparent_20%,rgba(16,185,129,0.4)_100%)] mix-blend-hard-light animate-pulse";
    }
    if (lastOutcome === 'FAILURE') {
        // Cinematic Red Vignette (Damage Effect)
        wrapperClass = "animate-shake";
        overlayClass = "bg-[radial-gradient(circle_at_center,transparent_20%,rgba(220,38,38,0.5)_100%)] mix-blend-multiply";
    }

    return (
        <div className={`flex h-screen bg-transparent relative transition-all duration-300 ${wrapperClass}`}>
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

            <GameOverOverlay />

            {/* --- GLOBAL MENU OVERLAY --- */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-[55]"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* --- MOBILE OVERLAY --- */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col min-w-0 bg-transparent relative transition-colors duration-500">

                <Header
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                    handleSaveGame={handleSaveGame}
                    handleLoadClick={handleLoadClick}
                    setGameStarted={setGameStarted}
                />

                <NarrativeFeed handleSend={handleSend} />

                <InputArea
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    handleSend={handleSend}
                    handleKeyDown={handleKeyDown}
                />

            </main>
        </div>
    );
}
