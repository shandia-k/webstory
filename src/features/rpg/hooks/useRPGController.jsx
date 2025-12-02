import { useState, useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { generateGameResponse, generateSector } from '../../../services/llmService';
import { Terminal, Wifi, Cpu, FileText, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Search, Hand, Sword, Shield, Box } from 'lucide-react';

export function useRPGController(initialData = null) {
    const { apiKey, language, theme, gameMode, rpgState, setRpgState, inventory, setInventory } = useGame();

    // Enforce Real AI - No Mock Fallback
    // If no API key, the LLM service will throw an error, which we catch and log.

    const [isProcessing, setIsProcessing] = useState(false);
    const [feed, setFeed] = useState([
        { id: 1, content: "Initializing Neural Link...", role: "system", timestamp: "00:00:00" }
    ]);

    const [isInspecting, setIsInspecting] = useState(false);
    const [choices, setChoices] = useState([]);
    const [inputValue, setInputValue] = useState("");

    // Helper to add log
    const addLog = (text, role = "system") => {
        setFeed(prev => [...prev, {
            id: Date.now() + Math.random(),
            content: text,
            role: role.toLowerCase(),
            timestamp: new Date().toLocaleTimeString()
        }]);
    };

    // Helper to update RPG State
    const updateRpgState = (updates) => {
        setRpgState(prev => ({ ...prev, ...updates }));
    };

    // --- INITIALIZATION ---
    useEffect(() => {
        const initRealAI = async () => {
            if (!apiKey) {
                addLog("CRITICAL ERROR: API Key missing. Cannot initialize Live AI.", "SYSTEM");
                return;
            }

            // Check if we have existing state to resume
            // BUT ONLY if we are NOT starting a fresh game with new initialData
            if (!initialData && rpgState.currentRoomId && rpgState.roomRegistry && rpgState.roomRegistry[rpgState.currentRoomId]) {
                addLog("Resuming simulation...", "SYSTEM");
                // Restore feed or context if needed?
                // For now, we just resume the room state.
                const currentRoom = rpgState.roomRegistry[rpgState.currentRoomId];
                if (currentRoom.description) addLog(currentRoom.description, "AI");
                return;
            }

            setIsProcessing(true);
            // Don't clear feed here to keep the "Initializing" message

            // Initialize State if empty
            updateRpgState({
                currentRoomId: "entrance", // Default start
                currentInteractables: [],
                roomRegistry: {},
                visitedIds: [], // We'll handle Set conversion locally or just use array
                combatState: {
                    inCombat: false,
                    playerHp: initialData?.role?.stats?.health || 100,
                    playerStats: initialData?.role?.stats || { health: 100, energy: 100 },
                    enemyHp: 0,
                    enemyName: ""
                }
            });

            try {
                addLog(`Generating Sector 1 (${theme})...`, "SYSTEM");

                const currentGameState = {
                    gameMode: gameMode || "rpg",
                    theme: theme || "scifi",
                    quest: "Explore the unknown",
                    stats: rpgState.combatState?.playerStats || initialData?.role?.stats,
                    inventory: inventory,
                    playerName: initialData?.name || "Unknown",
                    playerRole: initialData?.role?.name || "Survivor",
                    playerBio: initialData?.role?.description || "",
                    summary: "Beginning simulation.",
                    history: [],
                    language: language || "English"
                };

                const sectorData = await generateSector(apiKey, currentGameState, "start_room");

                if (sectorData.rooms) {
                    const newRegistry = {};
                    sectorData.rooms.forEach(room => {
                        newRegistry[room.id] = {
                            ...room,
                            x: room.coordinates?.x || 50,
                            y: room.coordinates?.y || 50
                        };
                    });

                    const startId = sectorData.start_room_id || sectorData.rooms[0].id;

                    updateRpgState({
                        roomRegistry: newRegistry,
                        currentRoomId: startId,
                        visitedIds: [startId],
                        currentInteractables: newRegistry[startId]?.interactables || [],
                        lastRawResponse: sectorData
                    });

                    if (sectorData.narrative_intro) {
                        addLog(sectorData.narrative_intro, "AI");
                    }
                }

            } catch (error) {
                addLog(`Error initializing Sector: ${error.message}`, "SYSTEM");
            } finally {
                setIsProcessing(false);
            }
        };

        const timer = setTimeout(() => {
            initRealAI();
        }, 50);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount. Do NOT add state dependencies here to avoid loops.

    // --- ACTIONS ---
    const handleSend = async (text) => {
        const input = typeof text === 'string' ? text : inputValue;
        if (!input.trim()) return;
        setInputValue("");
        addLog(input, "USER");

        if (!apiKey) {
            addLog("Error: API Key missing.", "SYSTEM");
            return;
        }

        setIsProcessing(true);
        try {
            const currentGameState = {
                gameMode: gameMode || "rpg",
                theme: theme || "scifi",
                quest: "Explore",
                stats: rpgState.combatState.playerStats,
                inventory: inventory,
                summary: "Exploring...",
                history: feed,
                language: language || "English"
            };

            const response = await generateGameResponse(apiKey, input, currentGameState);
            if (response.narrative) addLog(response.narrative, "AI");
            if (response.interactables) {
                updateRpgState({
                    currentInteractables: response.interactables,
                    lastRawResponse: response
                });
            } else {
                updateRpgState({ lastRawResponse: response });
            }

            // Handle other response fields if needed (stat updates, etc)

        } catch (error) {
            addLog(`Error: ${error.message}`, "SYSTEM");
        } finally {
            setIsProcessing(false);
        }
    };

    const move = async (dir) => {
        if (rpgState.combatState.inCombat) {
            addLog("You cannot escape during combat!", "SYSTEM");
            return;
        }

        const currentRoom = rpgState.roomRegistry[rpgState.currentRoomId];

        if (!currentRoom) {
            addLog("Error: Current room data missing.", "SYSTEM");
            return;
        }

        const targetId = currentRoom.exits?.[dir.toLowerCase()];

        if (!targetId) {
            addLog("You cannot go that way.", "SYSTEM");
            return;
        }

        const targetRoom = rpgState.roomRegistry[targetId];

        if (targetRoom) {
            updateRpgState({
                currentRoomId: targetId,
                visitedIds: [...(rpgState.visitedIds || []), targetId],
                currentInteractables: targetRoom.interactables || []
            });
            setIsInspecting(false);
            addLog(`You move ${dir} into ${targetRoom.name}.`, "AI");
            if (targetRoom.description) addLog(targetRoom.description, "AI");
        } else {
            addLog("Reaching sector boundary...", "SYSTEM");
            setIsProcessing(true);

            try {
                const currentGameState = {
                    gameMode: gameMode || "rpg",
                    theme: theme || "scifi",
                    quest: "Explore",
                    stats: rpgState.combatState.playerStats,
                    inventory: inventory,
                    summary: `Exploring beyond ${currentRoom.name}`,
                    history: feed,
                    language: language || "English"
                };

                const sectorData = await generateSector(apiKey, currentGameState, targetId);

                if (sectorData.rooms) {
                    const newRegistry = { ...rpgState.roomRegistry };
                    sectorData.rooms.forEach(room => {
                        newRegistry[room.id] = {
                            ...room,
                            x: room.coordinates?.x || 50,
                            y: room.coordinates?.y || 50
                        };
                    });

                    const newRoom = sectorData.rooms.find(r => r.id === targetId);

                    updateRpgState({
                        roomRegistry: newRegistry,
                        currentRoomId: targetId,
                        visitedIds: [...(rpgState.visitedIds || []), targetId],
                        currentInteractables: newRoom ? (newRoom.interactables || []) : [],
                        lastRawResponse: sectorData
                    });

                    if (sectorData.narrative_intro) addLog(sectorData.narrative_intro, "AI");
                }
            } catch (e) {
                addLog("Failed to generate new sector.", "SYSTEM");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleInteraction = (interactableId) => {
        const object = rpgState.currentInteractables.find(obj => obj.id === interactableId);
        console.log("Interaction Triggered:", interactableId, object);
        if (!object) return;

        const result = object.result;
        console.log("Interaction Result:", result);

        if (result.narrative) addLog(result.narrative, "AI");

        if (result.items) {
            console.log("Adding Items:", result.items);
            setInventory(prev => {
                // Create a shallow copy of the array
                const newInv = [...prev];

                result.items.forEach(newItem => {
                    const existingIndex = newInv.findIndex(i => i.name === newItem.name);

                    if (existingIndex >= 0) {
                        // IMMUTABLE UPDATE: Replace the item with a new object
                        newInv[existingIndex] = {
                            ...newInv[existingIndex],
                            count: newInv[existingIndex].count + newItem.count
                        };
                    } else {
                        newInv.push(newItem);
                    }
                });
                return newInv;
            });
            addLog(`Received: ${result.items.map(i => `${i.count}x ${i.name}`).join(', ')}`, "SYSTEM");
        }

        if (result.stat_updates) {
            const newStats = { ...rpgState.combatState.playerStats };
            Object.entries(result.stat_updates).forEach(([key, val]) => {
                if (newStats[key] !== undefined) {
                    newStats[key] = Math.max(0, Math.min(100, newStats[key] + val));
                }
            });

            updateRpgState({
                combatState: {
                    ...rpgState.combatState,
                    playerStats: newStats,
                    playerHp: newStats.health || rpgState.combatState.playerHp
                }
            });
        }

        // Force removal if it's a LOOT type or if items were received (and it's not explicitly set to false)
        const shouldRemove = result.remove_after !== false && (result.remove_after || object.type === 'LOOT' || (result.items && result.items.length > 0));

        if (shouldRemove) {
            const newInteractables = rpgState.currentInteractables.filter(obj => obj.id !== interactableId);

            // Update Current State
            const updates = {
                currentInteractables: newInteractables
            };

            // Update Registry for Persistence
            const currentRoom = rpgState.roomRegistry[rpgState.currentRoomId];
            if (currentRoom) {
                updates.roomRegistry = {
                    ...rpgState.roomRegistry,
                    [rpgState.currentRoomId]: {
                        ...currentRoom,
                        interactables: newInteractables
                    }
                };
            }

            updateRpgState(updates);
        }
    };

    const inspectArea = () => {
        if (rpgState.combatState.inCombat) return;
        setIsInspecting(true);
        addLog("Inspecting area...", "USER");
        addLog("You look around carefully.", "AI");
    };

    const handleCombatAction = (action) => {
        if (!rpgState.combatState.inCombat) return;

        if (action === 'attack') {
            const dmg = Math.floor(Math.random() * 10) + 5; // 5-15 dmg
            const newEnemyHp = Math.max(0, rpgState.combatState.enemyHp - dmg);

            addLog(`You attacked ${rpgState.combatState.enemyName} for ${dmg} damage!`, "USER");

            if (newEnemyHp <= 0) {
                updateRpgState({
                    combatState: { ...rpgState.combatState, inCombat: false, enemyHp: 0 }
                });
                addLog(`VICTORY! ${rpgState.combatState.enemyName} has been defeated.`, "SYSTEM");
                setIsInspecting(true);
            } else {
                const enemyDmg = Math.floor(Math.random() * 8) + 2;
                const newStats = { ...rpgState.combatState.playerStats };
                if (newStats.health !== undefined) {
                    newStats.health = Math.max(0, newStats.health - enemyDmg);
                }

                updateRpgState({
                    combatState: {
                        ...rpgState.combatState,
                        enemyHp: newEnemyHp,
                        playerStats: newStats,
                        playerHp: newStats.health || Math.max(0, rpgState.combatState.playerHp - enemyDmg)
                    }
                });

                setTimeout(() => {
                    addLog(`${rpgState.combatState.enemyName} attacks you for ${enemyDmg} damage!`, "AI");
                    if (rpgState.combatState.playerStats?.health <= 0 || rpgState.combatState.playerHp <= 0) {
                        addLog("CRITICAL FAILURE. SIMULATION TERMINATED.", "SYSTEM");
                    }
                }, 500);
            }
        }
    };

    const handleAction = (action) => {
        if (action === 'move_north') move('north');
        if (action === 'move_south') move('south');
        if (action === 'move_east') move('east');
        if (action === 'move_west') move('west');
        if (action === 'inspect') inspectArea();
        if (action === 'combat_attack') handleCombatAction('attack');

        if (action.startsWith('CLIENT_LOOT:')) {
            const itemName = action.split(':')[1];
            setInventory(prev => [...prev, { name: itemName, count: 1 }]);
            addLog(`Acquired: ${itemName}`, "SYSTEM");
        }

        if (action.startsWith('INTERACT:')) {
            const id = action.split(':')[1];
            handleInteraction(id);
        }
    };

    // --- CHOICE GENERATION ---
    useEffect(() => {
        const room = rpgState.roomRegistry[rpgState.currentRoomId];
        const newChoices = [];

        if (rpgState.combatState.inCombat) {
            newChoices.push({ id: 'combat_atk', label: 'ATTACK', action: 'combat_attack', icon: <Sword size={20} />, type: 'action' });
            newChoices.push({ id: 'combat_def', label: 'DEFEND', action: 'combat_defend', icon: <Shield size={20} />, type: 'action' });
            newChoices.push({ id: 'combat_item', label: 'USE ITEM', action: 'combat_item', icon: <Box size={20} />, type: 'resource' });
        } else {
            // Navigation
            if (room && room.exits) {
                Object.entries(room.exits).forEach(([dir, data]) => {
                    newChoices.push({
                        id: `move_${dir[0].toLowerCase()}`,
                        label: dir.toUpperCase(),
                        action: `move_${dir.toLowerCase()}`,
                        icon: <ArrowUp size={20} className={dir === 'south' ? 'rotate-180' : dir === 'east' ? 'rotate-90' : dir === 'west' ? '-rotate-90' : ''} />,
                        type: data.type === 'LOCKED' ? 'skill_check' : 'action'
                    });
                });
            }

            // Interactables
            if (rpgState.currentInteractables && rpgState.currentInteractables.length > 0) {
                rpgState.currentInteractables.forEach(obj => {
                    newChoices.push({
                        id: obj.id,
                        label: `${obj.action_label} ${obj.name}`.toUpperCase(),
                        name: obj.name, // Pass name for UI fallback
                        action: `INTERACT:${obj.id}`,
                        icon: obj.icon === 'box' ? <Box size={20} /> : obj.icon === 'cpu' ? <Cpu size={20} /> : <Search size={20} />,
                        type: obj.type === 'LOOT' ? 'loot' : 'skill_check'
                    });
                });
            }
            newChoices.push({ id: 'inspect', label: 'INSPECT AREA', action: 'inspect', icon: <Search size={20} />, type: 'skill_check' });
        }

        setChoices(newChoices);
    }, [rpgState.currentRoomId, isInspecting, inventory, rpgState.combatState.inCombat, rpgState.combatState.enemyHp, rpgState.currentInteractables, rpgState.roomRegistry]);

    return {
        // State
        gameData: { start_room: "entrance", rooms: rpgState.roomRegistry }, // Adapt for GameBoard
        roomRegistry: rpgState.roomRegistry,
        visitedIds: new Set(rpgState.visitedIds),
        currentRoomId: rpgState.currentRoomId,
        inventory,
        feed,
        choices,
        inputValue,
        isProcessing,
        combatState: rpgState.combatState,
        useRealAI: true,

        // Setters
        setInputValue,

        // Actions
        handleSend,
        handleAction,

        // Computed
        currentRoom: rpgState.roomRegistry[rpgState.currentRoomId]
    };
}
