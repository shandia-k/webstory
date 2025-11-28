import { useGameState } from './useGameState';
import { useGamePersistence } from './useGamePersistence';
import { useGameLogic } from './useGameLogic';

export function useGameEngineV2() {
    // 1. Initialize State
    const gameState = useGameState();
    const { STORAGE_KEY } = gameState;

    // 2. Initialize Persistence (Side Effects)
    const { exportSave, importSave } = useGamePersistence(gameState, STORAGE_KEY);

    // 3. Initialize Logic (Actions)
    const { handleAction, resetGame, quitGame } = useGameLogic(gameState, STORAGE_KEY);

    // 4. Return Unified API
    return {
        // State
        stats: gameState.stats,
        inventory: gameState.inventory,
        quest: gameState.quest,
        history: gameState.history,
        isProcessing: gameState.isProcessing,
        genre: gameState.genre,
        lastOutcome: gameState.lastOutcome,
        gameOver: gameState.gameOver,

        // Actions
        handleAction,
        resetGame,
        setGenre: gameState.setGenre, // Exposed for direct genre switching if needed
        quitGame,

        // Persistence
        exportSave,
        importSave
    };
}
