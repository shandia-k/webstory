import React, { useState, useRef } from 'react';
import { useGame } from './context/GameContext';
import { UI_TEXT } from './constants/strings';
import { GenreSelection } from './components/game/GenreSelection';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NarrativeFeed } from './components/game/NarrativeFeed';
import { InputArea } from './components/game/InputArea';
import { GameOverOverlay } from './components/game/GameOverOverlay';
import { saveGameToFile, parseSaveFile } from './utils/fileHandler';

export default function App() {
    // Default open
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Use Context
    const {
        stats,
        inventory,
        quest,
        history,
        isProcessing,
        handleAction,
        genre,
        lastOutcome,
        gameOver,
        resetGame,
        quitGame,
        exportSave,
        importSave
    } = useGame();

    // Initialize gameStarted based on history (persistence check)
    const [gameStarted, setGameStarted] = useState(() => history.length > 0);
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


    // --- SAVE / LOAD HANDLERS ---
    const handleSaveGame = async () => {
        try {
            const data = exportSave();
            await saveGameToFile(data);
        } catch (err) {
            console.error('Failed to save game:', err);
            alert(UI_TEXT.UI.ERRORS.SAVE_FAILED);
        } finally {
            setIsMenuOpen(false);
        }
    };

    const handleLoadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const data = await parseSaveFile(file);
            const success = importSave(data);
            if (success) {
                setGameStarted(true);
                setIsMenuOpen(false);
            } else {
                alert(UI_TEXT.UI.ERRORS.LOAD_INVALID);
            }
        } catch (err) {
            console.error("Failed to parse save file", err);
            alert(UI_TEXT.UI.ERRORS.LOAD_ERROR);
        }

        // Reset input so same file can be selected again if needed
        e.target.value = null;
    };

    // Determine feedback styles
    let feedbackClass = "";
    if (lastOutcome === 'SUCCESS') feedbackClass = "ring-4 ring-emerald-500/50 bg-emerald-500/20";
    if (lastOutcome === 'FAILURE') feedbackClass = "ring-4 ring-red-500/50 bg-red-500/20 animate-shake";

    return (
        <div
            data-theme={genre}
            className={`flex h-screen bg-theme-main text-theme-text font-sans selection:bg-theme-accent/30 selection:text-theme-accent transition-all duration-300 ${feedbackClass}`}
        >
            {/* Hidden File Input for Loading */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
            />

            {!gameStarted ? (
                <GenreSelection onSelect={(g) => {
                    resetGame(g);
                    setGameStarted(true);
                }} />
            ) : (
                <>
                    <GameOverOverlay />

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
                </>
            )}
        </div>
    );
}
