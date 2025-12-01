import React, { useState } from 'react';
import { useGame } from './context/GameContext';
import { GenreSelection } from './components/game/genre-selection/GenreSelection';
import { CharacterCreation } from './components/game/character-creation/CharacterCreation';
import { GameBoard } from './components/game/game-board/GameBoard';
import { DebugMenu } from './components/debug/DebugMenu';
import { TestPage } from './components/testing/TestPage';

export default function App() {
    // Use Context
    const {
        genre,
        history,
        resetGame,
        initializeGame,
        uiText
    } = useGame();

    // Ensure UI Text is loaded before rendering
    if (!uiText || !uiText.UI) {
        return <div className="h-screen bg-black text-white flex items-center justify-center">Loading Neural Interface...</div>;
    }

    // Initialize gameStarted to false to always show GenreSelection first
    const [gameStarted, setGameStarted] = useState(false);
    const [showTestLab, setShowTestLab] = useState(false);
    const [useRealAI, setUseRealAI] = useState(false);
    const [isTestMode, setIsTestMode] = useState(false);
    const [testCharacterData, setTestCharacterData] = useState(null);

    // Logic to determine if we are in the "New Game" flow (Character Creation)
    // Condition: Genre selected (not default) AND History is empty (cleared by resetGame)
    const isNewGameFlow = !gameStarted && genre && genre !== 'default' && (!history || history.length === 0);

    if (showTestLab) {
        return (
            <TestPage
                onBack={() => {
                    setShowTestLab(false);
                    setIsTestMode(false);
                    setTestCharacterData(null);
                }}
                useRealAI={useRealAI}
                initialData={testCharacterData}
            />
        );
    }

    return (
        <div
            data-theme={genre}
            className="h-screen bg-theme-main text-theme-text font-sans selection:bg-theme-accent/30 selection:text-theme-accent transition-all duration-300 relative"
        >
            {!gameStarted ? (
                <>
                    {isNewGameFlow || isTestMode ? (
                        <CharacterCreation
                            genre={genre || 'scifi'} // Default to scifi for test mode if undefined
                            isTestMode={isTestMode}
                            onComplete={(data) => {
                                if (isTestMode) {
                                    setTestCharacterData(data);
                                    setShowTestLab(true);
                                } else {
                                    initializeGame(data);
                                    setGameStarted(true);
                                }
                            }}
                            onBack={() => {
                                if (isTestMode) {
                                    setIsTestMode(false);
                                } else {
                                    resetGame('default');
                                }
                            }}
                        />
                    ) : (
                        <GenreSelection
                            onSelect={(g) => {
                                resetGame(g, true);
                                // Don't setGameStarted(true) here. 
                                // This triggers re-render, entering isNewGameFlow above.
                            }}
                            onContinue={() => setGameStarted(true)}
                        />
                    )}

                    {/* Test Lab Controls */}
                    {!isNewGameFlow && !isTestMode && (
                        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-4 bg-slate-900/80 backdrop-blur p-2 rounded-lg border border-slate-700">
                            {/* AI Toggle */}
                            <button
                                onClick={() => setUseRealAI(!useRealAI)}
                                className={`
                                    flex items-center gap-2 px-3 py-1 rounded border text-xs font-bold transition-all
                                    ${useRealAI
                                        ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                                        : 'bg-slate-800/50 border-slate-600 text-slate-500'
                                    }
                                `}
                            >
                                <div className={`w-2 h-2 rounded-full ${useRealAI ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                                {useRealAI ? "REAL AI" : "MOCK AI"}
                            </button>

                            {/* Enter Lab Button */}
                            <button
                                onClick={() => {
                                    if (useRealAI) {
                                        setIsTestMode(true);
                                    } else {
                                        setShowTestLab(true);
                                    }
                                }}
                                className="px-3 py-1 bg-slate-800 border border-slate-600 text-slate-400 text-xs rounded hover:bg-slate-700 hover:text-white transition-colors"
                            >
                                ENTER TEST LAB
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <GameBoard setGameStarted={setGameStarted} />
            )}

            <DebugMenu />
        </div>
    );
}
