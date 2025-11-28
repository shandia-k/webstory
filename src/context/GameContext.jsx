import React, { createContext, useContext } from 'react';
import { useGameEngineV2 } from '../hooks/useGameEngineV2';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
    const gameState = useGameEngineV2();

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
