import React, { createContext, useContext } from 'react';
import { useGameState } from '../hooks/useGameState';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
    // Directly use the state hook, bypassing the legacy game engine logic
    const gameState = useGameState();

    return (
        <GameContext.Provider value={gameState}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
