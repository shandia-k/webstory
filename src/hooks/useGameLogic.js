import { useCallback } from 'react';
import { mockLLM } from '../services/mockLLM';
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
        setLastOutcome
    } = state;

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
    }, [stats, inventory, quest, isProcessing, gameOver, history, summary, setHistory, setIsProcessing, setLastOutcome, setStats, setInventory, setQuest, setGameOver]);

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
    }, [handleAction, genre, setStats, setInventory, setQuest, setHistory, setGameOver, setGenre, setSummary]);

    // --- QUIT GAME ---
    const quitGame = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        // Reset local state to defaults
        setStats({ health: 80, energy: 60, shield: 40 });
        setInventory([]);
        setQuest(UI_TEXT.CONTENT.QUEST_DEFAULT);
        setGenre(UI_TEXT.FIXED.GENRE_DEFAULT);
        setHistory([]);
        setGameOver(false);
        setSummary(UI_TEXT.CONTENT.SUMMARY_INIT);
    }, [STORAGE_KEY, setStats, setInventory, setQuest, setGenre, setHistory, setGameOver, setSummary]);

    return { handleAction, resetGame, quitGame };
}
