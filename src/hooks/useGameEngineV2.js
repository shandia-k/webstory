import { useState, useCallback } from 'react';
import { mockLLM } from '../services/mockLLM';

export function useGameEngineV2() {
    // --- CENTRAL GAME STATE ---
    const [stats, setStats] = useState({
        health: 80,
        energy: 60,
        shield: 40
    });

    const [inventory, setInventory] = useState([
        { name: "Plasma Cutter", count: 1, tags: ["tool", "heat", "weapon"], type: "tool", icon: "🔫" },
        { name: "Stimpack", count: 3, tags: ["consumable", "heal"], type: "consumable", icon: "💉" },
        { name: "Encrypted Datapad", count: 1, tags: ["intel", "encrypted"], type: "intel", icon: "💾" }
    ]);

    const [quest, setQuest] = useState("Neon Rain");
    const [genre, setGenre] = useState("scifi"); // scifi, horror, romance
    const [lastOutcome, setLastOutcome] = useState(null); // 'SUCCESS', 'FAILURE', 'NEUTRAL'
    const [gameOver, setGameOver] = useState(false);

    const [history, setHistory] = useState([
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
    ]);

    const [isProcessing, setIsProcessing] = useState(false);

    // --- ACTION HANDLER ---
    const handleAction = useCallback(async (input) => {
        if (!input.trim() || isProcessing || gameOver) return;

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
            const gameState = { stats, inventory, quest };
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
    const resetGame = useCallback((selectedGenre = 'scifi') => {
        setStats({ health: 100, energy: 100, shield: 100 });
        setInventory([]); // Clear first, let AI populate
        setQuest("Initializing...");
        setHistory([]);
        setGameOver(false);
        setGenre(selectedGenre);

        // Trigger initialization via AI
        handleAction(`SYSTEM_INIT_GENRE:${selectedGenre}`);
    }, [handleAction]);

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
        resetGame
    };
}
