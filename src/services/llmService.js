import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "../constants/systemPrompt";
import { TRANSLATIONS } from "../constants/textUI";
import { sanitizeData, safeLog, validateInput } from "../utils/security";


const getUiText = (lang) => {
    const langKey = Object.keys(TRANSLATIONS).find(k => k.toLowerCase() === (lang || 'English').toLowerCase()) || 'English';
    return TRANSLATIONS[langKey];
};

const SAFETY_SETTINGS = [
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

// Cache the model list promise to avoid redundant calls
let modelListPromise = null;

const getApiKey = () => {
    return localStorage.getItem('nexus_api_key') || '';
};

const fetchAvailableModels = async (apiKey) => {
    try {
        console.log("Fetching available Gemini models...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) throw new Error("Failed to fetch models");

        const data = await response.json();
        const models = data.models || [];

        // Filter for Gemini Flash models, sorted by version (approximate)
        // We prefer 'gemini-1.5-flash' or newer '2.0/2.5' variants that are NOT experimental if possible, 
        // but 'exp' is okay if it's the latest.
        const flashModels = models
            .filter(m => m.name.includes("gemini") && m.name.includes("flash"))
            .map(m => m.name.replace("models/", ""));

        if (flashModels.length > 0) {
            // Simple heuristic: newer numbers are better? 
            // Actually, just putting the found ones at the start of fallback is safer.
            // Or if we find a "latest" stable, make it primary.

            // Let's pick the latest available stable flash as Primary
            const latestFlash = flashModels.find(m => m.includes("2.5") || m.includes("2.0")) || flashModels[0];

            PRIMARY_MODEL = latestFlash;
            FALLBACK_MODELS = [...new Set([...flashModels, ...FALLBACK_MODELS])]; // Merge and deduce

            console.log("Active Model set to:", PRIMARY_MODEL);
            console.log("Fallback Models:", FALLBACK_MODELS);
        }
    } catch (e) {
        // SECURITY: Sanitize error message as it might contain the URL with API key
        safeLog("Model auto-discovery failed, using defaults:", e, [apiKey]);
    }
};

/**
 * Helper to generate content with fallback mechanism.
 * Returns { result, model }
 */
// Update generateWithFallback to handle array prompts (text + image)
const generateWithFallback = async (apiKey, prompt, systemInstruction = null) => {
    // Lazy load models once
    if (!modelListPromise) {
        modelListPromise = fetchAvailableModels(apiKey);
    }
    // We don't await the model list strictly to avoid blocking UI on slow network,
    // BUT for the very first call it might be better to wait to ensure we use a valid model.
    // Let's await it to be safe, as using an invalid hardcoded model is worse.
    await modelListPromise;

    const genAI = new GoogleGenerativeAI(apiKey);

    // Helper to try a specific model
    const tryModel = async (modelName) => {
        const config = {
            model: modelName,
            safetySettings: SAFETY_SETTINGS,
            generationConfig: { responseMimeType: "application/json" },
        };
        // System instruction is only supported in beta/newer sdks, passing it might break if not supported, 
        // but for now we'll stick to prompt-based system instructions to be safe.
        // If we wanted to use systemInstruction: if (systemInstruction) config.systemInstruction = systemInstruction;

        const model = genAI.getGenerativeModel(config);
        console.log(`Attempting generation with ${modelName}...`);

        // SUPPORT IMAGE INPUT: Prompt can be a string or an array [string, imagePart]
        const result = await model.generateContent(prompt);
        return { result, model: modelName };
    };

    // Try Primary
    try {
        return await tryModel(PRIMARY_MODEL);
    } catch (error) {
        safeLog(`${PRIMARY_MODEL} failed:`, error, [apiKey]);

        // Iterate through fallbacks
        if (error.message.includes("503") || error.message.includes("404") || error.message.includes("not found")) {
            for (const fallbackModel of FALLBACK_MODELS) {
                try {
                    console.log(`Retrying with fallback ${fallbackModel}...`);
                    saveDebugLog("API_FALLBACK_ATTEMPT", { to: fallbackModel, reason: error.message }, prompt, PRIMARY_MODEL);
                    const response = await tryModel(fallbackModel);
                    saveDebugLog("API_FALLBACK_SUCCESS", { model: fallbackModel }, prompt, fallbackModel);
                    return response;
                } catch (fallbackError) {
                    safeLog(`${fallbackModel} failed:`, fallbackError, [apiKey]);
                    // Continue to next fallback
                }
            }
        }
        // If all fail, throw the original or last error
        throw error;
    }
};


// Helper to save debug logs to localStorage
const saveDebugLog = (type, data, prompt = null, model = null) => {
    try {
        // SECURITY: Retrieve API key to ensure it's redacted from logs
        const apiKey = getApiKey();
        const secrets = [apiKey];

        const history = JSON.parse(localStorage.getItem('nexus_debug_history') || '[]');
        const now = new Date();
        const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        const newEntry = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            timestamp: timestamp,
            type: type, // 'GAME_RESPONSE', 'SECTOR_GEN', 'CHAR_SETUP'
            prompt: sanitizeData(prompt, secrets),
            model: model,
            data: sanitizeData(data, secrets)
        };

        const updatedHistory = [newEntry, ...history].slice(0, 50); // Keep max 50 for better history
        localStorage.setItem('nexus_debug_history', JSON.stringify(updatedHistory));
    } catch (e) {
        // Can't do much if logging fails, but try not to crash
        // Also don't use console.error if it might leak things, but here it's likely LS error.
        console.warn("Failed to save debug log");
    }
};

export const testApiKey = async (apiKey, language) => {
    const uiText = getUiText(language);

    if (!apiKey) throw new Error(uiText.API_ERRORS.EMPTY_KEY);

    try {
        // Use fallback mechanism for testing too
        const { result, model } = await generateWithFallback(apiKey, "Test connection");
        await result.response;
        saveDebugLog("API_TEST_SUCCESS", { model }, "Test connection", model);
        return true;
    } catch (error) {
        safeLog("API Test Error:", error, [apiKey]);
        // SECURITY: Redact error message
        saveDebugLog("API_ERROR", { function: "testApiKey", error: error.message });

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
    'HUB', 'CUTE_UI', 'COMBAT', 'ADVENTURE', 'API_MODAL', 'API_ERRORS', 'BUTTON_SUMMARY'
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
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        safetySettings: SAFETY_SETTINGS
    });

    const prompt = `
    ${SYSTEM_PROMPT}

    ## TASK: GENERATE ADOPTION CANDIDATES (PALS)
    Context: ${genre} (Create candidates that fit this specific theme/world)
    Language: ${language}

    ## OUTPUT FORMAT (STRICT JSON)
    {
        "intro_narrative": "A short, cute message welcoming the player to the adoption center of this world.",
        "candidates": [
            {
                "id": "pal_1",
                "name": "Creative Name",
                "emoji": "🐱", // STRICT: Single emoji character only
                "element": "api", // api / air / tumbuhan
                "trait": "brave", // brave / coward / lazy / glutton / proud / playful
                "desc": "A short, cute personality description.",
                "stats": { "happiness": 80, "energy": 60, "hunger": 50 },
                "items": [
                    { 
                        "name": "Item Name", 
                        "icon": "🧶", 
                        "desc": "Short item description"
                    }
                ],
                "suggested_names": ["Name1", "Name2", "Name3", "Name4", "Name5"]
            }
        ]
    }
    
    ## RULES
    1. Provide exactly 3 distinct candidates.
    2. **ELEMENTS**: You MUST provide 1 "api" (Fire), 1 "tumbuhan" (Plant), and 1 "air" (Water) Pal.
    3. **TRAITS**: Assign one of these traits to each candidate: "brave", "coward", "lazy", "glutton", "proud", "playful".
    4. **THEME MATCHING**: If the genre is "Horror", make them cute spooky ghosts/bats. If "SciFi", make them cute robots/aliens.
    5. **STATS**:
       - happiness: 0-100 (Higher is better)
       - energy: 0-100 (Higher is better)
       - hunger: 0-100 (Lower is better, or Higher = more hungry? Let's say 0-100 fill level, so Higher is fuller/better) -> actually let's stick to user Mock: "hunger: 50". Let's assume 0-100 scale.
    4. **ITEMS**: Give each pal 2 starting items fitting their theme.
    5. **NAMES**: Provide 5 creative, cute, or thematic potential names for EACH candidate in "suggested_names".
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
    } catch (error) {
        safeLog("Setup Generation Error:", error, [apiKey]);
        saveDebugLog("ERROR_SETUP", { error: error.message }, prompt);
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
You are a professional translator for a Role - Playing Game(RPG) UI.
Translate the following JSON object values into this language: "${targetLanguage}".
Do NOT translate keys.Keep the structure exactly the same.
Maintain a professional, immersive gaming tone.

IMPORTANT RULES:
    1. Use FORMAL, STANDARD language only.
2. STRICTLY FORBID slang, informal, or "gaul" language.
3. If the requested language is a slang variant(e.g., "Bahasa Gaul", "Slang"), translate it to the STANDARD FORMAL version of that language(e.g., standard Indonesian).

Source JSON:
${JSON.stringify(uiSubset, null, 2)}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            saveDebugLog("UI_TRANSLATE", parsed, prompt);
            return parsed;
        }
        return uiSubset;
    } catch (error) {
        safeLog("Translation Error:", error, [apiKey]);
        return uiSubset;
    }
};

/**
 * Generates a chat response from the Pal.
 * @param {string} apiKey 
 * @param {object} palData - includes name, role (species/desc), stats, etc.
 * @param {string} userMessage 
 * @param {Array} history - Array of { role: 'user'|'model', text: '...' }
 * @param {string} genre - "scifi", "fantasy", etc.
 */
export const generatePalChat = async (apiKey, palData, userMessage, history, genre) => {
    if (!apiKey) throw new Error("API Key Missing");

    try {
        // SECURITY: Validate and sanitize input (Limit 1000 chars)
        const cleanUserMessage = validateInput(userMessage, 1000);

        const recentHistory = history.slice(-5).map(h => `${h.role === 'user' ? 'Human' : palData.name}: ${h.text} `).join('\n');

        const prompt = `
## ROLE
You are ${palData.name}, a virtual pet / companion in a ${genre} world.
Description: "${palData.role?.desc || 'A cute magical creature'}".
Stats: Happiness ${palData.role?.stats?.happiness}%, Energy ${palData.role?.stats?.energy}%, Hunger ${palData.role?.stats?.hunger}%.

## CONTEXT
Chatting with owner.Keep it SHORT, CUTE, EXPRESSIVE.Max 2 sentences.Use emojis suitable for your character.

## HISTORY
${recentHistory}
Human: ${cleanUserMessage}

## OUTPUT FORMAT(JSON)
{ "text": "Response text", "emoji": "Statement emoji" }
`;

        console.log("Generating Chat with prompt:", prompt);
        saveDebugLog("CHAT_REQUEST", { prompt }, prompt);

        const { result, model } = await generateWithFallback(apiKey, prompt);
        const response = await result.response;
        const text = response.text();

        let parsed;
        try {
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            parsed = JSON.parse(cleanText);
        } catch (e) {
            parsed = { text: text, emoji: "❓" }; // Fallback if raw text
        }

        saveDebugLog("PAL_CHAT", parsed, prompt, model);
        return parsed;

    } catch (error) {
        safeLog("Chat Error:", error, [apiKey]);
        return { text: "*Confused noises*", emoji: "💫" };
    }
};

/**
 * Generates the "Master Plan" (Campaign Start)
 */
export const generateCampaignStart = async (apiKey, genre, palData, language) => {
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
        "title": "Epic Title of the Saga",
        "main_quest": "The ultimate goal (e.g. Defeat the Void King)",
        "antagonist": "Name of the main villain",
        "tone": "Brief tone description",
        "chapter": 1,
        "history": []
    }
    `;
        console.log("Generating Campaign Start...");
        const { result, model } = await generateWithFallback(apiKey, prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Failed to parse Campaign JSON");
    } catch (error) {
        safeLog("Campaign Gen Error:", error, [apiKey]);
        return {
            title: "The Unknown Journey",
            main_quest: "Explore the world and find your destiny.",
            chapter: 1,
            history: []
        };
    }
};

