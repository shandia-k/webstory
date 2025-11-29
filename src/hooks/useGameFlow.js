import { useCallback } from 'react';
import { UI_TEXT } from '../constants/strings';

export function useGameFlow(state, gameProcessor, STORAGE_KEY) {
    const {
        setStats,
        setInventory,
        setQuest,
        setGenre,
        setHistory,
        setGameOver,
        setSummary,
        genre
    } = state;

    const { handleAction } = gameProcessor;

    // --- INITIALIZE GAME (After Character Creation) ---
    const initializeGame = useCallback((characterData) => {
        const { name, role, items } = characterData;

        // Set Initial State from Character Creation
        setStats(role.stats || { health: 100, energy: 100, shield: 0 });
        setInventory(items || []);

        // Save Identity
        if (state.setPlayerName) state.setPlayerName(name);
        if (state.setPlayerRole) state.setPlayerRole(role.name);

        // Save Initial Data for Restart
        if (state.setInitialCharacterData) {
            state.setInitialCharacterData(characterData);
        }

        // Trigger AI Initialization with Character Context
        const initPrompt = `SYSTEM_INIT_GENRE:${genre}|NAME:${name}|ROLE:${role.name}|BIO:${role.description}`;
        handleAction(initPrompt);
    }, [genre, handleAction, setStats, setInventory, state]);

    // --- RESET GAME / RESTART MISSION ---
    const resetGame = useCallback((selectedGenre, isHardReset = false) => {
        // If selectedGenre is an event (from onClick) or undefined, use current genre or default to 'scifi'
        const targetGenre = (typeof selectedGenre === 'string') ? selectedGenre : (genre || 'scifi');

        // Check if we have initial character data to restart the mission properly
        // AND we are NOT doing a hard reset (New Game)
        if (!isHardReset && state.initialCharacterData) {
            setStats({ health: 100, energy: 100, shield: 100 });
            setInventory([]);
            setQuest(UI_TEXT.CONTENT.QUEST_INIT);
            setHistory([]);
            setGameOver(false);
            setGenre(targetGenre);
            setSummary(UI_TEXT.CONTENT.SUMMARY_INIT);

            // Re-initialize with saved character data
            initializeGame(state.initialCharacterData);
        } else {
            // Hard Reset (New Game)
            setStats({ health: 100, energy: 100, shield: 100 });
            setInventory([]);
            setQuest(UI_TEXT.CONTENT.QUEST_INIT);
            setHistory([]);
            setGameOver(false);
            setGenre(targetGenre);
            setSummary(UI_TEXT.CONTENT.SUMMARY_INIT);

            // Clear Initial Data since we are starting fresh
            if (state.setInitialCharacterData) {
                state.setInitialCharacterData(null);
            }
        }
    }, [genre, setStats, setInventory, setQuest, setHistory, setGameOver, setGenre, setSummary, state.initialCharacterData, initializeGame, state]);

    // --- QUIT GAME ---
    const quitGame = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        // Reset local state to defaults
        setStats({ health: 80, energy: 60, shield: 40 });
        setInventory([]);
        setQuest(UI_TEXT.CONTENT.QUEST_DEFAULT);
        setGenre('default'); // Explicitly set to default to show GenreSelection
        setHistory([]);
        setGameOver(false);
        setSummary(UI_TEXT.CONTENT.SUMMARY_INIT);
    }, [STORAGE_KEY, setStats, setInventory, setQuest, setGenre, setHistory, setGameOver, setSummary]);

    return { initializeGame, resetGame, quitGame };
}
