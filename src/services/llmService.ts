import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "../constants/systemPrompt";
import { TRANSLATIONS } from "../constants/textUI";

// --- TYPES ---
interface SafetySetting {
    category: string;
    threshold: string;
}

interface ModelResponse {
    result: any;
    model: string;
}

// --- CONFIG ---
const getUiText = (lang: string) => {
    const langKey = Object.keys(TRANSLATIONS).find(k => k.toLowerCase() === (lang || 'English').toLowerCase()) || 'English';
    return (TRANSLATIONS as any)[langKey];
};

const SAFETY_SETTINGS: SafetySetting[] = [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
];

let PRIMARY_MODEL = "gemini-2.5-flash";
let FALLBACK_MODELS = [
    "gemini-2.5-flash-preview-09-2025",
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp"
];

let modelListPromise: Promise<void> | null = null;

const fetchAvailableModels = async (apiKey: string): Promise<void> => {
    try {
        console.log("Fetching available Gemini models...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) throw new Error("Failed to fetch models");

        const data = await response.json();
        const models: any[] = data.models || [];

        const flashModels = models
            .filter((m: any) => m.name.includes("gemini") && m.name.includes("flash"))
            .map((m: any) => m.name.replace("models/", ""));

        if (flashModels.length > 0) {
            const latestFlash = flashModels.find((m: string) => m.includes("2.5") || m.includes("2.0")) || flashModels[0];

            PRIMARY_MODEL = latestFlash;
            FALLBACK_MODELS = [...new Set([...flashModels, ...FALLBACK_MODELS])];

            console.log("Active Model set to:", PRIMARY_MODEL);
            console.log("Fallback Models:", FALLBACK_MODELS);
        }
    } catch (e: any) {
        console.warn("Model auto-discovery failed, using defaults:", e.message);
    }
};

const saveDebugLog = (type: string, data: any, prompt: string | null = null, model: string | null = null) => {
    try {
        const history = JSON.parse(localStorage.getItem('nexus_debug_history') || '[]');
        const now = new Date();
        const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        const newEntry = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            timestamp: timestamp,
            type: type,
            prompt: prompt,
            model: model,
            data: data
        };

        const updatedHistory = [newEntry, ...history].slice(0, 50);
        localStorage.setItem('nexus_debug_history', JSON.stringify(updatedHistory));
    } catch (e) {
        console.error("Failed to save debug log", e);
    }
};

const generateWithFallback = async (apiKey: string, prompt: any, systemInstruction: string | null = null): Promise<ModelResponse> => {
    if (!modelListPromise) {
        modelListPromise = fetchAvailableModels(apiKey);
    }
    await modelListPromise;

    const genAI = new GoogleGenerativeAI(apiKey);

    const tryModel = async (modelName: string): Promise<ModelResponse> => {
        const config: any = {
            model: modelName,
            safetySettings: SAFETY_SETTINGS,
            generationConfig: { responseMimeType: "application/json" },
        };
        const model = genAI.getGenerativeModel(config);
        console.log(`Attempting generation with ${modelName}...`);

        const result = await model.generateContent(prompt);
        return { result, model: modelName };
    };

    try {
        return await tryModel(PRIMARY_MODEL);
    } catch (error: any) {
        console.warn(`${PRIMARY_MODEL} failed:`, error.message);

        if (error.message.includes("503") || error.message.includes("404") || error.message.includes("not found")) {
            for (const fallbackModel of FALLBACK_MODELS) {
                try {
                    console.log(`Retrying with fallback ${fallbackModel}...`);
                    saveDebugLog("API_FALLBACK_ATTEMPT", { to: fallbackModel, reason: error.message }, typeof prompt === 'string' ? prompt : 'Image Prompt', PRIMARY_MODEL);
                    const response = await tryModel(fallbackModel);
                    saveDebugLog("API_FALLBACK_SUCCESS", { model: fallbackModel }, typeof prompt === 'string' ? prompt : 'Image Prompt', fallbackModel);
                    return response;
                } catch (fallbackError: any) {
                    console.warn(`${fallbackModel} failed:`, fallbackError.message);
                }
            }
        }
        throw error;
    }
};

export const testApiKey = async (apiKey: string, language: string): Promise<boolean> => {
    const uiText = getUiText(language);
    if (!apiKey) throw new Error(uiText.API_ERRORS.EMPTY_KEY);

    try {
        const { result, model } = await generateWithFallback(apiKey, "Test connection");
        await result.response;
        saveDebugLog("API_TEST_SUCCESS", { model }, "Test connection", model);
        return true;
    } catch (error: any) {
        console.error("API Test Error:", error);
        saveDebugLog("API_ERROR", { function: "testApiKey", error: error.message });
        throw new Error(error.message || uiText.API_ERRORS.DEFAULT_FAIL);
    }
};

export const generateGameSetup = async (apiKey: string, genre: string, language: string) => {
    if (!apiKey) throw new Error("API Key missing. Please configure in Settings.");

    const prompt = `
    ${SYSTEM_PROMPT}
    ## TASK: GENERATE ADOPTION CANDIDATES (PALS)
    Context: ${genre} (Create candidates that fit this specific theme/world)
    Language: ${language}
    ## OUTPUT FORMAT (STRICT JSON)
    {
        "intro_narrative": "A short, cute message welcoming the player...",
        "candidates": [
            {
                "id": "pal_1",
                "name": "Creative Name",
                "emoji": "🐱",
                "element": "api",
                "trait": "brave",
                "desc": "A short, cute personality description.",
                "stats": { "happiness": 80, "energy": 60, "hunger": 50 },
                "items": [
                    { "name": "Item Name", "icon": "🧶", "desc": "Short item description" }
                ],
                "suggested_names": ["Name1", "Name2"]
            }
        ]
    }
    `;

    try {
        console.log("Generating Setup with prompt:", prompt);
        saveDebugLog("SETUP_REQUEST", { prompt }, prompt);
        const { result, model } = await generateWithFallback(apiKey, prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            saveDebugLog("CHAR_SETUP", parsed, prompt, model);
            return parsed;
        }
        throw new Error("Failed to parse JSON");
    } catch (error: any) {
        console.error("Setup Generation Error:", error);
        saveDebugLog("ERROR_SETUP", { error: error.message }, prompt);
        throw error;
    }
};