/**
 * Generates a mini-adventure (3-4 linked scenes) in one go.
 */
export const generateAdventure = async (apiKey, palData, genre, language = 'English', campaignState = null) => {
    if (!apiKey) throw new Error("API Key Missing");

    try {
        // [NEW] Deep Stat Injection
        // Handle both 'role.stats' (Adventure) and 'stats' (Adoption) structures
        const stats = palData.role?.stats || palData.stats || {};
        const level = stats.level || 1;
        const currentHp = stats.energy || 50; // Using Energy as HP for visual simplicity in prompt
        const maxHp = stats.maxHp || 100;

        // [NEW] Level-Gated Pacing Logic
        let storyPhase = "INTRO"; // Level 1-4
        let pacingInstruction = "Do NOT finish the main quest. Focus on world building and minor threats.";

        if (level === 5) {
            storyPhase = "BOSS_1";
            pacingInstruction = "TRIGGER A BOSS FIGHT. The player must face a trusted lieutenant of the Antagonist.";
        } else if (level > 5 && level < 10) {
            storyPhase = "MID_GAME";
            pacingInstruction = "Raise the stakes. Reveal clues about the true enemy. Enemies are tougher.";
        } else if (level === 10) {
            storyPhase = "BOSS_2";
            pacingInstruction = "TRIGGER MAJOR BOSS FIGHT. A significant plot twist occurs.";
        } else if (level >= 20) {
            storyPhase = "CLIMAX";
            pacingInstruction = "THE FINAL BATTLE. Allow the player to confront the Main Antagonist.";
        }

        // Context Construction
        let contextBlock = "";
        if (campaignState && campaignState.isActive) {
            contextBlock = `
    ## CAMPAIGN CONTEXT (CONTINUOUS STORY)
    - Title: "${campaignState.title}"
    - Main Goal: "${campaignState.mainGoal}"
    - Antagonist: "${campaignState.antagonist || 'Unknown'}"
    - Current Chapter: ${campaignState.currentChapter}
    - Story Phase: ${storyPhase} (Level ${level})
    - History So Far: ${campaignState.historySummary.slice(-3).join('. ')}
    
    ## PACING RULE
    ${pacingInstruction}
            `;
        }

        let powerTier = "Variable";
        if (level < 10) powerTier = "Beginner (Weak)";
        else if (level < 30) powerTier = "Intermediate (Capable)";
        else powerTier = "Master (A Force of Nature)";

        const prompt = `
    ## ROLE
    Gamemaster for a "Cute ${genre}" RPG.
    Player Character: ${palData.name} (${palData.role?.desc || 'Hero'}).
    
    ## PLAYER STATS
    - Level: ${level} (${powerTier})
    - Health: ${currentHp}/${maxHp}
    
    ${contextBlock}
    
    ## LANGUAGE
    ${language} (Output MUST be in this language)

## TASK
Generate a **linear mini-adventure** with 3 to 5 scenes.
Format: JSON.

## STORY ARC
1. **Introduction**: Arrival / Setting the scene.
2. **Middle Scenes**: Exploration, Encounter, or Challenge (Tag as "conflict" if it involves an entity).
3. **Conclusion**: Reward and ending.

## JSON STRUCTURE
{
  "sector": "Creative Location Name",
  "theme_color": "Tailwind gradient classes",
  "enemy": {
      "name": "Potential Enemy Name",
      "emoji": "👹", 
      "element": "api", // api / air / tumbuhan
      "intro": "A wild Enemy appears!"
  },
  "scenes": [
    {
      "type": "normal",
      "text": "Story text...",
      "visual": "🏰",
      "choices": [
        { "label": "Action 1", "effect": { "hp": -5, "loot": 10 } }
      ]
    },
    {
      "type": "conflict",
      "text": "You see a creature blocking the path...",
      "visual": "👀",
      "choices": [
        { "label": "Sneak Around", "effect": { "hp": 0, "loot": 0 } },
        { "label": "Talk to it", "effect": { "hp": 0, "loot": 5 } }
      ]
    },
    {
      "type": "ending",
      "text": "Final scene...",
      "visual": "🎉",
      "choices": [
        { "label": "Return Home", "isReturn": true, "effect": { "loot": 50 } }
      ]
    }
  ]
}

    ## RULES
    - Keep it CUTE and FUN.
    - **SCALING**: Create an enemy appropriate for Level ${level}. 
      - If Level 1-5: Cute, weak enemies (Slimes, baby bugs).
      - If Level 50+: Legendary, epic enemies (Dragons, Mecha-Kaiju), but still "cute" style.
    - Use <b>Result</b> or <i>Action</i> tags for emphasis in story text.
- "enemy" object is REQUIRED (The game engine decides if it attacks).
- "enemy.emoji" MUST be a SINGLE EMOJI.
- "enemy.element" MUST be one of: "api", "air", "tumbuhan".
- Do NOT generate \"isCombat\": true choices. The system handles that.
- Last scene MUST have \"isReturn\": true.
`;

        console.log("Generating Adventure with prompt:", prompt);
        saveDebugLog("ADVENTURE_REQUEST", { prompt }, prompt);

        const { result, model } = await generateWithFallback(apiKey, prompt);
        const response = await result.response;
        const text = response.text();

        let parsed;
        try {
            // Robust JSON extraction
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const cleanText = jsonMatch ? jsonMatch[0] : text;
            parsed = JSON.parse(cleanText);
        } catch (e) {
            safeLog("JSON Parse Error", text, [apiKey]);
            return mockAdventureFallback(`JSON Error: ${e.message.slice(0, 20)}`);
        }

        saveDebugLog("ADVENTURE_GEN", parsed, prompt, model);
        return parsed || mockAdventureFallback("Empty Response");

    } catch (error) {
        safeLog("Adventure Gen Error:", error, [apiKey]);
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

/**
 * Analyzes an image to find pivot points for auto-rigging.
 * @param {string} apiKey 
 * @param {string} base64Image - Base64 string of the image (without data:image prefix if possible, or handle it)
 * @param {string} promptText - Optional custom prompt
 */
export const analyzeImagePoints = async (apiKey, base64Image, promptText = null) => {
    if (!apiKey) throw new Error("API Key Missing");

    const defaultPrompt = `
    Analyze this 2D character sprite sheet. 
    It has a GRID overlay. Identify the specific PIVOT POINTS (Joints) for animation.
    
    Return a JSON object with "parts" containing [x, y] coordinates (0-1000 scale relative to image size).
    
    REQUIRED PARTS:
    - head (Bottom Center / Neck)
    - torso (Center)
    - arm_L_upper (Top Center / Shoulder)
    - arm_R_upper (Top Center / Shoulder)
    - leg_L (Top Center / Hip)
    - leg_R (Top Center / Hip)
    
    MOUNTING POINTS (On Torso body):
    - torso_neck (Where head attaches)
    - torso_shoulder_L (Where Left Arm attaches)
    - torso_shoulder_R (Where Right Arm attaches)
    - torso_hip_L (Where Left Leg attaches)
    - torso_hip_R (Where Right Leg attaches)
    
    OUTPUT JSON ONLY:
    { "parts": { "head": [x, y], "torso_neck": [x, y], ... } }
    `;

    try {
        // Clean base64 if it has header
        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

        const imagePart = {
            inlineData: {
                data: cleanBase64,
                mimeType: "image/png"
            }
        };

        const finalPrompt = [promptText || defaultPrompt, imagePart];

        console.log("Requesting Vision Analysis...");
        saveDebugLog("VISION_REQUEST", { prompt: "Image Analysis" }, "Vision");

        const { result, model } = await generateWithFallback(apiKey, finalPrompt);
        const response = await result.response;
        const text = response.text();

        // Safe Parse
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            saveDebugLog("VISION_SUCCESS", parsed, "Vision Analysis", model);
            return parsed;
        }
        throw new Error("Failed to parse Vision JSON");

    } catch (error) {
        safeLog("Vision API Error:", error, [apiKey]);
        saveDebugLog("VISION_ERROR", { error: error.message });
        throw error;
    }
};
