import { useState, useEffect, useCallback } from 'react';
import { mockLLM } from '../services/mockLLM';
import { UI_TEXT } from '../constants/strings';

const STORAGE_KEY = 'nexus_rpg_save_v2';

// Helper to load initial state (lazy initialization)
const loadState = (key, fallback) => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed[key] !== undefined ? parsed[key] : fallback;
        }
    } catch (e) {
        console.error("Failed to load state", e);
    }
    return fallback;
};

export function useGameEngineV2() {
    // --- CORE STATE ---
    const [stats, setStats] = useState(() => loadState('stats', { health: 100, energy: 100, shield: 100 }));
    const [inventory, setInventory] = useState(() => loadState('inventory', [
        { name: "Plasma Cutter", count: 1, tags: ["tool", "heat", "weapon"], type: "tool", icon: "🔫" },
        { name: "Stimpack", count: 3, tags: ["consumable", "heal"], type: "consumable", icon: "💉" },
        { name: "Encrypted Datapad", count: 1, tags: ["intel", "encrypted"], type: "intel", icon: "💾" }
    ]));

    const [quest, setQuest] = useState(() => loadState('quest', UI_TEXT.CONTENT.QUEST_DEFAULT));
    const [genre, setGenre] = useState(() => loadState('genre', UI_TEXT.FIXED.GENRE_DEFAULT)); // scifi, horror, romance
    const [lastOutcome, setLastOutcome] = useState(null); // 'SUCCESS', 'FAILURE', 'NEUTRAL'
    const [gameOver, setGameOver] = useState(() => loadState('gameOver', false));
    const [summary, setSummary] = useState(() => loadState('summary', UI_TEXT.CONTENT.SUMMARY_INIT));

    const [history, setHistory] = useState(() => loadState('history', [
        {
            id: 1,
            role: 'system',
            content: UI_TEXT.CONTENT.HISTORY_SYSTEM_INIT,
            timestamp: '00:00'
        },
        {
            id: 2,
            role: 'ai',
            content: UI_TEXT.CONTENT.HISTORY_AI_INIT,
            timestamp: '00:01'
        }
    ]));

    const [isProcessing, setIsProcessing] = useState(false);

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
    }, [stats, inventory, quest, genre, gameOver, history, summary]);

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
        setIsProcessing(true);

        try {
            // 2. Call Mock LLM (Backend Simulation)
            // We pass the current state so the "AI" knows what we have
            // We also pass history, but the LLM will decide whether to use it (On-Demand)
            const gameState = { stats, inventory, quest, history, summary };
            const response = await mockLLM(input, gameState);

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
                setStats(prev => {
                    const newStats = { ...prev };
                    Object.entries(response.stat_updates).forEach(([key, val]) => {
                        if (newStats[key] !== undefined) {
                            newStats[key] = Math.max(0, Math.min(100, newStats[key] + val));
                        }
                    });

                    // Check for Death (Generic: if any stat named 'health' drops to 0)
                    if (newStats.health !== undefined && newStats.health <= 0) {
                        setGameOver(true);
                    }

                    return newStats;
                });
            }

            // Update Inventory
            if (response.inventory_updates) {
                setInventory(prev => {
                    let newInv = [...prev];

                    // Handle Adds
                    if (response.inventory_updates.add) {
                        response.inventory_updates.add.forEach(item => {
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
                    if (response.inventory_updates.remove) {
                        response.inventory_updates.remove.forEach(nameToRemove => {
                            const idx = newInv.findIndex(i => i.name === nameToRemove);
                            if (idx !== -1) {
                                if (newInv[idx].count > 1) newInv[idx].count--;
                                else newInv.splice(idx, 1);
                            }
                        });
                    }
                    return newInv;
                });
            }

            // Handle SET (New for Initialization)
            if (response.inventory_set) {
                setInventory(response.inventory_set);
            }

            // Update Quest
            if (response.quest_update) {
                setQuest(response.quest_update);
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

        } catch (error) {
            console.error("LLM Error:", error);
            setHistory(prev => [...prev, {
                id: Date.now() + 2,
                role: 'system',
                content: 'Error: Connection to Neural Link lost.',
                timestamp: new Date().toLocaleTimeString()
            }]);
        } finally {
            setIsProcessing(false);
        }
    }, [stats, inventory, quest, isProcessing, gameOver]);

    // --- RESET GAME ---
    const resetGame = useCallback((selectedGenre) => {
        // If selectedGenre is an event (from onClick) or undefined, use current genre or default to 'scifi'
        const targetGenre = (typeof selectedGenre === 'string') ? selectedGenre : (genre || 'scifi');

        setStats({ health: 100, energy: 100, shield: 100 });
        setInventory([]); // Clear first, let AI populate
        setQuest(UI_TEXT.CONTENT.QUEST_INIT);
        setHistory([]);
        setGameOver(false);
        setGenre(targetGenre);
        setSummary(UI_TEXT.CONTENT.SUMMARY_INIT);

        // Trigger initialization via AI
        handleAction(`SYSTEM_INIT_GENRE:${targetGenre}`);
    }, [handleAction, genre]);

    // --- QUIT GAME ---
    const quitGame = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        // Reset local state to defaults (optional, but good for UI consistency if component doesn't unmount)
        setStats({ health: 80, energy: 60, shield: 40 });
        setInventory([]);
        setQuest(UI_TEXT.CONTENT.QUEST_DEFAULT);
        setGenre(UI_TEXT.FIXED.GENRE_DEFAULT);
        setHistory([]);
        setGameOver(false);
        setSummary(UI_TEXT.CONTENT.SUMMARY_INIT);
    }, []);

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
    }, []);

    return {
        stats,
        inventory,
        quest,
        history,
        isProcessing,
        handleAction,
        genre,
        setGenre,
        lastOutcome,
        gameOver,
        resetGame,
        quitGame,
        exportSave,
        importSave
    };
}
