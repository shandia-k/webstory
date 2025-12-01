import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "../constants/systemPrompt";
import { SCENARIOS } from "../constants/scenarios";
import { TRANSLATIONS } from "../constants/textUI";
import { getMockResponse, getMockSetupData, getMockSector } from "./mockService";

const getUiText = (lang) => {
    const langKey = Object.keys(TRANSLATIONS).find(k => k.toLowerCase() === (lang || 'English').toLowerCase()) || 'English';
    return TRANSLATIONS[langKey];
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

    // --- MOCK MODE FOR TESTING ---
    if (gameState.isMockMode) {
        return getMockResponse(userInput, gameState);
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

## CURRENT STATE
Genre: ${gameState.genre}
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
      "icon": "box", // box, cpu, search, skull
      "description": "Visual details.",
      "action_label": "Open/Hack/Attack",
      "requirements": { "stat": "tech", "value": 5 }, // Optional
      "result": {
        "narrative": "What happens on success.",
        "items": [{ "name": "Item Name", "count": 1 }], // Optional
        "stat_updates": { "health": -5 }, // Optional
        "remove_after": true // If true, object disappears
      }
    }
  ]
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON
        try {
            // Remove markdown code blocks if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
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
        // Mock fallback for testing without API key
        if (gameState.isMockMode) return getMockSector(startRoomId);
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
- Genre: ${gameState.genre}
- Quest: ${gameState.quest}
- Current Stats: ${JSON.stringify(gameState.stats)}
- Start Room ID: ${startRoomId || "room_1"} (This is the entry point)

## OUTPUT FORMAT (STRICT JSON)
Return a single JSON object with this structure:
{
  "sector_id": "sector_${Date.now()}",
  "narrative_intro": "Atmospheric description of entering this new area.",
  "start_room_id": "${startRoomId || "room_1"}",
  "rooms": [
    {
      "id": "room_1",
      "name": "Room Name",
      "coordinates": { "x": 50, "y": 50 }, // Start room is always center (50,50) relative to sector
      "exits": { 
        "north": "room_2",
        "east": "room_3" 
      },
      "description": "Visual description.",
      "interactables": [
         {
            "id": "obj_1",
            "name": "Crate",
            "type": "LOOT",
            "icon": "box",
            "action_label": "Open",
            "result": { "narrative": "Found a medkit.", "items": [{ "name": "Medkit", "count": 1 }] }
         }
      ]
    },
    {
      "id": "room_2",
      "name": "Connected Room",
      "coordinates": { "x": 50, "y": 35 }, // North = y-15, South = y+15, East = x+15, West = x-15
      "exits": { "south": "room_1" },
      "interactables": []
    }
  ]
}

## RULES
1. Ensure all rooms are reachable from the start_room.
2. Coordinates MUST align with exits (North is Y-15, East is X+15).
3. Include at least one "Goal" or "Key" item in this sector.
4. "exits" values MUST be the ID of the target room.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);

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
    'STATS', 'NARRATIVE', 'GENRE_SELECTION', 'GENRES', 'CHARACTER_CREATION'
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
    const isMock = localStorage.getItem('nexus_mock_mode') === 'true';
    if (!apiKey && !isMock) {
        throw new Error("API Key missing. Please configure in Settings or enable Mock Mode.");
    }

    // Mock Mode
    if (localStorage.getItem('nexus_mock_mode') === 'true') {
        return getMockSetupData();
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Generate a JSON object for a Sci-Fi RPG Character Creation screen.
    Genre: ${genre}
    Language: ${language}

    Output JSON Structure:
    {
        "suggested_names": ["Name1", "Name2", ...],
        "roles": [
            {
                "id": "role_id",
                "name": "Role Name",
                "description": "Short description",
                "stats": { "health": 100, "energy": 100, "stat3": 50, "stat4": 50 },
                "starting_items": [
                    { "name": "Item Name", "count": 1, "type": "tool/weapon/consumable", "icon": "emoji" }
                ]
            }
        ],
        "intro_narrative": "Short atmospheric text setting the scene for character creation."
    }
    
    Provide 3 distinct roles (e.g., Combat, Tech, Stealth/Social).
    Ensure items have valid types and emojis.
    IMPORTANT: Generate 3-5 vital statistics relevant to the genre (e.g., Sanity for Horror, Charm for Romance, Shield for Sci-Fi). Do NOT limit to just health/energy.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Failed to parse JSON");
    } catch (error) {
        console.error("Setup Generation Error:", error);
        throw error;
    }
};

export const translateUiSubset = async (apiKey, targetLanguage, uiSubset) => {
    if (!apiKey) throw new Error("API Key Missing");

    if (localStorage.getItem('nexus_mock_mode') === 'true') {
        return uiSubset; // No translation in mock
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

        const prompt = `
You are a professional translator for a Sci-Fi RPG Game UI.
Translate the following JSON object values into this language: "${targetLanguage}".
Do NOT translate keys. Keep the structure exactly the same.
Maintain the tone: Sci-Fi, Cyberpunk, Serious, Immersive.

IMPORTANT RULES:
1. Use FORMAL, STANDARD language only.
2. STRICTLY FORBID slang, informal, or "gaul" language.
3. If the requested language is a slang variant (e.g., "Bahasa Gaul", "Slang"), translate it to the STANDARD FORMAL version of that language (e.g., standard Indonesian).
4. Ensure terminology fits a futuristic sci-fi setting.

Source JSON:
${JSON.stringify(uiSubset, null, 2)}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return uiSubset;
    } catch (error) {
        console.error("Translation Error:", error);
        return uiSubset;
    }
};
