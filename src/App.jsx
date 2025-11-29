import React, { useState } from 'react';
import { useGame } from './context/GameContext';
import { GenreSelection } from './components/game/genre-selection/GenreSelection';
import { CharacterCreation } from './components/game/character-creation/CharacterCreation';
import { GameBoard } from './components/game/game-board/GameBoard';
import { DebugMenu } from './components/debug/DebugMenu';

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

    // Logic to determine if we are in the "New Game" flow (Character Creation)
    // Condition: Genre selected (not default) AND History is empty (cleared by resetGame)
    const isNewGameFlow = !gameStarted && genre && genre !== 'default' && (!history || history.length === 0);

    return (
        <div
            data-theme={genre}
            className="h-screen bg-theme-main text-theme-text font-sans selection:bg-theme-accent/30 selection:text-theme-accent transition-all duration-300"
        >
            {!gameStarted ? (
                isNewGameFlow ? (
                    <CharacterCreation
                        genre={genre}
                        onComplete={(data) => {
                            initializeGame(data);
                            setGameStarted(true);
                        }}
                        onBack={() => resetGame('default')}
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
                )
            ) : (
                <GameBoard setGameStarted={setGameStarted} />
            )}

            <DebugMenu />
        </div>
    );
}
