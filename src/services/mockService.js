/**
 * Generates a mock response for testing purposes without calling the real LLM API.
 * @param {string} userInput - The user's action or input.
 * @param {object} gameState - The current game state (stats, inventory, etc.).
 * @returns {object} A mock game response object matching the LLM schema.
 */
export const getMockResponse = (userInput, gameState) => {
    const lowerInput = userInput.toLowerCase();

    // --- MOCK COMMANDS ---
    if (lowerInput.startsWith('mock:')) {
        const command = lowerInput.split(':')[1]?.trim();

        if (command === 'success') {
            return {
                narrative: "[MOCK] Critical Success! The system responds perfectly to your input.",
                outcome: "SUCCESS",
                stat_updates: { energy: -5, experience: 10 },
                inventory_updates: { add: [], remove: [] },
                quest_update: null,
                game_over: false,
                choices: [
                    { label: "Continue", action: "continue", type: "action" }
                ]
            };
        }

        if (command === 'fail') {
            return {
                narrative: "[MOCK] Critical Failure! Sparks fly and you take damage.",
                outcome: "FAILURE",
                stat_updates: { health: -15, energy: -5 },
                inventory_updates: { add: [], remove: [] },
                quest_update: null,
                game_over: false,
                choices: [
                    { label: "Recover", action: "recover", type: "action" }
                ]
            };
        }

        if (command === 'loot') {
            return {
                narrative: "[MOCK] You found a hidden cache of supplies.",
                outcome: "SUCCESS",
                stat_updates: {},
                inventory_updates: {
                    add: [
                        { name: "Mock Item " + Math.floor(Math.random() * 100), count: 1, type: "resource", icon: "📦" },
                        { name: "Rare Chip", count: 1, type: "intel", icon: "💾" }
                    ],
                    remove: []
                },
                quest_update: null,
                game_over: false,
                choices: [
                    { label: "Take All", action: "take all", type: "action" }
                ]
            };
        }

        if (command === 'cards') {
            return {
                narrative: "[MOCK] Testing Action Cards display. All types generated.",
                outcome: "NEUTRAL",
                stat_updates: {},
                inventory_updates: { add: [], remove: [] },
                quest_update: null,
                game_over: false,
                choices: [
                    { label: "Standard Action", action: "test action", type: "action" },
                    { label: "Skill Check (High)", action: "test skill", type: "skill_check", meta: { probability: "85%", stat: "tech" } },
                    { label: "Dice Roll", action: "test dice", type: "dice", meta: { probability: "Roll > 15" } },
                    { label: "Resource Cost", action: "test cost", type: "resource", meta: { cost: "2 Energy" } }
                ]
            };
        }

        if (command === 'delay') {
            // This is handled in the UI by the delay itself, but we return a standard response
            return {
                narrative: "[MOCK] Response received after simulated delay.",
                outcome: "NEUTRAL",
                stat_updates: {},
                inventory_updates: { add: [], remove: [] },
                quest_update: null,
                game_over: false,
                choices: [
                    { label: "Continue", action: "continue", type: "action" }
                ]
            };
        }
    }

    // --- STANDARD MOCK LOGIC ---
    let mockResponse = {
        narrative: `[MOCK] You perform: "${userInput}". The simulation reacts accordingly.`,
        outcome: "NEUTRAL",
        stat_updates: { energy: -1 },
        inventory_updates: { add: [], remove: [] },
        quest_update: null,
        game_over: false,
        choices: []
    };

    // Simple keyword matching for dynamic mock responses
    if (lowerInput.includes("hack")) {
        mockResponse.narrative = "[MOCK] You jack into the console. Sparks fly as you bypass the firewall.";
        mockResponse.outcome = "SUCCESS";
        mockResponse.stat_updates = { energy: -10, intelligence: 1 };
    } else if (lowerInput.includes("force") || lowerInput.includes("attack")) {
        mockResponse.narrative = "[MOCK] You smash it open! But you hurt your hand in the process.";
        mockResponse.outcome = "FAILURE";
        mockResponse.stat_updates = { health: -5, strength: 1 };
    } else if (lowerInput.includes("scan")) {
        mockResponse.narrative = "[MOCK] Scanning area... Life signs detected.";
        mockResponse.outcome = "NEUTRAL";
        mockResponse.stat_updates = { energy: -2 };
    } else if (lowerInput.includes("heal")) {
        mockResponse.narrative = "[MOCK] You use a medkit. Feeling better.";
        mockResponse.outcome = "SUCCESS";
        mockResponse.stat_updates = { health: 20 };
    }

    // Always return new choices to keep the loop going
    mockResponse.choices = [
        { label: "Scan Area", action: "scan area", type: "action" },
        { label: "Hack Console", action: "hack console", type: "skill_check", meta: { probability: "45%", stat: "tech" } },
        { label: "Force Open", action: "force open", type: "dice", meta: { probability: "Roll > 10" } },
        { label: "Use Medkit", action: "heal self", type: "resource", meta: { cost: "1 Item" } }
    ];

    return mockResponse;
};

/**
 * Generates mock setup data for character creation.
 */
export const getMockSetupData = async () => {
    await new Promise(r => setTimeout(r, 1500)); // Simulate delay
    return {
        suggested_names: ["Kael", "Vex", "Orion", "Lyra", "Zane"],
        roles: [
            {
                id: "soldier",
                name: "Vanguard",
                description: "A frontline specialist equipped for heavy combat.",
                stats: { health: 120, energy: 80, shield: 50 },
                starting_items: [
                    { name: "Pulse Rifle", count: 1, type: "weapon", icon: "🔫" },
                    { name: "Medkit", count: 2, type: "consumable", icon: "❤️" }
                ]
            },
            {
                id: "hacker",
                name: "Netrunner",
                description: "A master of digital warfare and infiltration.",
                stats: { health: 80, energy: 120, shield: 30, processing: 90 },
                starting_items: [
                    { name: "Cyberdeck", count: 1, type: "tool", icon: "💻" },
                    { name: "Energy Cell", count: 3, type: "resource", icon: "🔋" }
                ]
            },
            {
                id: "scout",
                name: "Pathfinder",
                description: "Agile and observant, skilled in survival.",
                stats: { health: 100, stamina: 100, stealth: 75 },
                starting_items: [
                    { name: "Combat Knife", count: 1, type: "weapon", icon: "🔪" },
                    { name: "Scanner", count: 1, type: "tool", icon: "📡" }
                ]
            }
        ],
        intro_narrative: "The simulation initializes. Your identity constructs are forming..."
    };
};
