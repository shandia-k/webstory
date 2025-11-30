import { useCallback, useState } from 'react';
import { generateGameResponse } from '../services/llmService';
import { UI_TEXT } from '../constants/strings';
import { SLASH_COMMANDS } from '../constants/slashCommands';
import { calculateNewStats } from '../utils/gameUtils';

export function useGameLogic(state, STORAGE_KEY) {
    const {
        stats, setStats,
        inventory, setInventory,
        quest, setQuest,
        genre, setGenre,
        environment, setEnvironment,
        gameOver, setGameOver,
        history, setHistory,
        summary, setSummary,
        isProcessing, setIsProcessing,
        setLastOutcome,
        apiKey, // Get API Key from state
        language, // Get Language from state
        setChoices, // Set Choices state
        isMockMode, // Get Mock Mode from state
        qteActive, setQteActive,
        feedback, setFeedback,
        allowCombo, setAllowCombo
    } = state;

    // --- SUSPENSE STATE ---
    const [suspenseOutcome, setSuspenseOutcome] = useState(null);

    // --- HELPER: UPDATE STATS ---
    const updateStats = useCallback((updates) => {
        setStats(prev => {
            const newStats = calculateNewStats(prev, updates);

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
        if (!input.trim() || isProcessing || suspenseOutcome || (gameOver && !isInit)) return;

        // 1. Add User Message
        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: input.startsWith('inspect:')
                ? UI_TEXT.UI.TEMPLATES.ACTION_INSPECT.replace('{0}', input.split(':')[1])
                : input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Only add to history if NOT an initialization command
        if (!isInit) {
            setHistory(prev => [...prev, userMsg]);
        }
        setChoices([]); // Clear choices immediately
        setIsProcessing(true);

        try {
            // 2. Call Real LLM (or Fallback if Init)
            const gameState = { stats, inventory, quest, history, summary, genre, language, isMockMode };

            // Check for API Key if not init AND not in Mock Mode
            if (!isInit && !apiKey && !isMockMode) {
                throw new Error("API_KEY_MISSING");
            }

            // Handle Mock Delay
            if (isMockMode && input.toLowerCase().includes('mock:delay')) {
                await new Promise(r => setTimeout(r, 3000));
            }

            // --- SLASH COMMAND OVERRIDE ---
            let finalPrompt = input;
            const lowerInput = input.trim().toLowerCase();
            if (SLASH_COMMANDS[lowerInput]) {
                console.log(`Executing Slash Command: ${lowerInput}`);
                finalPrompt = SLASH_COMMANDS[lowerInput];
            }

            const response = await generateGameResponse(apiKey, finalPrompt, gameState);
            console.log("LLM Raw Response:", response); // DEBUG LOG

            // 3. Process JSON Response

            // --- SUSPENSE PHASE ---
            setIsProcessing(false); // Stop "Rolling..."
            const outcome = response.outcome || 'NEUTRAL';
            setSuspenseOutcome(outcome); // Show Result (Success/Fail/Neutral)

            // Wait for suspense animation (1.5s)
            await new Promise(r => setTimeout(r, 1500));

            setSuspenseOutcome(null); // Hide Loader

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

            // Update Environment (Dynamic Atmosphere)
            if (response.environment_tags && response.environment_tags.length > 0) {
                console.log("Environment Tags Detected:", response.environment_tags); // DEBUG LOG
                // Take the first valid tag as the primary environment
                setEnvironment(response.environment_tags[0]);
            } else {
                console.log("No Environment Tags in Response"); // DEBUG LOG
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
                visual_effect: response.visual_effect || null, // Capture Dynamic CSS
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setHistory(prev => [...prev, aiMsg]);

            // Update Choices (Dynamic Actions)
            if (response.choices && Array.isArray(response.choices)) {
                setChoices(response.choices);
            } else {
                setChoices([]); // Clear if no choices provided
            }

            // Update Combo State
            if (response.allow_combo) {
                setAllowCombo(true);
                triggerFeedback("COMBO UNLOCKED!", "text-cyan-400");
            } else {
                setAllowCombo(false);
            }

        } catch (error) {
            console.error("LLM Error:", error);
            setIsProcessing(false);
            setSuspenseOutcome(null);

            let errorMessage = `Error: Connection to Neural Link lost. (${error.message})`;
            if (error.message === 'API_KEY_MISSING') {
                errorMessage = 'SYSTEM ERROR: API Key Missing. Please configure it in Settings.';
            }

            setHistory(prev => [...prev, {
                id: Date.now() + 2,
                role: 'system',
                content: errorMessage,
                timestamp: new Date().toLocaleTimeString()
            }]);
        }
    }, [stats, inventory, quest, isProcessing, suspenseOutcome, gameOver, history, summary, setHistory, setIsProcessing, setLastOutcome, setStats, setInventory, setQuest, setGameOver, apiKey, genre, updateStats, updateInventory, isMockMode, language]);

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

    // --- HELPER: TRIGGER FEEDBACK ---
    const triggerFeedback = useCallback((msg, color = "text-blue-400") => {
        setFeedback({ msg, color });
        setTimeout(() => setFeedback(null), 2000);
    }, [setFeedback]);

    return { handleAction, resetGame, initializeGame, quitGame, suspenseOutcome, qteActive, setQteActive, feedback, triggerFeedback };
}
