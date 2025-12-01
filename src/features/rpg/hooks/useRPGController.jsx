import { useState, useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { getMockDungeonData } from '../../../services/mockService';
import { generateGameResponse } from '../../../services/llmService';
import { Terminal, Wifi, Cpu, FileText, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Search, Hand, Sword, Shield, Box } from 'lucide-react';

export function useRPGController(initialData = null) {
    const { apiKey, language } = useGame();
    const useRealAI = !!apiKey; // Auto-detect if we should use Real AI

    // --- CORE STATE ---
    const [gameData] = useState(getMockDungeonData() || {
        start_room: "entrance",
        rooms: { "entrance": { name: "Error", desc: "Failed to load data.", exits: {} } }
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(gameData?.start_room || "entrance");

    // Inventory from Context or Local (We'll use local for the RPG "Patch" isolation for now, 
    // but ideally this should sync back to context if we want persistence)
    const [inventory, setInventory] = useState(
        initialData?.items
            ? initialData.items
            : [{ name: "Medkit", count: 2 }]
    );

    const [feed, setFeed] = useState([
        { id: 1, content: "Initializing RPG Module...", role: "system", timestamp: "00:00:00" },
        { id: 2, content: "Entering Sector 1...", role: "ai", timestamp: "00:00:01" }
    ]);

    const [isInspecting, setIsInspecting] = useState(false);
    const [choices, setChoices] = useState([]);
    const [inputValue, setInputValue] = useState("");

    // --- RPG SPECIFIC STATE ---
    const [roomRegistry, setRoomRegistry] = useState({});
    const [visitedIds, setVisitedIds] = useState(new Set());
    const [currentInteractables, setCurrentInteractables] = useState([]);

    const [combatState, setCombatState] = useState({
        inCombat: false,
        playerHp: initialData?.role?.stats?.health || 100,
        enemyHp: 0,
        enemyName: ""
    });

    // Helper to add log
    const addLog = (text, role = "system") => {
        setFeed(prev => [...prev, {
            id: Date.now(),
            content: text,
            role: role.toLowerCase(),
            timestamp: new Date().toLocaleTimeString()
        }]);
    };

    // --- INITIALIZATION ---
    useEffect(() => {
        if (useRealAI) {
            const initRealAI = async () => {
                setIsProcessing(true);
                setFeed([]);
                setCurrentInteractables([]);
                setRoomRegistry({});
                setVisitedIds(new Set());

                try {
                    addLog("Initializing Neural Link...", "SYSTEM");
                    addLog("Generating Sector 1...", "SYSTEM");

                    const currentGameState = {
                        genre: "fantasy",
                        quest: gameData.quest_name,
                        stats: { health: combatState.playerHp, energy: 100 },
                        inventory: inventory,
                        summary: "Beginning simulation.",
                        history: [],
                        language: language || "English",
                        isMockMode: false
                    };

                    const { generateSector } = await import('../../../services/llmService');
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
                        setRoomRegistry(newRegistry);

                        const startId = sectorData.start_room_id || sectorData.rooms[0].id;
                        setCurrentRoomId(startId);
                        setVisitedIds(new Set([startId]));

                        if (sectorData.narrative_intro) {
                            addLog(sectorData.narrative_intro, "AI");
                        }

                        const startRoom = newRegistry[startId];
                        if (startRoom && startRoom.interactables) {
                            setCurrentInteractables(startRoom.interactables);
                        }
                    }

                } catch (error) {
                    addLog(`Error initializing Sector: ${error.message}`, "SYSTEM");
                } finally {
                    setIsProcessing(false);
                }
            };

            initRealAI();
        }
    }, [useRealAI]); // Run once when AI mode is confirmed

    // --- ACTIONS ---
    const handleSend = async (text) => {
        const input = typeof text === 'string' ? text : inputValue;
        if (!input.trim()) return;
        setInputValue("");
        addLog(input, "USER");

        if (useRealAI) {
            setIsProcessing(true);
            try {
                const currentGameState = {
                    genre: "fantasy",
                    quest: gameData.quest_name,
                    stats: { health: combatState.playerHp, energy: 100 },
                    inventory: inventory,
                    summary: "Exploring...",
                    history: feed,
                    language: language || "English",
                    isMockMode: false
                };

                const response = await generateGameResponse(apiKey, input, currentGameState);
                if (response.narrative) addLog(response.narrative, "AI");
                if (response.interactables) setCurrentInteractables(response.interactables);

            } catch (error) {
                addLog(`Error: ${error.message}`, "SYSTEM");
            } finally {
                setIsProcessing(false);
            }
        } else {
            setTimeout(() => addLog(`Command '${input}' not recognized (Mock Mode).`, "SYSTEM"), 500);
        }
    };

    const move = async (dir) => {
        if (combatState.inCombat) {
            addLog("You cannot escape during combat!", "SYSTEM");
            return;
        }

        const currentRoom = useRealAI ? roomRegistry[currentRoomId] : gameData.rooms[currentRoomId];

        if (!currentRoom) {
            addLog("Error: Current room data missing.", "SYSTEM");
            return;
        }

        let targetId = null;
        if (useRealAI) {
            targetId = currentRoom.exits?.[dir.toLowerCase()];
        } else {
            targetId = currentRoom.exits?.[dir];
        }

        if (!targetId) {
            addLog("You cannot go that way.", "SYSTEM");
            return;
        }

        if (useRealAI) {
            const targetRoom = roomRegistry[targetId];

            if (targetRoom) {
                setCurrentRoomId(targetId);
                setVisitedIds(prev => new Set(prev).add(targetId));
                setIsInspecting(false);
                setCurrentInteractables(targetRoom.interactables || []);
                addLog(`You move ${dir} into ${targetRoom.name}.`, "AI");
                if (targetRoom.description) addLog(targetRoom.description, "AI");
            } else {
                addLog("Reaching sector boundary...", "SYSTEM");
                setIsProcessing(true);

                try {
                    const { generateSector } = await import('../../../services/llmService');
                    const currentGameState = {
                        genre: "fantasy",
                        quest: gameData.quest_name,
                        stats: { health: combatState.playerHp, energy: 100 },
                        inventory: inventory,
                        summary: `Exploring beyond ${currentRoom.name}`,
                        history: feed,
                        language: language || "English",
                        isMockMode: false
                    };

                    const sectorData = await generateSector(apiKey, currentGameState, targetId);

                    if (sectorData.rooms) {
                        setRoomRegistry(prev => {
                            const next = { ...prev };
                            sectorData.rooms.forEach(room => {
                                next[room.id] = {
                                    ...room,
                                    x: room.coordinates?.x || 50,
                                    y: room.coordinates?.y || 50
                                };
                            });
                            return next;
                        });

                        setCurrentRoomId(targetId);
                        setVisitedIds(prev => new Set(prev).add(targetId));

                        if (sectorData.narrative_intro) addLog(sectorData.narrative_intro, "AI");

                        const newRoom = sectorData.rooms.find(r => r.id === targetId);
                        if (newRoom) setCurrentInteractables(newRoom.interactables || []);
                    }
                } catch (e) {
                    addLog("Failed to generate new sector.", "SYSTEM");
                } finally {
                    setIsProcessing(false);
                }
            }
            return;
        }

        setCurrentRoomId(targetId);
        setIsInspecting(false);
        addLog(`Moving ${dir}...`, "USER");
    };

    const handleInteraction = (interactableId) => {
        const object = currentInteractables.find(obj => obj.id === interactableId);
        if (!object) return;

        const result = object.result;
        if (result.narrative) addLog(result.narrative, "AI");

        if (result.items) {
            setInventory(prev => {
                const newInv = [...prev];
                result.items.forEach(newItem => {
                    const existing = newInv.find(i => i.name === newItem.name);
                    if (existing) existing.count += newItem.count;
                    else newInv.push(newItem);
                });
                return newInv;
            });
            addLog(`Received: ${result.items.map(i => `${i.count}x ${i.name}`).join(', ')}`, "SYSTEM");
        }

        if (result.stat_updates) {
            setCombatState(prev => ({
                ...prev,
                playerHp: Math.min(100, Math.max(0, prev.playerHp + (result.stat_updates.health || 0)))
            }));
        }

        if (result.remove_after) {
            setCurrentInteractables(prev => prev.filter(obj => obj.id !== interactableId));
        }
    };

    const inspectArea = () => {
        if (combatState.inCombat) return;
        setIsInspecting(true);
        const room = useRealAI ? roomRegistry[currentRoomId] : gameData.rooms[currentRoomId];
        addLog("Inspecting area...", "USER");

        if (useRealAI) {
            addLog("You look around carefully.", "AI");
        } else {
            if (room.loot && !inventory.some(item => item.name === room.loot.name)) {
                addLog(`You found something: ${room.loot.name}!`, "AI");
            } else {
                addLog("Nothing interesting here.", "AI");
            }
        }
    };

    const handleCombatAction = (action) => {
        if (!combatState.inCombat) return;

        if (action === 'attack') {
            const dmg = Math.floor(Math.random() * 10) + 5; // 5-15 dmg
            const newEnemyHp = Math.max(0, combatState.enemyHp - dmg);

            addLog(`You attacked ${combatState.enemyName} for ${dmg} damage!`, "USER");

            if (newEnemyHp <= 0) {
                setCombatState(prev => ({ ...prev, inCombat: false, enemyHp: 0 }));
                addLog(`VICTORY! ${combatState.enemyName} has been defeated.`, "SYSTEM");
                setIsInspecting(true);
            } else {
                const enemyDmg = Math.floor(Math.random() * 8) + 2;
                const newPlayerHp = Math.max(0, combatState.playerHp - enemyDmg);

                setCombatState(prev => ({ ...prev, enemyHp: newEnemyHp, playerHp: newPlayerHp }));

                setTimeout(() => {
                    addLog(`${combatState.enemyName} attacks you for ${enemyDmg} damage!`, "AI");
                    if (newPlayerHp <= 0) {
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
        const room = useRealAI ? roomRegistry[currentRoomId] : gameData?.rooms?.[currentRoomId];
        const newChoices = [];

        if (combatState.inCombat) {
            newChoices.push({ id: 'combat_atk', label: 'ATTACK', action: 'combat_attack', icon: <Sword size={20} />, type: 'action' });
            newChoices.push({ id: 'combat_def', label: 'DEFEND', action: 'combat_defend', icon: <Shield size={20} />, type: 'action' });
            newChoices.push({ id: 'combat_item', label: 'USE ITEM', action: 'combat_item', icon: <Box size={20} />, type: 'resource' });
        } else {
            // Navigation
            if (useRealAI && room && room.exits) {
                Object.entries(room.exits).forEach(([dir, data]) => {
                    newChoices.push({
                        id: `move_${dir[0].toLowerCase()}`,
                        label: dir.toUpperCase(),
                        action: `move_${dir.toLowerCase()}`,
                        icon: <ArrowUp size={20} className={dir === 'south' ? 'rotate-180' : dir === 'east' ? 'rotate-90' : dir === 'west' ? '-rotate-90' : ''} />,
                        type: data.type === 'LOCKED' ? 'skill_check' : 'action'
                    });
                });
            } else {
                ['North', 'South', 'East', 'West'].forEach(dir => {
                    newChoices.push({
                        id: `move_${dir[0].toLowerCase()}`,
                        label: dir.toUpperCase(),
                        action: `move_${dir.toLowerCase()}`,
                        icon: <ArrowUp size={20} className={dir === 'South' ? 'rotate-180' : dir === 'East' ? 'rotate-90' : dir === 'West' ? '-rotate-90' : ''} />,
                        type: 'action'
                    });
                });
            }

            // Interactables
            if (useRealAI && currentInteractables.length > 0) {
                currentInteractables.forEach(obj => {
                    newChoices.push({
                        id: obj.id,
                        label: `${obj.action_label} ${obj.name}`.toUpperCase(),
                        action: `INTERACT:${obj.id}`,
                        icon: obj.icon === 'box' ? <Box size={20} /> : obj.icon === 'cpu' ? <Cpu size={20} /> : <Search size={20} />,
                        type: obj.type === 'LOOT' ? 'loot' : 'skill_check'
                    });
                });
            }

            // Mock Loot
            if (!useRealAI && room) {
                const enemyDefeated = !room.enemy || (room.enemy && combatState.enemyHp <= 0 && !combatState.inCombat);
                if (enemyDefeated) {
                    const lootAvailable = room.loot && !inventory.some(i => i.name === room.loot.name);
                    const isLootVisible = lootAvailable && (!room.isHidden || isInspecting);

                    if (isLootVisible) {
                        newChoices.push({
                            id: 'loot',
                            label: `TAKE ${room.loot.name.toUpperCase()}`,
                            action: `CLIENT_LOOT:${room.loot.name}`,
                            icon: <Hand size={20} />,
                            type: 'loot'
                        });
                    }
                }
                newChoices.push({ id: 'inspect', label: 'INSPECT AREA', action: 'inspect', icon: <Search size={20} />, type: 'skill_check' });
            }
        }

        setChoices(newChoices);
    }, [currentRoomId, isInspecting, inventory, gameData, combatState.inCombat, combatState.enemyHp, currentInteractables, useRealAI, roomRegistry]);

    return {
        // State
        gameData,
        roomRegistry,
        visitedIds,
        currentRoomId,
        inventory,
        feed,
        choices,
        inputValue,
        isProcessing,
        combatState,
        useRealAI,

        // Setters
        setInputValue,

        // Actions
        handleSend,
        handleAction,

        // Computed
        currentRoom: useRealAI ? roomRegistry[currentRoomId] : gameData?.rooms?.[currentRoomId]
    };
}
