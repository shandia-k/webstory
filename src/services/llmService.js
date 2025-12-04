import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "../constants/systemPrompt";
import { SCENARIOS } from "../constants/scenarios";
import { TRANSLATIONS } from "../constants/textUI";


const getUiText = (lang) => {
    const langKey = Object.keys(TRANSLATIONS).find(k => k.toLowerCase() === (lang || 'English').toLowerCase()) || 'English';
    return TRANSLATIONS[langKey];
};

// Helper to save debug logs to localStorage
const saveDebugLog = (data, type = "RESPONSE") => {
    try {
        const history = JSON.parse(localStorage.getItem('nexus_debug_history') || '[]');
        const now = new Date();
        const timestamp = `${now.getDate().toString().padStart(2, '0')}:${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        const newEntry = {
            id: Date.now(),
            timestamp: timestamp,
            type: type,
            data: data
        };

        const updatedHistory = [newEntry, ...history].slice(0, 20); // Keep max 20
        localStorage.setItem('nexus_debug_history', JSON.stringify(updatedHistory));
    } catch (e) {
        console.error("Failed to save debug log", e);
    }
};

export const generateGameResponse = async (apiKey, userInput, gameState) => {
    const uiText = getUiText(gameState.language);

    // --- LOCAL FALLBACKS FOR INITIALIZATION ---
    // This saves tokens and ensures fast startup
    if (userInput.startsWith('SYSTEM_INIT_GENRE:')) {
        const genre = userInput.split(':')[1].trim().toLowerCase();
        // Handle composite keys like "scifi|NAME:..." by matching start
        const matchedGenre = Object.keys(SCENARIOS).find(k => genre.startsWith(k)) || 'scifi';
        const scenario = SCENARIOS[matchedGenre];

        // If this is a custom initialization (has NAME), DO NOT overwrite stats/inventory
        if (userInput.includes('|NAME:')) {
            const { stats_set, inventory_set, ...rest } = scenario;
            return rest;
        }

        return scenario;
    }

    if (!apiKey) {
        throw new Error(uiText.API_ERRORS.MISSING_KEY);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" },
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
        });

        // Construct the prompt
        const prompt = `
${SYSTEM_PROMPT}

## GAME CONFIGURATION
Game Mode: ${gameState.gameMode} (${gameState.gameMode === 'rpg' ? 'Strict Mechanics, Stats, Inventory, Map' : 'Narrative Focus, Storytelling, No Stats'})
Theme/Atmosphere: ${gameState.theme} (Adopt this tone/style)

## CURRENT STATE
Quest: ${gameState.quest}
Stats: ${JSON.stringify(gameState.stats)}
Inventory: ${JSON.stringify(gameState.inventory.map(i => i.name))}
Summary So Far: ${gameState.summary}

## RECENT HISTORY
${gameState.history.slice(-5).map(h => `${h.role.toUpperCase()}: ${h.content}`).join('\n')}

## USER ACTION
${userInput}

## LANGUAGE
Reply in this language: ${gameState.language || 'English'}

## OUTPUT FORMAT (STRICT JSON)
You are a Game Master. Return a valid JSON object. Do NOT wrap in markdown code blocks.
Structure:
{
  "narrative": "Detailed description of the scene/action result.",
  "room_id": "unique_id_for_current_room",
  "map_data": {
    "name": "Room Name",
    "exits": {
      "north": { "type": "OPEN", "target_id": "id_or_unknown" },
      "east": { "type": "LOCKED", "target_id": "???", "requirement": "Key Name" }
    }
  },
  "interactables": [
    {
      "id": "obj_1",
      "name": "Object Name",
      "type": "LOOT", // LOOT, TERMINAL, EXAMINE, ENEMY
      "icon": "📦", // Emoji icon
      "description": "Visual details.",
      "action_label": "Open/Hack/Attack",
      "requirements": { "stat": "tech", "value": 5 }, // Optional
      "result": {
        "narrative": "What happens on success.",
        "items": [
            { 
                "name": "Item Name", 
                "count": 1, 
                "type": "consumable", 
                "icon": "❤️", 
                "desc": "Short description", 
                "tags": ["TAG"],
                "value": 1, 
                "max_value": 1
            }
        ],
        "stat_updates": { "health": -5 }, // Optional
        "remove_after": true // If true, object disappears
      }
    }
  ],
  "inventory_updates": {
      "add": [
          { 
              "name": "Item Name", 
              "count": 1, 
              "type": "misc", 
              "icon": "💎", 
              "desc": "Description", 
              "tags": ["TAG"] 
          }
      ],
      "remove": [
          { "name": "Item Name", "count": 1 }
      ]
  }
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON
        try {
            // Remove markdown code blocks if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanText);
            saveDebugLog(parsed, "GAME_RESPONSE");
            return parsed;
        } catch (e) {
            console.error("Failed to parse LLM response:", text);
            // Fallback error response
            return {
                narrative: "The system glitched. Data corruption detected. (JSON Parse Error)",
                room_id: "error_room",
                map_data: { name: "Glitch Space", exits: {} },
                interactables: [],
                outcome: "NEUTRAL",
                stat_updates: {},
                inventory_updates: { add: [], remove: [] },
                quest_update: null,
                game_over: false
            };
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};

/**
 * Generates a "Sector" of 5-10 connected rooms.
 * This is the core of the Pre-Generation architecture.
 */
export const generateSector = async (apiKey, gameState, startRoomId = null) => {
    const uiText = getUiText(gameState.language);

    if (!apiKey) {
        throw new Error(uiText.API_ERRORS.MISSING_KEY);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" },
        });



        const prompt = `
${SYSTEM_PROMPT}

## TASK: GENERATE SECTOR
You are a Dungeon Architect. Generate a coherent sector of 5-8 connected rooms.
Context:
- Game Mode: ${gameState.gameMode}
- Theme: ${gameState.theme}
- Quest: ${gameState.quest}
- Character Name: ${gameState.playerName || "Unknown"}
- Role: ${gameState.playerRole || "Survivor"}
- Bio: ${gameState.playerBio || "N/A"}
- Current Stats: ${JSON.stringify(gameState.stats)}
- Start Room ID: ${startRoomId || "room_1"} (This is the entry point)
- Language: ${gameState.language || 'English'} (Generate all names and descriptions in this language)
- **GRID SYSTEM**: 8x8 Grid (Rows 0-7, Cols 0-7).
  - **(0,0)** is TOP-LEFT (North-West).
  - **+x** goes EAST.
  - **+y** goes SOUTH.
  - **North** = y - 1
  - **South** = y + 1

${startRoomId === 'start_room' ? `
## SPECIAL INSTRUCTION: GAME START
This is the **VERY FIRST** sector of the game.
1. The **Narrative Intro** must be a compelling "Hook" (e.g., waking up from cryosleep, crashing on a planet, entering the dungeon).
2. The **Start Room** should be atmospheric and relatively safe, allowing the player to get their bearings.
3. Establish the stakes immediately in the \`sector_goal\`.
` : ''}

## OUTPUT FORMAT (STRICT JSON)
Return a single JSON object with this structure:
{
  "sector_id": "sector_${Date.now()}",
  "narrative_intro": "Atmospheric description of entering this new area.",
  "start_room_id": "${startRoomId || "room_1"}",
  "sector_goal": "Describe the main objective of this sector (e.g., 'Find the Red Keycard to unlock the Blast Door').",
  "exit_condition": {
      "room_id": "room_X", // The room containing the exit
      "direction": "north", // The direction of the exit (north, south, east, west)
      "type": "LOCKED_DOOR", // LOCKED_DOOR, BOSS, PUZZLE
      "requires": "Red Keycard" // Item name or condition required
  },
  "rooms": [
    {
      "id": "room_1",
      "name": "Room Name",
      "coordinates": { "x": 0, "y": 4 }, // Grid Coordinates (0-7). Start Room MUST be at an EDGE.
      "exits": { 
        "north": "room_2",
        "east": "room_3" 
      },
      "description": "Visual description.",
      "interactables": [
         {
            "id": "obj_1",
            "name": "Crate",
            "type": "LOOT", // LOOT, TERMINAL, EXAMINE, ENEMY, LOCKED
            "icon": "box", // Use simple keys: box, zap, shield, cpu, crosshair, swords, eye, key, lock, skull, hand, message
            "description": "A rusted supply crate.",
            "requires": "Red Keycard", // OPTIONAL: If type is LOCKED
            "action_label": "Open",
            "result": { 
                "narrative": "Found a medkit.", 
                "items": [
                    { 
                        "name": "Medkit", 
                        "count": 1, 
                        "type": "consumable", 
                        "icon": "❤️", 
                        "desc": "Restores 20 HP", 
                        "tags": ["HEAL"],
                        "value": 1, // Current durability/charges
                        "max_value": 1 // Max durability/charges
                    }
                ] 
            }
         }
      ]
    }
  ]
}

## RULES
1. **STRUCTURE**: Generate 5-8 connected rooms. All rooms must be reachable.
2. **GRID LAYOUT**:
   - Use an 8x8 Grid (x: 0-7, y: 0-7).
   - **START ROOM**: Must be placed on an **EDGE** of the grid (e.g., x=0, x=7, y=0, or y=7).
   - **EXIT ROOM**: Must be placed on a **DIFFERENT EDGE** than the start room.
   - Rooms must connect logically (e.g., if Room A is at (0,0) and Room B is at (0,1), they connect via South/North).
3. **EXIT LOGIC (CRITICAL)**:
   - One room MUST be the "Exit Room".
   - This room MUST have an exit pointing to **"SECTOR_EXIT"** (e.g., "north": "SECTOR_EXIT").
   - This "SECTOR_EXIT" is what allows the player to leave the sector.
   - The exit MUST be blocked by a **BOSS** (Enemy) or a **LOCKED DOOR** (Puzzle).
   - If Locked: Place the Key/Code/Tool required to open it in a **DIFFERENT** room (not the exit room).
   - If Boss: The exit opens only after defeating the boss.
4. **ITEMS**: Must have \`name\`, \`count\`, \`type\`, \`icon\` (emoji), \`desc\`, \`tags\`.
5. **CREATIVITY**: Vary the obstacles. Not just "Keys". Could be "Fuse", "Password", "Crowbar", "Data Chip".
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanText);
        saveDebugLog(parsed, "SECTOR_GEN");
        return parsed;

    } catch (error) {
        console.error("Sector Generation Error:", error);
        // Fallback for error
        return {
            sector_id: "error_sector",
            narrative_intro: "The simulation is unstable. Proceed with caution.",
            start_room_id: "error_room",
            rooms: [{
                id: "error_room",
                name: "Glitch Space",
                coordinates: { x: 50, y: 50 },
                exits: {},
                interactables: []
            }]
        };
    }
};

export const testApiKey = async (apiKey, language) => {
    const uiText = getUiText(language);

    if (!apiKey) throw new Error(uiText.API_ERRORS.EMPTY_KEY);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        await model.generateContent("Test connection");
        return true;
    } catch (error) {
        console.error("API Test Error:", error);

        // Map error messages
        let message = uiText.API_ERRORS.UNKNOWN_ERROR;
        if (error.message.includes("400")) message = uiText.API_ERRORS.INVALID_KEY;
        else if (error.message.includes("403")) message = uiText.API_ERRORS.ACCESS_DENIED;
        else if (error.message.includes("429")) message = uiText.API_ERRORS.QUOTA_EXCEEDED;
        else if (error.message.includes("500")) message = uiText.API_ERRORS.SERVER_ERROR;
        else if (error.message.includes("503")) message = uiText.API_ERRORS.SERVICE_UNAVAILABLE;
        else if (error.message.includes("fetch failed")) message = uiText.API_ERRORS.NETWORK_ERROR;
        else message = error.message || uiText.API_ERRORS.DEFAULT_FAIL;

        throw new Error(message);
    }
};

export const CRITICAL_UI_KEYS = [
    'HEADER', 'SIDEBAR', 'MENU', 'INPUT_PLACEHOLDER', 'INPUT_FOOTER',
    'STATS', 'NARRATIVE', 'GENRE_SELECTION', 'CHARACTER_CREATION'
];

export const getUiBatches = (fullText) => {
    const critical = {};
    const secondary = {};

    Object.keys(fullText).forEach(key => {
        if (CRITICAL_UI_KEYS.includes(key)) {
            critical[key] = fullText[key];
        } else {
            secondary[key] = fullText[key];
        }
    });

    return { critical, secondary };
};

/**
 * Generates initial game setup data (roles, names, items) based on genre.
 */
export const generateGameSetup = async (apiKey, genre, language) => {
    const isMock = false;
    if (!apiKey) {
        throw new Error("API Key missing. Please configure in Settings.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    ${SYSTEM_PROMPT}

    ## TASK: GENERATE CHARACTER CREATION DATA
    Context: ${genre}
    Language: ${language}

    ## OUTPUT FORMAT (STRICT JSON)
    {
        "suggested_names": ["Name1", "Name2", ...],
        "roles": [
            {
                "id": "role_id",
                "name": "Role Name",
                "description": "Short description",
                "stats": { "health": 100, "energy": 100, "hacking": 45, "stealth": 60 },
                "stat_definitions": {
                    "health": { "category": "vital", "icon": "❤️", "description": "Life force", "color": "red" },
                    "energy": { "category": "vital", "icon": "⚡", "description": "Action resource", "color": "yellow" },
                    "hacking": { "category": "skill", "icon": "💻", "description": "Tech proficiency", "color": "blue" },
                    "stealth": { "category": "skill", "icon": "👻", "description": "Avoid detection", "color": "gray" }
                },
                "starting_items": [
                    { 
                        "name": "Item Name", 
                        "count": 1, 
                        "type": "weapon", // weapon, tool, consumable, key, misc
                        "icon": "🔫", 
                        "desc": "Short item description",
                        "tags": ["STARTING"]
                    }
                ]
            }
        ],
        "intro_narrative": "Short atmospheric text setting the scene for character creation."
    }
    
    ## RULES
    1. Provide 3 distinct roles.
    2. **STATS GENERATION**:
       - Generate 2-3 **VITAL** stats (e.g., Health, Sanity, Battery). These deplete and cause failure/death if 0. Scale: 0-100.
       - Generate 3-4 **SKILL** stats (e.g., Hacking, Charisma, Strength). These determine success chance. Scale: 0-100.
       - Combine ALL into the single "stats" object.
       - Define their category ("vital" or "skill") in "stat_definitions".
    3. Ensure items have valid types, icons, and descriptions.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            saveDebugLog(parsed, "CHAR_SETUP");
            return parsed;
        }
        throw new Error("Failed to parse JSON");
    } catch (error) {
        console.error("Setup Generation Error:", error);
        throw error;
    }
};

export const translateUiSubset = async (apiKey, targetLanguage, uiSubset) => {
    if (!apiKey) throw new Error("API Key Missing");

    if (!apiKey) throw new Error("API Key Missing");

    // Only skip if explicitly in mock mode AND no key (though check above covers no key)
    // Actually, if we have a key, we should try to translate even if in mock mode for other things.
    // But if the user wants purely mock experience, maybe they don't want API calls?
    // However, UI translation is a setup step. Let's allow it if key is valid.

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" },
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
        });

        const prompt = `
You are a professional translator for a Role-Playing Game (RPG) UI.
Translate the following JSON object values into this language: "${targetLanguage}".
Do NOT translate keys. Keep the structure exactly the same.
Maintain a professional, immersive gaming tone.

IMPORTANT RULES:
1. Use FORMAL, STANDARD language only.
2. STRICTLY FORBID slang, informal, or "gaul" language.
3. If the requested language is a slang variant (e.g., "Bahasa Gaul", "Slang"), translate it to the STANDARD FORMAL version of that language (e.g., standard Indonesian).

Source JSON:
${JSON.stringify(uiSubset, null, 2)}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            saveDebugLog(parsed, "UI_TRANSLATE");
            return parsed;
        }
        return uiSubset;
    } catch (error) {
        console.error("Translation Error:", error);
        return uiSubset;
    }
};
