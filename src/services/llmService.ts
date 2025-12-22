import { GoogleGenerativeAI, GenerativeModel, EnhancedGenerateContentResponse } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "../constants/systemPrompt";
import { TRANSLATIONS } from "../constants/textUI";
import {
    SetupResponse, ChatResponse, AdventureResponse, VisionResponse
} from '../types/api';
import { Pal, Campaign, Stats } from '../types/game';

const getUiText = (lang: string) => {
    // @ts-ignore - Index signature
    const langKey = Object.keys(TRANSLATIONS).find(k => k.toLowerCase() === (lang || 'English').toLowerCase()) || 'English';
    // @ts-ignore
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
let modelListPromise: Promise<void> | null = null;

const fetchAvailableModels = async (apiKey: string) => {
    try {
        console.log("Fetching available Gemini models...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) throw new Error("Failed to fetch models");

        const data = await response.json();
        const models = data.models || [];

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

interface GenResult {
    result: { response: Promise<EnhancedGenerateContentResponse> };
    model: string;
}

const generateWithFallback = async (apiKey: string, prompt: string | (string | any)[], systemInstruction: string | null = null): Promise<GenResult> => {
    if (!modelListPromise) {
        modelListPromise = fetchAvailableModels(apiKey);
    }
    await modelListPromise;

    const genAI = new GoogleGenerativeAI(apiKey);

    const tryModel = async (modelName: string): Promise<GenResult> => {
        const config: any = {
            model: modelName,
            // @ts-ignore
            safetySettings: SAFETY_SETTINGS,
            generationConfig: { responseMimeType: "application/json" },
        };

        const model = genAI.getGenerativeModel(config);
        console.log(`Attempting generation with ${modelName}...`);

        const result = await model.generateContent(prompt);
        return { result: { response: Promise.resolve(result.response) }, model: modelName };
    };

    try {
        return await tryModel(PRIMARY_MODEL);
    } catch (error: any) {
        console.warn(`${PRIMARY_MODEL} failed:`, error.message);

        if (error.message.includes("503") || error.message.includes("404") || error.message.includes("not found")) {
            for (const fallbackModel of FALLBACK_MODELS) {
                try {
                    console.log(`Retrying with fallback ${fallbackModel}...`);
                    saveDebugLog("API_FALLBACK_ATTEMPT", { to: fallbackModel, reason: error.message }, typeof prompt === 'string' ? prompt : "Image Prompt", PRIMARY_MODEL);
                    const response = await tryModel(fallbackModel);
                    saveDebugLog("API_FALLBACK_SUCCESS", { model: fallbackModel }, typeof prompt === 'string' ? prompt : "Image Prompt", fallbackModel);
                    return response;
                } catch (fallbackError: any) {
                    console.warn(`${fallbackModel} failed:`, fallbackError.message);
                }
            }
        }
        throw error;
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

export const getUiBatches = (fullText: any) => {
    const critical: any = {};
    const secondary: any = {};

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
export const generateGameSetup = async (apiKey: string, genre: string, language: string): Promise<SetupResponse> => {
    if (!apiKey) {
        throw new Error("API Key missing. Please configure in Settings.");
    }

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
    } catch (error: any) {
        console.error("Setup Generation Error:", error);
        saveDebugLog("ERROR_SETUP", { error: error.message }, prompt);
        throw error;
    }
};

export const translateUiSubset = async (apiKey: string, targetLanguage: string, uiSubset: any): Promise<any> => {
    if (!apiKey) throw new Error("API Key Missing");

    try {
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

        const { result } = await generateWithFallback(apiKey, prompt);
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
        console.error("Translation Error:", error);
        return uiSubset;
    }
};

/**
 * Generates a chat response from the Pal.
 */
export const generatePalChat = async (apiKey: string, palData: Pal, userMessage: string, history: any[], genre: string): Promise<ChatResponse> => {
    if (!apiKey) throw new Error("API Key Missing");

    try {
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
Human: ${userMessage}

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
        console.error("Chat Error:", error);
        return { text: "*Confused noises*", emoji: "💫" };
    }
};


export const generateCampaignStart = async (apiKey: string, genre: string, palInfo: { name: string, role: any }, language: string): Promise<Campaign> => {
    if (!apiKey) throw new Error("API Key Missing");

    const prompt = `
    ## ROLE
    Game Master for a ${genre} RPG.
    Player: "${palInfo.name}" (${palInfo.role.name || 'Hero'}).
    Description: ${palInfo.role.desc || 'A brave adventurer'}.
    
    ## TASK
    Initialize a new Campaign for this character.
    Language: ${language}
    
    ## OUTPUT JSON
    {
        "title": "Epic Title of the Campaign",
        "mainGoal": "The ultimate objective (e.g., Defeat the Demon King, Find the Lost City)",
        "antagonist": "Name/Title of the main villain or force",
        "historySummary": ["Chapter 1: The Journey Begins. ${palInfo.name} enters the world..."],
        "currentChapter": 1,
        "isActive": true
    }
    `;

    try {
        console.log("Generating Campaign Start...");
        saveDebugLog("CAMPAIGN_START_REQ", { prompt }, prompt);

        const { result, model } = await generateWithFallback(apiKey, prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanText = jsonMatch ? jsonMatch[0] : text;
        const parsed = JSON.parse(cleanText);
        parsed.isActive = true;

        saveDebugLog("CAMPAIGN_START", parsed, prompt, model);
        return parsed;

    } catch (error) {
        console.error("Campaign Gen Error:", error);
        // Fallback
        return {
            isActive: true,
            title: `The Legend of ${palInfo.name}`,
            mainGoal: "Explore the world and find your destiny.",
            antagonist: "Unknown Darkness",
            historySummary: ["The adventure begins..."],
            currentChapter: 1
        };
    }
};


const mockAdventureFallback = (debugInfo = ""): AdventureResponse => ({
    sector: "Lost Connection Void",
    theme_color: "from-gray-800 to-black",
    enemy: {
        name: "Glitch",
        emoji: "👾",
        element: "api",
        intro: "Connection lost."
    },
    scenes: [
        {
            text: `The connection to the Adventureverse is weak... (${debugInfo})`,
            visual: "📡",
            choices: [{ label: "Try Again", isReturn: true }]
        }
    ]
});



export const generateAdventure = async (apiKey: string, palData: Pal, genre: string, language: string = 'English', campaignState: Campaign | null = null, intent: string = 'scavenge'): Promise<AdventureResponse> => {
    if (!apiKey) throw new Error("API Key Missing");

    try {
        const stats = palData.role?.stats || palData.stats || {};
        const level = stats.level || 1;
        const currentHp = stats.energy || 50;
        const maxHp = stats.maxHp || 100;

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

        // --- INTENT LOGIC ---
        let intentBlock = "";
        if (intent === 'patrol') {
            intentBlock = "MISSION TYPE: **PATROL**. The player is actively hunting for threats. \n- **Encounter Rate**: HIGH. \n- **Focus**: Combat opportunities and defending the area.";
        } else if (intent === 'scavenge') {
            intentBlock = "MISSION TYPE: **SCAVENGE**. The player is looking for resources/loot. \n- **Encounter Rate**: LOW (Avoidable dangerous combat). \n- **Focus**: High Loot rewards, puzzles, or helping locals.";
        } else if (intent === 'story') {
            intentBlock = "MISSION TYPE: **STORY MISSION**. The player wants to advance the plot. \n- **Focus**: Plot revelations, key items, or significant conversations.";
        }

        let powerTier = "Variable";
        if (level < 10) powerTier = "Beginner (Weak)";
        else if (level < 30) powerTier = "Intermediate (Capable)";
        else powerTier = "Master (A Force of Nature)";

        const prompt = `
    ## ROLE
    Gamemaster for a "Cute ${genre}" RPG.
    Player Character: ${palData.name} (${palData.role?.desc || 'Hero'}).
    Personality Trait: ${palData.trait || (palData as any).role?.trait || 'None'}
    
    ${intentBlock}

    ## PLAYER STATS
    - Level: ${level} (${powerTier})
    - Health: ${currentHp}/${maxHp}
    
    ${contextBlock}
    
    ## LANGUAGE
    ${language} (Output MUST be in this language)

## TASK
Generate a **linear mini-adventure** with 5 to 7 scenes.
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
        { "label": "Action 1", "effect": { "hp": -5, "loot": 10 } },
        { "label": "Action 2", "effect": { "happiness": 10 } }
      ]
    },
    {
      "type": "ending",
      "text": "The adventure ends heroically.",
      "visual": "🎉",
      "choices": [
        { "label": "Return Home", "isReturn": true, "effect": { "loot": 20 } },
        { "label": "Rest a bit", "isReturn": true, "effect": { "hp": 20 } }
      ]
    }
  ]
}

    ## NARRATIVE RULES
    - **CHOICE DENSITY**: Provide 1 to 3 distinct choices for every scene, depending on the narrative context. Some situations might only allow one path, while others offer more.
    - **CONCISENESS**: MAX 180 characters per scene. Use more scenes instead of long paragraphs.
    - **WORLD THEME**: Use vocabulary strictly fitting the "${genre}" genre. 
      - If SciFi: Use terms like 'hologram', 'neon', 'circuits', 'orbit'.
      - If Fantasy: Use terms like 'enchanted', 'scrolls', 'tapestry', 'realm'.
    - **SHOW, DON'T TELL**: Use sensory details. Instead of "It is scary", use "The shadows stretch like long fingers...".
    - **PERSONALITY FOCUS**: Choices should reflect the Pal's trait ("${palData.trait || 'None'}"). 
      - A "Lazy" pal might have a choice to "Nap under the tree" (+5 Energy).
      - A "Brave" pal might have a choice to "Charge blindly" (-10 HP, +20 Loot).
    - **SCALING**: Create an enemy appropriate for the player's level. 
    - Use <b>Result</b> or <i>Action</i> tags for emphasis in story text.
    - **CAMPAIGN UPDATE**: If the 'pacingInstruction' above requires a major plot step (e.g., Boss Defeated, Climax), you MUST include:
      "campaignUpdate": { "advanceChapter": true, "historyEntry": "Summary of what happened." }
      Otherwise, omit it.

- "enemy" object is REQUIRED.
- Last scene MUST have a choice with \"isReturn\": true.
`;

        console.log("Generating Adventure with prompt:", prompt);
        saveDebugLog("ADVENTURE_REQUEST", { prompt }, prompt);

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



export const generateEvolution = async (apiKey: string, palData: Pal, language: string): Promise<{ name: string, emoji: string, desc: string }> => {
    if (!apiKey) throw new Error("API Key Missing");

    const prompt = `
    ## ROLE
    Creature Evolution Expert for a Fantasy RPG.
    Subject: "${palData.name}" (Level 10+).
    Original Form: ${palData.role?.desc || palData.desc}.
    Element: ${palData.element}.
    Trait: ${palData.trait}.
    Language: ${language}.

    ## TASK
    The subject is evolving into a stronger, more mature form.
    Generate a new persistent identity for this creature.

    ## RULES
    1. **Name**: Must be related to "${palData.name}" but sound more legendary/adult (e.g., "Ember" -> "Inferno").
    2. **Emoji**: Choose a DIFFERENT, more substantial emoji (e.g., 🐣 -> 🦅, 🐟 -> 🐋).
    3. **Description**: Describe its new power and appearance in 1-2 sentences.

    ## OUTPUT JSON
    {
        "name": "New Name",
        "emoji": "🐍",
        "desc": "New Description..."
    }
    `;

    try {
        console.log("Generating Evolution...");
        saveDebugLog("EVO_REQUEST", { prompt }, prompt);

        const { result, model } = await generateWithFallback(apiKey, prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            saveDebugLog("EVO_SUCCESS", parsed, prompt, model);
            return parsed;
        }
        throw new Error("Invalid JSON");
    } catch (e: any) {
        console.error("Evolution Gen Error:", e);
        return {
            name: `Mega ${palData.name}`,
            emoji: palData.emoji || "🐲",
            desc: "It has grown stronger!"
        };
    }
};

export const analyzeImagePoints = async (apiKey: string, base64Image: string, promptText: string | null = null): Promise<VisionResponse> => {
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
