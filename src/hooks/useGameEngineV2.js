import { useState, useCallback, useEffect } from 'react';
import { mockLLM } from '../services/mockLLM';

export function useGameEngineV2() {
    // --- PERSISTENCE ---
    const STORAGE_KEY = 'NEXUS_RPG_V2_STATE';

    // Helper to load state or default
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

    // --- CENTRAL GAME STATE ---
    const [stats, setStats] = useState(() => loadState('stats', {
        health: 80,
        energy: 60,
        shield: 40
    }));

    const [inventory, setInventory] = useState(() => loadState('inventory', [
        { name: "Plasma Cutter", count: 1, tags: ["tool", "heat", "weapon"], type: "tool", icon: "🔫" },
        { name: "Stimpack", count: 3, tags: ["consumable", "heal"], type: "consumable", icon: "💉" },
        { name: "Encrypted Datapad", count: 1, tags: ["intel", "encrypted"], type: "intel", icon: "💾" }
    ]));

    const [quest, setQuest] = useState(() => loadState('quest', "Neon Rain"));
    const [genre, setGenre] = useState(() => loadState('genre', "scifi")); // scifi, horror, romance
    const [lastOutcome, setLastOutcome] = useState(null); // 'SUCCESS', 'FAILURE', 'NEUTRAL'
    const [gameOver, setGameOver] = useState(() => loadState('gameOver', false));
    const [summary, setSummary] = useState(() => loadState('summary', "Simulation initialized."));

    const [history, setHistory] = useState(() => loadState('history', [
        {
            id: 1,
            role: 'system',
            content: 'System initialized • Sector 7',
            timestamp: '00:00'
        },
        {
            id: 2,
            role: 'ai',
            content: 'Hujan neon membasahi jaket sintetikmu. Drone polisi berpatroli di atas, memindai setiap sudut lorong gelap ini.',
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
            content: input.startsWith('inspect:') ? `Memeriksa ${input.split(':')[1]}...` : input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setHistory(prev => [...prev, userMsg]);
        setIsProcessing(true);

        try {
            // 2. Call Mock LLM (Backend Simulation)
            // We pass the current state so the "AI" knows what we have
            // We also pass history, but the LLM will decide whether to use it (On-Demand)
            const gameState = { stats, inventory, quest, history };
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
        setQuest("Initializing...");
        setHistory([]);
        setGameOver(false);
        setGenre(targetGenre);
        setSummary("Simulation initialized.");

        // Trigger initialization via AI
        handleAction(`SYSTEM_INIT_GENRE:${targetGenre}`);
    }, [handleAction, genre]);

    // --- QUIT GAME ---
    const quitGame = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        // Reset local state to defaults (optional, but good for UI consistency if component doesn't unmount)
        setStats({ health: 80, energy: 60, shield: 40 });
        setInventory([]);
        setQuest("Neon Rain");
        setGenre("scifi");
        setHistory([]);
        setGameOver(false);
        setSummary("Simulation initialized.");
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
            console.error("Invalid save file format");
            return false;
        }

        try {
            setStats(data.stats);
            setInventory(data.inventory);
            setQuest(data.quest || "Unknown Mission");
            setGenre(data.genre || "scifi");
            setGameOver(data.gameOver || false);
            setHistory(prev => [
                ...(data.history || []),
                {
                    id: Date.now(),
                    role: 'system',
                    content: 'Game loaded successfully. Type "ringkasan" to view mission progress.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
            setSummary(data.summary || "Simulation restored.");

            // Force update localStorage immediately to ensure persistence works if they reload right after loading
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error("Error importing save:", e);
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
