import { useGameState } from './useGameState';
import { useGamePersistence } from './useGamePersistence';
import { useGameLogic } from './useGameLogic';

export function useGameEngineV2() {
    // 1. Initialize State
    const gameState = useGameState();
    const { STORAGE_KEY } = gameState;

    // 2. Initialize Persistence (Side Effects)
    const { exportSave, importSave, saveGame, loadGame } = useGamePersistence(gameState, STORAGE_KEY);

    // 3. Initialize Logic (Actions)
    const { handleAction, resetGame, initializeGame, quitGame, suspenseOutcome, triggerFeedback } = useGameLogic(gameState, STORAGE_KEY);

    // 4. Return Unified API
    return {
        // State
        stats: gameState.stats,
        inventory: gameState.inventory,
        quest: gameState.quest,
        history: gameState.history,
        isProcessing: gameState.isProcessing,
        suspenseOutcome, // Exposed Suspense State
        genre: gameState.genre,
        environment: gameState.environment, // Exposed Dynamic Environment
        lastOutcome: gameState.lastOutcome,
        gameOver: gameState.gameOver,
        choices: gameState.choices,

        // Character Creation State
        playerName: gameState.playerName,
        playerRole: gameState.playerRole,
        setupData: gameState.setupData,
        setSetupData: gameState.setSetupData,
        initialCharacterData: gameState.initialCharacterData,
        setInitialCharacterData: gameState.setInitialCharacterData,

        // Actions
        handleAction,
        resetGame,
        initializeGame,
        setGenre: gameState.setGenre, // Exposed for direct genre switching if needed
        quitGame,

        // Persistence
        exportSave,
        importSave,
        saveGame,
        loadGame,

        // Config
        apiKey: gameState.apiKey,
        setApiKey: gameState.setApiKey,
        language: gameState.language,
        setLanguage: gameState.setLanguage,
        uiText: gameState.uiText,
        updateUiText: gameState.updateUiText,
        isMockMode: gameState.isMockMode,
        setIsMockMode: gameState.setIsMockMode,

        // Debug Helpers (Exposed for DebugMenu)
        setStats: gameState.setStats,
        setInventory: gameState.setInventory,
        setGameOver: gameState.setGameOver,
        setChoices: gameState.setChoices,
        setLastOutcome: gameState.setLastOutcome,

        // Advanced Interactions
        qteActive: gameState.qteActive,
        setQteActive: gameState.setQteActive,
        feedback: gameState.feedback,
        triggerFeedback,
        allowCombo: gameState.allowCombo
    };
}
