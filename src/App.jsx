import React, { useState, useRef } from 'react';
import { useGameEngineV2 } from './hooks/useGameEngineV2';
import { UI_TEXT } from './constants/strings';
import { GenreSelection } from './components/GenreSelection';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NarrativeFeed } from './components/NarrativeFeed';
import { InputArea } from './components/InputArea';
import { GameOverOverlay } from './components/GameOverOverlay';

export default function App() {
    // Default open
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Use the new V2 Engine
    const {
        stats,
        inventory,
        quest,
        history,
        isProcessing,
        handleAction,
        genre,
        lastOutcome, // SUCCESS, FAILURE, or null
        gameOver,
        resetGame,
        setGenre,
        quitGame,
        exportSave,
        importSave
    } = useGameEngineV2();

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
        const data = exportSave();
        const jsonString = JSON.stringify(data, null, 2);
        const fileName = `nexus_save_${new Date().toISOString().slice(0, 10)}.json`;

        try {
            // Try File System Access API (Modern Browsers)
            if ('showSaveFilePicker' in window) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'Nexus RPG Save File',
                        accept: { 'application/json': ['.json'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(jsonString);
                await writable.close();
            } else {
                // Fallback for browsers that don't support the API
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            // Ignore abort errors (user cancelled)
            if (err.name !== 'AbortError') {
                console.error('Failed to save game:', err);
                alert(UI_TEXT.UI.ERRORS.SAVE_FAILED);
            }
        } finally {
            setIsMenuOpen(false);
        }
    };

    const handleLoadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
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
        };
        reader.readAsText(file);
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
                    <GameOverOverlay
                        gameOver={gameOver}
                        resetGame={resetGame}
                        genre={genre}
                    />

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
                        stats={stats}
                        inventory={inventory}
                        handleAction={handleAction}
                    />

                    {/* --- MAIN CONTENT --- */}
                    <main className="flex-1 flex flex-col min-w-0 bg-transparent relative transition-colors duration-500">

                        <Header
                            isSidebarOpen={isSidebarOpen}
                            setIsSidebarOpen={setIsSidebarOpen}
                            quest={quest}
                            isMenuOpen={isMenuOpen}
                            setIsMenuOpen={setIsMenuOpen}
                            handleSaveGame={handleSaveGame}
                            handleLoadClick={handleLoadClick}
                            resetGame={resetGame}
                            genre={genre}
                            quitGame={quitGame}
                            setGameStarted={setGameStarted}
                        />

                        <NarrativeFeed
                            history={history}
                            isProcessing={isProcessing}
                            handleSend={handleSend}
                        />

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
