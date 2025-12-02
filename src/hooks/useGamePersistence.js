import { useEffect, useCallback } from 'react';
import { UI_TEXT } from '../constants/strings';
import { saveGameToFile, parseSaveFile } from '../utils/fileHandler';

export function useGamePersistence(state, STORAGE_KEY) {
    const {
        stats, setStats,
        statDefinitions, setStatDefinitions,
        inventory, setInventory,
        quest, setQuest,
        gameMode, setGameMode,
        theme, setTheme,
        rpgState, setRpgState,
        gameOver, setGameOver,
        history, setHistory,
        summary, setSummary
    } = state;

    // --- PERSISTENCE EFFECT ---
    // Save state whenever it changes
    useEffect(() => {
        const stateToSave = {
            stats,
            statDefinitions,
            inventory,
            quest,
            gameMode,
            theme,
            rpgState,
            gameOver,
            history,
            summary
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [stats, statDefinitions, inventory, quest, gameMode, theme, rpgState, gameOver, history, summary, STORAGE_KEY]);

    // --- SAVE/LOAD SYSTEM ---
    const exportSave = useCallback(() => {
        // Truncate history to last 40 messages to save context window
        const truncatedHistory = history.slice(-40);

        return {
            stats,
            statDefinitions,
            inventory,
            quest,
            gameMode,
            theme,
            rpgState,
            gameOver,
            history: truncatedHistory,
            summary,
            timestamp: Date.now(),
            version: UI_TEXT.FIXED.APP_VERSION
        };
    }, [stats, statDefinitions, inventory, quest, gameMode, theme, rpgState, gameOver, history, summary]);

    const importSave = useCallback((data) => {
        if (!data || !data.stats || !data.inventory) {
            console.error(UI_TEXT.UI.ERRORS.IMPORT_INVALID);
            return false;
        }

        try {
            setStats(data.stats);
            if (data.statDefinitions && setStatDefinitions) setStatDefinitions(data.statDefinitions);
            setInventory(data.inventory);
            setQuest(data.quest || UI_TEXT.UI.ERRORS.UNKNOWN_MISSION);
            setGameMode(data.gameMode || 'rpg');
            setTheme(data.theme || 'scifi');
            if (data.rpgState) setRpgState(data.rpgState);
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
    }, [setStats, setStatDefinitions, setInventory, setQuest, setGameMode, setTheme, setRpgState, setGameOver, setHistory, setSummary, STORAGE_KEY]);

    const saveGame = useCallback(async () => {
        try {
            const data = exportSave();
            await saveGameToFile(data);
            return true;
        } catch (err) {
            console.error('Failed to save game:', err);
            alert(UI_TEXT.UI.ERRORS.SAVE_FAILED);
            return false;
        }
    }, [exportSave]);

    const loadGame = useCallback(async (file) => {
        if (!file) return false;

        try {
            const data = await parseSaveFile(file);
            const success = importSave(data);
            if (!success) {
                alert(UI_TEXT.UI.ERRORS.LOAD_INVALID);
            }
            return success;
        } catch (err) {
            console.error("Failed to parse save file", err);
            alert(UI_TEXT.UI.ERRORS.LOAD_ERROR);
            return false;
        }
    }, [importSave]);

    return { exportSave, importSave, saveGame, loadGame };
}
