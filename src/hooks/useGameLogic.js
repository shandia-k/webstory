import { useCallback } from 'react';
import { generateGameResponse } from '../services/llmService';
import { UI_TEXT } from '../constants/strings';

export function useGameLogic(state, STORAGE_KEY) {
    const {
        stats, setStats,
        inventory, setInventory,
        quest, setQuest,
        genre, setGenre,
        gameOver, setGameOver,
        history, setHistory,
        summary, setSummary,
        isProcessing, setIsProcessing,
        setLastOutcome,
        apiKey, // Get API Key from state
        language, // Get Language from state
        setChoices // Set Choices state
    } = state;

    // --- HELPER: UPDATE STATS ---
    const updateStats = useCallback((updates) => {
        setStats(prev => {
            const newStats = { ...prev };
            Object.entries(updates).forEach(([key, val]) => {
                if (newStats[key] !== undefined) {
                    newStats[key] = Math.max(0, Math.min(100, newStats[key] + val));
                }
            });

            // Check for Death
            if (newStats.health !== undefined && newStats.health <= 0) {
                setGameOver(true);
            }

            return newStats;
        });
    }, [setStats, setGameOver]);

    // --- HELPER: UPDATE INVENTORY ---
    const updateInventory = useCallback((updates) => {
        setInventory(prev => {
            let newInv = [...prev];

            // Handle Adds
            if (updates.add) {
                updates.add.forEach(item => {
                    const existing = newInv.find(i => i.name === item.name);
                    if (existing) existing.count++;
                    else newInv.push({
                        name: item.name,
                        count: 1,
                        tags: item.tags || [],
                        type: item.type || 'misc',
                        icon: item.icon || '📦'
                    });
                });
            }

            // Handle Removes
            if (updates.remove) {
                updates.remove.forEach(nameToRemove => {
                    const idx = newInv.findIndex(i => i.name === nameToRemove);
                    if (idx !== -1) {
                        if (newInv[idx].count > 1) newInv[idx].count--;
                        else newInv.splice(idx, 1);
                    }
                });
            }
            return newInv;
        });
    }, [setInventory]);

    // --- ACTION HANDLER ---
    const handleAction = useCallback(async (input) => {
        // Allow initialization even if gameOver is true
        const isInit = input.startsWith('SYSTEM_INIT_GENRE:');
        if (!input.trim() || isProcessing || (gameOver && !isInit)) return;

        // 1. Add User Message
        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: input.startsWith('inspect:')
                ? UI_TEXT.UI.TEMPLATES.ACTION_INSPECT.replace('{0}', input.split(':')[1])
                : input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setHistory(prev => [...prev, userMsg]);
        setChoices([]); // Clear choices immediately
        setIsProcessing(true);

        try {
            // 2. Call Real LLM (or Fallback if Init)
            const gameState = { stats, inventory, quest, history, summary, genre, language };

            // Check for API Key if not init
            if (!isInit && !apiKey) {
                throw new Error("API_KEY_MISSING");
            }

            const response = await generateGameResponse(apiKey, input, gameState);

            // 3. Process JSON Response

            // Handle Outcome (Visual Feedback)
            if (response.outcome && response.outcome !== 'NEUTRAL') {
                setLastOutcome(response.outcome);
                setTimeout(() => setLastOutcome(null), 1000); // Reset after 1s
            }

            // Handle SET Stats (New for Initialization)
            if (response.stats_set) {
                setStats(response.stats_set);
            }

            // Update Stats (Incremental)
            if (response.stat_updates) {
                updateStats(response.stat_updates);
            }

            // Update Inventory
            if (response.inventory_updates) {
                updateInventory(response.inventory_updates);
            }

            // Handle SET (New for Initialization)
            if (response.inventory_set) {
                setInventory(response.inventory_set);
            }

            // Update Quest
            if (response.quest_update) {
                setQuest(response.quest_update);
            }

            // Update Summary (New)
            if (response.summary_update) {
                setSummary(prev => {
                    // Avoid duplicate summaries
                    if (prev.includes(response.summary_update)) return prev;
                    return prev + " " + response.summary_update;
                });
            }

            // Check Explicit Game Over
            if (response.game_over) {
                setGameOver(true);
            }

            // Add AI Narrative
            const aiMsg = {
                id: Date.now() + 1,
                role: 'ai',
                content: response.narrative,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setHistory(prev => [...prev, aiMsg]);

            // Update Choices (Dynamic Actions)
            if (response.choices && Array.isArray(response.choices)) {
                setChoices(response.choices);
            } else {
                setChoices([]); // Clear if no choices provided
            }

        } catch (error) {
            console.error("LLM Error:", error);

            let errorMessage = 'Error: Connection to Neural Link lost.';
            if (error.message === 'API_KEY_MISSING') {
                errorMessage = 'SYSTEM ERROR: API Key Missing. Please configure it in Settings.';
            }

            setHistory(prev => [...prev, {
                id: Date.now() + 2,
                role: 'system',
                content: errorMessage,
                timestamp: new Date().toLocaleTimeString()
            }]);
        } finally {
            setIsProcessing(false);
        }
    }, [stats, inventory, quest, isProcessing, gameOver, history, summary, setHistory, setIsProcessing, setLastOutcome, setStats, setInventory, setQuest, setGameOver, apiKey, genre, updateStats, updateInventory]);

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

    return { handleAction, resetGame, initializeGame, quitGame };
}
