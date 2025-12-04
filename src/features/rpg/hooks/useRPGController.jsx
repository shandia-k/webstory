import { useState, useEffect, useRef } from 'react';
import { useGame } from '../../../context/GameContext';
import { generateGameResponse, generateSector } from '../../../services/llmService';

import { applyGridCoordinates, getNextSectorCoordinates } from '../../../utils/layoutGenerator';
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

    // Background Generation State
    const nextSectorData = useRef(null);
    const isGeneratingNext = useRef(false);

    // --- BACKGROUND GENERATION ---
    const generateNextSector = async (currentRoom) => {
        console.log(`[DEBUG] Attempting Background Gen. Generating: ${isGeneratingNext.current}, Data Ready: ${!!nextSectorData.current}`);

        if (isGeneratingNext.current || nextSectorData.current) {
            console.log("[DEBUG] Background Gen Skipped (Already in progress or data ready)");
            return;
        }

        isGeneratingNext.current = true;
        console.log("Background Generation Started...");

        try {
            const currentGameState = {
                gameMode: gameMode || "rpg",
                theme: theme || "scifi",
                quest: "Explore deeper",
                stats: rpgState.combatState.playerStats,
                inventory: inventory,
                playerName: initialData?.name || "Unknown",
                playerRole: initialData?.role?.name || "Survivor",
                playerBio: initialData?.role?.description || "",
                summary: `Leaving ${currentRoom.name}`,
                history: [], // Keep context light
                language: language || "English"
            };

            // Generate relative to a hypothetical "next" ID
            const sectorData = await generateSector(apiKey, currentGameState, `sector_${Date.now()}_start`);

            if (sectorData.rooms) {
                // For background gen, we don't know the exact exit yet.
                // We defer grid positioning until the actual move.
                nextSectorData.current = {
                    ...sectorData
                };
                console.log("Background Generation Complete:", nextSectorData.current);
            }
        } catch (e) {
            console.error("Background Gen Failed:", e);
        } finally {
            isGeneratingNext.current = false;
        }
    };

    // --- INITIALIZATION ---
    useEffect(() => {
        const initRealAI = async () => {
            if (!apiKey) {
                addLog("CRITICAL ERROR: API Key missing. Cannot initialize Live AI.", "SYSTEM");
                return;
            }

            // Check if we have existing state to resume
            if (!initialData && rpgState.currentRoomId && rpgState.roomRegistry && rpgState.roomRegistry[rpgState.currentRoomId]) {
                addLog("Resuming simulation...", "SYSTEM");
                const currentRoom = rpgState.roomRegistry[rpgState.currentRoomId];
                if (currentRoom.description) addLog(currentRoom.description, "AI");
                return;
            }

            setIsProcessing(true);

            // Initialize State if empty
            updateRpgState({
                currentRoomId: "entrance", // Default start
                currentInteractables: [],
                roomRegistry: {},
                visitedIds: [],
                combatState: {
                    enemyHp: 0,
                    enemyName: ""
                },
                currentSector: { x: 0, y: 0 }
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

                console.log("[Init] Calling generateSector...");
                const sectorData = await generateSector(apiKey, currentGameState, "start_room");
                console.log("[Init] Received sectorData:", sectorData);

                if (sectorData && sectorData.rooms && Array.isArray(sectorData.rooms)) {
                    // Apply Grid Coordinates for the first sector (0,0)
                    const adjustedRooms = applyGridCoordinates({ x: 0, y: 0 }, sectorData.rooms);

                    const newRegistry = {};
                    adjustedRooms.forEach(room => {
                        newRegistry[room.id] = { ...room };
                    });

                    let startId = sectorData.start_room_id;

                    // Validation: Ensure startId exists in the generated rooms
                    if (!startId || !newRegistry[startId]) {
                        console.warn(`[Init] Mismatch: start_room_id '${startId}' not found in rooms. Defaulting to first room.`);
                        startId = adjustedRooms[0].id;
                    }

                    console.log("[Init] Final Start Room ID:", startId);



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
                } else {
                    throw new Error("Invalid sector data received from AI");
                }

            } catch (error) {
                console.error("[Init] Error:", error);
                addLog(`Error initializing Sector: ${error.message}`, "SYSTEM");
                // Fallback to a basic room so the game doesn't hang
                const fallbackId = "fallback_start";
                const fallbackRoom = {
                    id: fallbackId,
                    name: "Emergency Airlock",
                    description: "System failure detected. Emergency protocols engaged. You are in a safe zone.",
                    x: 0, y: 0,
                    exits: {}
                };
                updateRpgState({
                    roomRegistry: { [fallbackId]: fallbackRoom },
                    currentRoomId: fallbackId,
                    visitedIds: [fallbackId]
                });
            } finally {
                setIsProcessing(false);
            }
        };

        const timer = setTimeout(() => {
            initRealAI();
        }, 50);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

        // --- 1. PREPARE STATE UPDATES ---
        // We will accumulate all updates and apply them ONCE at the end to avoid race conditions.
        let pendingRegistryUpdate = { ...rpgState.roomRegistry };
        let pendingCurrentRoom = { ...currentRoom };
        let unlockedThisTurn = false;

        // --- 2. EXIT CONDITION CHECK ---
        if (currentRoom.exit_condition &&
            currentRoom.exit_condition.direction &&
            currentRoom.exit_condition.direction.toLowerCase() === dir.toLowerCase() &&
            !currentRoom.exit_condition.solved) {

            const req = currentRoom.exit_condition.requires;
            if (req) {
                // Fuzzy check for item
                const hasItem = inventory.find(i => i.name.toLowerCase().includes(req.toLowerCase()));

                if (hasItem) {
                    addLog(`Used ${hasItem.name} to unlock the way.`, "SYSTEM");

                    // Mark as solved in our pending objects
                    pendingCurrentRoom.exit_condition = { ...currentRoom.exit_condition, solved: true };
                    pendingRegistryUpdate[rpgState.currentRoomId] = pendingCurrentRoom;
                    unlockedThisTurn = true;

                } else {
                    addLog(`LOCKED. Requires: ${req}`, "SYSTEM");
                    return; // Block movement
                }
            }
        }

        const targetId = pendingCurrentRoom.exits?.[dir.toLowerCase()];

        if (!targetId) {
            addLog("You cannot go that way.", "SYSTEM");
            return;
        }

        // --- 3. DETERMINE DESTINATION ---
        const targetRoom = pendingRegistryUpdate[targetId];

        if (targetRoom) {
            // --- CASE A: NORMAL MOVEMENT (Room Exists) ---

            // 1. Check for Pre-generation Trigger
            const totalRooms = Object.keys(pendingRegistryUpdate).length;
            // Use a Set to count unique visited including the one we are about to enter
            const uniqueVisited = new Set([...(rpgState.visitedIds || []), targetId]).size;

            console.log(`Gen Check: Total ${totalRooms}, Visited ${uniqueVisited}, Left ${totalRooms - uniqueVisited}`);

            if (totalRooms - uniqueVisited <= 3) {
                generateNextSector(targetRoom);
            }

            // 2. Apply Updates
            updateRpgState({
                roomRegistry: pendingRegistryUpdate, // Includes unlock if happened
                currentRoomId: targetId,
                visitedIds: [...(rpgState.visitedIds || []), targetId],
                currentInteractables: targetRoom.interactables || []
            });

            setIsInspecting(false);
            addLog(`You move ${dir} into ${targetRoom.name}.`, "AI");
            if (targetRoom.description) addLog(targetRoom.description, "AI");

        } else {
            // --- CASE B: SECTOR BOUNDARY (New Sector) ---
            addLog("Approaching sector boundary...", "SYSTEM");
            setIsProcessing(true);

            try {
                let sectorData;
                const nextSectorCoords = getNextSectorCoordinates(rpgState.currentSector || { x: 0, y: 0 }, dir);
                console.log(`[Move] New Sector Coords:`, nextSectorCoords);

                // A. Check if Pre-generated
                if (nextSectorData.current) {
                    addLog("Seamlessly entering new sector...", "SYSTEM");
                    sectorData = nextSectorData.current;
                    nextSectorData.current = null; // Consume it
                } else {
                    // B. Fallback: Generate Now
                    addLog("Generating new sector...", "SYSTEM");
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

                    const rawData = await generateSector(apiKey, currentGameState, targetId);
                    sectorData = rawData;
                }

                if (sectorData.rooms) {
                    // Apply Grid Coordinates
                    const adjustedRooms = applyGridCoordinates(nextSectorCoords, sectorData.rooms);
                    sectorData = { ...sectorData, rooms: adjustedRooms };

                    // --- ID REMAPPING LOGIC ---
                    // The LLM generates a new sector with its own internal start_room_id.
                    // We need to ensure that the exit from the previous sector (targetId)
                    // correctly maps to the entry point of this new sector.
                    const generatedStartId = sectorData.start_room_id || sectorData.rooms[0].id;
                    let finalRooms = [...sectorData.rooms];

                    if (generatedStartId !== targetId) {
                        console.log(`[Remapping] Connecting ${generatedStartId} -> ${targetId}`);
                        const idMap = { [generatedStartId]: targetId };

                        finalRooms = finalRooms.map(r => {
                            let newId = r.id;
                            if (idMap[r.id]) newId = idMap[r.id];

                            const newExits = {};
                            if (r.exits) {
                                Object.entries(r.exits).forEach(([d, tid]) => {
                                    newExits[d] = idMap[tid] || tid;
                                });
                            }
                            return { ...r, id: newId, exits: newExits };
                        });
                    }

                    finalRooms.forEach(room => {
                        pendingRegistryUpdate[room.id] = { ...room };
                    });

                    updateRpgState({
                        roomRegistry: pendingRegistryUpdate,
                        currentRoomId: targetId,
                        visitedIds: [...(rpgState.visitedIds || []), targetId],
                        currentInteractables: pendingRegistryUpdate[targetId]?.interactables || [],
                        lastRawResponse: sectorData,
                        currentSector: nextSectorCoords // Update Sector State
                    });

                    if (sectorData.narrative_intro) addLog(sectorData.narrative_intro, "AI");

                    // Trigger background gen for next
                    generateNextSector({ name: "New Sector Start" });
                }
            } catch (e) {
                console.error(e);
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

        // CHECK REQUIREMENTS
        if (object.requires) {
            const requiredItemName = object.requires;
            const hasItem = inventory.find(i => i.name.toLowerCase() === requiredItemName.toLowerCase());

            if (!hasItem) {
                addLog(`Locked. Requires: ${requiredItemName}`, "SYSTEM");
                return; // Block interaction
            }

            // Item found! Use it.
            addLog(`Used: ${requiredItemName}`, "SYSTEM");

            // Optional: Consume item if it's not a permanent key (heuristic or explicit flag)
            // For now, let's assume if it's a "consumable" type or explicitly "single_use", we remove it.
            // Or just remove it if the user implies "terpakai" (used up).
            // Let's check the item type from inventory.
            if (hasItem.type === 'consumable' || hasItem.tags?.includes('CONSUME')) {
                setInventory(prev => {
                    const newInv = [...prev];
                    const idx = newInv.findIndex(i => i.name === hasItem.name);
                    if (idx >= 0) {
                        if (newInv[idx].count > 1) newInv[idx].count--;
                        else newInv.splice(idx, 1);
                    }
                    return newInv;
                });
            }
        }

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

        // Prepare updates
        const updates = {};
        let registryUpdated = false;
        let newRegistry = { ...rpgState.roomRegistry };
        const currentRoom = newRegistry[rpgState.currentRoomId];

        // 1. Handle Exit Unlock (Sync with Room State)
        if (object.requires && currentRoom.exit_condition && currentRoom.exit_condition.requires === object.requires) {
            console.log("Syncing interaction with Room Exit Condition...");
            newRegistry[rpgState.currentRoomId] = {
                ...currentRoom,
                exit_condition: { ...currentRoom.exit_condition, solved: true }
            };
            registryUpdated = true;
        }

        // 2. Handle Interactable Removal
        if (shouldRemove) {
            const newInteractables = rpgState.currentInteractables.filter(obj => obj.id !== interactableId);
            updates.currentInteractables = newInteractables;

            // Update Registry for Persistence (Interactables)
            // We use the potentially already updated registry from step 1
            const roomToUpdate = newRegistry[rpgState.currentRoomId] || currentRoom;

            newRegistry[rpgState.currentRoomId] = {
                ...roomToUpdate,
                interactables: newInteractables
            };
            registryUpdated = true;
        }

        if (registryUpdated) {
            updates.roomRegistry = newRegistry;
        }

        if (Object.keys(updates).length > 0) {
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
            // 1. INTERACTABLES (Priority)
            if (rpgState.currentInteractables && rpgState.currentInteractables.length > 0) {
                rpgState.currentInteractables.forEach(obj => {
                    newChoices.push({
                        id: obj.id,
                        label: obj.action_label || obj.name, // Use action_label if available, else name
                        action: `INTERACT:${obj.id}`,
                        icon: obj.icon, // Pass string name (e.g. "box", "key") directly to ActionPanel
                        type: obj.type?.toLowerCase() || 'action',
                        meta: {
                            difficulty: obj.type === 'LOCKED' ? 'HARD' : null,
                            cost: obj.requires ? `REQ: ${obj.requires}` : null
                        }
                    });
                });
            }

            // 2. NAVIGATION
            if (room && room.exits) {
                Object.entries(room.exits).forEach(([dir, data]) => {
                    if (!data) return; // Skip invalid exits

                    const isLocked = data && typeof data === 'object' && data.type === 'LOCKED';

                    // Check if this specific direction is the one that was just unlocked
                    const isUnlocked = room.exit_condition &&
                        room.exit_condition.direction &&
                        room.exit_condition.direction.toLowerCase() === dir.toLowerCase() &&
                        room.exit_condition.solved;

                    if (isUnlocked) {
                        newChoices.push({
                            id: `move_${dir[0].toLowerCase()}_unlocked`,
                            label: `OPEN ${dir.toUpperCase()}`,
                            action: `move_${dir.toLowerCase()}`,
                            icon: <ArrowUp size={20} className={dir === 'south' ? 'rotate-180' : dir === 'east' ? 'rotate-90' : dir === 'west' ? '-rotate-90' : ''} />,
                            variant: 'success'
                        });
                    } else {
                        newChoices.push({
                            id: `move_${dir[0].toLowerCase()}`,
                            label: dir.toUpperCase(),
                            action: `move_${dir.toLowerCase()}`,
                            icon: <ArrowUp size={20} className={dir === 'south' ? 'rotate-180' : dir === 'east' ? 'rotate-90' : dir === 'west' ? '-rotate-90' : ''} />,
                            type: isLocked ? 'skill_check' : 'action'
                        });
                    }
                });
            }

            newChoices.push({ id: 'inspect', label: 'INSPECT AREA', action: 'inspect', icon: <Search size={20} />, type: 'skill_check' });
        }

        setChoices(newChoices);
    }, [rpgState.currentRoomId, isInspecting, inventory, rpgState.combatState.inCombat, rpgState.combatState.enemyHp, rpgState.currentInteractables, rpgState.roomRegistry]);

    return {
        gameData: { start_room: "entrance", rooms: rpgState.roomRegistry },
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
        setInputValue,
        handleSend,
        handleAction,
        currentRoom: rpgState.roomRegistry[rpgState.currentRoomId]
    };
}
