import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "../constants/systemPrompt";
import { SCENARIOS } from "../constants/scenarios";
import { TRANSLATIONS } from "../constants/textUI";
import { getMockResponse, getMockSetupData } from "./mockService";

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
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse LLM response:", text);
            // Fallback error response
            return {
                narrative: "The system glitched. Data corruption detected. (JSON Parse Error)",
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