export const generateCampaignStart = async (apiKey: string, genre: string, palData: any, language: string) => {
    if (!apiKey) throw new Error("API Key Missing");

    try {
        const prompt = `
    ## ROLE
    System Architect for a continuous RPG Campaign.
    World Genre: ${genre}
    Hero: ${palData.name} (${palData.role?.desc || 'Hero'})
    Language: ${language}
    ## TASK
    Create a "Master Plan" for a long-form adventure.
    ## OUTPUT JSON
    {
        "title": "Epic Title",
        "main_quest": "The ultimate goal",
        "antagonist": "Main villain",
        "tone": "Brief tone",
        "chapter": 1,
        "history": []
    }
    `;
        console.log("Generating Campaign Start...");
        const { result, model } = await generateWithFallback(apiKey, prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        throw new Error("Failed to parse Campaign JSON");
    } catch (error) {
        console.error("Campaign Gen Error:", error);
        return {
            title: "The Unknown Journey",
            main_quest: "Explore the world and find your destiny.",
            chapter: 1,
            history: []
        };
    }
};

export const generateAdventure = async (apiKey: string, palData: any, genre: string, language: string = 'English', campaignState: any = null) => {
    if (!apiKey) throw new Error("API Key Missing");

    try {
        const stats = palData.role?.stats || palData.stats || {};
        const level = stats.level || 1;
        const currentHp = stats.energy || 50;
        const maxHp = stats.maxHp || 100;

        const prompt = `
    ## ROLE
    Gamemaster for a "Cute ${genre}" RPG.
    Player Character: ${palData.name} (${palData.role?.desc || 'Hero'}).
    - Level: ${level}
    - Health: ${currentHp}/${maxHp}
    ## LANGUAGE
    ${language}

## TASK
Generate a **linear mini-adventure** with 3 scenes.
Format: JSON.

## JSON STRUCTURE
{
  "sector": "Creative Location Name",
  "theme_color": "from-indigo-900 to-purple-900",
  "enemy": { "name": "Enemy Name", "emoji": "👹", "element": "api", "intro": "A wild Enemy appears!" },
  "scenes": [
    { "type": "normal", "text": "Story text...", "visual": "🏰", "choices": [{ "label": "Action", "effect": { "hp": -5, "loot": 10 } }] },
    { "type": "conflict", "text": "Conflict text...", "visual": "👀", "choices": [{ "label": "Fight", "effect": { "hp": 0 } }] },
    { "type": "ending", "text": "Final scene...", "visual": "🎉", "choices": [{ "label": "Return Home", "isReturn": true, "effect": { "loot": 50 } }] }
  ]
}
`;

        console.log("Generating Adventure with prompt:", prompt);
        const { result, model } = await generateWithFallback(apiKey, prompt);
        const response = await result.response;
        const text = response.text();

        let parsed;
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const cleanText = jsonMatch ? jsonMatch[0] : text;
            parsed = JSON.parse(cleanText);
        } catch (e: any) {
            console.error("JSON Parse Error", text);
            return mockAdventureFallback(`JSON Error: ${e.message.slice(0, 20)}`);
        }

        saveDebugLog("ADVENTURE_GEN", parsed, prompt, model);
        return parsed || mockAdventureFallback("Empty Response");

    } catch (error: any) {
        console.error("Adventure Gen Error:", error);
        return mockAdventureFallback(`API Error: ${error.message}`);
    }
};

const mockAdventureFallback = (debugInfo = "") => ({
    sector: "Lost Connection Void",
    theme_color: "from-gray-800 to-black",
    scenes: [
        {
            text: `The connection to the Adventureverse is weak... (${debugInfo})`,
            visual: "📡",
            choices: [{ label: "Try Again", isReturn: true }]
        }
    ]
});

export const analyzeImagePoints = async (apiKey: string, base64Image: string, promptText: string | null = null) => {
    if (!apiKey) throw new Error("API Key Missing");

    const defaultPrompt = `
    Analyze this 2D character sprite sheet.
    Return a JSON object with "parts" containing [x, y] coordinates (0-1000 scale relative to image size).
    REQUIRED PARTS: head, torso, arm_L_upper, arm_R_upper, leg_L, leg_R.
    OUTPUT JSON ONLY: { "parts": { "head": [x, y], ... } }
    `;

    try {
        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
        const imagePart = {
            inlineData: {
                data: cleanBase64,
                mimeType: "image/png"
            }
        };

        const finalPrompt = [promptText || defaultPrompt, imagePart];
        console.log("Requesting Vision Analysis...");

        const { result, model } = await generateWithFallback(apiKey, finalPrompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            saveDebugLog("VISION_SUCCESS", parsed, "Vision Analysis", model);
            return parsed;
        }
        throw new Error("Failed to parse Vision JSON");

    } catch (error: any) {
        console.error("Vision API Error:", error);
        saveDebugLog("VISION_ERROR", { error: error.message });
        throw error;
    }
};
