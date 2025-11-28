import { useEffect, useCallback } from 'react';
import { UI_TEXT } from '../constants/strings';

export function useGamePersistence(state, STORAGE_KEY) {
    const {
        stats, setStats,
        inventory, setInventory,
        quest, setQuest,
        genre, setGenre,
        gameOver, setGameOver,
        history, setHistory,
        summary, setSummary
    } = state;

    // --- PERSISTENCE EFFECT ---
    // Save state whenever it changes
    useEffect(() => {
        const stateToSave = {
            stats,
            inventory,
            quest,
            genre,
            gameOver,
            history,
            summary
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [stats, inventory, quest, genre, gameOver, history, summary, STORAGE_KEY]);

    // --- SAVE/LOAD SYSTEM ---
    const exportSave = useCallback(() => {
        // Truncate history to last 40 messages to save context window
        const truncatedHistory = history.slice(-40);

        return {
            stats,
            inventory,
            quest,
            genre,
            gameOver,
            history: truncatedHistory,
            summary,
            timestamp: Date.now(),
            version: '2.0.5'
        };
    }, [stats, inventory, quest, genre, gameOver, history, summary]);

    const importSave = useCallback((data) => {
        if (!data || !data.stats || !data.inventory) {
            console.error(UI_TEXT.UI.ERRORS.IMPORT_INVALID);
            return false;
        }

        try {
            setStats(data.stats);
            setInventory(data.inventory);
            setQuest(data.quest || UI_TEXT.UI.ERRORS.UNKNOWN_MISSION);
            setGenre(data.genre || UI_TEXT.FIXED.GENRE_DEFAULT);
            setGameOver(data.gameOver || false);
            setHistory(prev => [
                ...(data.history || []),
                {
                    id: Date.now(),
                    role: 'system',
                    content: UI_TEXT.CONTENT.LOAD_SUCCESS_MSG,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    action: 'ringkasan',
                    actionLabel: UI_TEXT.UI.BUTTON_SUMMARY
                }
            ]);
            setSummary(data.summary || UI_TEXT.CONTENT.SUMMARY_RESTORED);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error(UI_TEXT.UI.ERRORS.IMPORT_ERROR, e);
            return false;
        }
    }, [setStats, setInventory, setQuest, setGenre, setGameOver, setHistory, setSummary, STORAGE_KEY]);

    return { exportSave, importSave };
}
