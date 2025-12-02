import React, { useState } from 'react';
import { useGame } from './context/GameContext';
import { GenreSelection } from './components/game/genre-selection/GenreSelection';
import { CharacterCreation } from './components/game/character-creation/CharacterCreation';
import { GameBoard } from './components/game/game-board/GameBoard';
import { DebugMenu } from './components/debug/DebugMenu';

export default function App() {
    // Use Context
    const {
        gameMode,
        theme,
        history,
        resetGame,
        initializeGame,
        quitGame,
        uiText
    } = useGame();

    // Ensure UI Text is loaded before rendering
    if (!uiText || !uiText.UI) {
        return <div className="h-screen bg-black text-white flex items-center justify-center">Loading Neural Interface...</div>;
    }

    // Initialize gameStarted to false to always show GenreSelection first
    const [gameStarted, setGameStarted] = useState(false);
    const [newGameData, setNewGameData] = useState(null); // Store data locally to pass via props (avoids Context race condition)

    // Logic to determine if we are in the "New Game" flow (Character Creation)
    // Condition: Game Mode selected (not null) AND History is empty (cleared by resetGame)
    const isNewGameFlow = !gameStarted && gameMode && (!history || history.length === 0);

    return (
        <div
            data-theme={theme}
            className="h-screen bg-theme-main text-theme-text font-sans selection:bg-theme-accent/30 selection:text-theme-accent transition-all duration-300 relative"
        >
            {!gameStarted ? (
                <>
                    {isNewGameFlow ? (
                        <CharacterCreation
                            genre={gameMode || 'rpg'} // Pass gameMode as genre for now (CharacterCreation expects 'genre' prop)
                            theme={theme} // Pass theme as well
                            onComplete={(data) => {
                                initializeGame(data);
                                setNewGameData(data); // Save for prop passing
                                setGameStarted(true);
                            }}
                            onBack={() => {
                                quitGame(); // Reset to selection screen
                            }}
                        />
                    ) : (
                        <GenreSelection
                            onSelect={(mode, theme) => {
                                resetGame(mode, theme, true);
                                // Don't setGameStarted(true) here. 
                                // This triggers re-render, entering isNewGameFlow above.
                            }}
                            onContinue={() => setGameStarted(true)}
                        />
                    )}
                </>
            ) : (
                <GameBoard setGameStarted={setGameStarted} initialData={newGameData} />
            )}

            <DebugMenu />
        </div>
    );
}
