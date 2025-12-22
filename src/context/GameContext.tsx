import React, { createContext, useContext, ReactNode } from 'react';
import { useGameState } from '../hooks/useGameState';

// Derive the context type from the return value of useGameState
type GameContextType = ReturnType<typeof useGameState>;

const GameContext = createContext<GameContextType | null>(null);

interface GameProviderProps {
    children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
    // Directly use the state hook, bypassing the legacy game engine logic
    const gameState = useGameState();

    return (
        <GameContext.Provider value={gameState}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = (): GameContextType => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};

