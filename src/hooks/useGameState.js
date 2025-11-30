import { useState, useMemo } from 'react';
import { UI_TEXT } from '../constants/strings';
import { TRANSLATIONS } from '../constants/textUI';

const STORAGE_KEY = 'nexus_rpg_save_v2';

// Helper to load initial state (lazy initialization)
const loadState = (key, fallback) => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed[key] !== undefined ? parsed[key] : fallback;
        }
    } catch (e) {
        console.error("Failed to load state", e);
    }
    return fallback;
};

export function useGameState() {
    const [stats, setStats] = useState(() => loadState('stats', { health: 100, energy: 100, shield: 100 }));
    const [inventory, setInventory] = useState(() => loadState('inventory', [
        { name: "Plasma Cutter", count: 1, tags: ["tool", "heat", "weapon"], type: "tool", icon: "🔫" },
        { name: "Stimpack", count: 3, tags: ["consumable", "heal"], type: "consumable", icon: "💉" },
        { name: "Encrypted Datapad", count: 1, tags: ["intel", "encrypted"], type: "intel", icon: "💾" }
    ]));

    const [quest, setQuest] = useState(() => loadState('quest', UI_TEXT.CONTENT.QUEST_DEFAULT));
    const [genre, setGenre] = useState(() => loadState('genre', UI_TEXT.FIXED.GENRE_DEFAULT));
    const [environment, setEnvironment] = useState(() => loadState('environment', null)); // Dynamic Background
    const [lastOutcome, setLastOutcome] = useState(null);
    const [gameOver, setGameOver] = useState(() => loadState('gameOver', false));
    const [summary, setSummary] = useState(() => loadState('summary', UI_TEXT.CONTENT.SUMMARY_INIT));

    const [history, setHistory] = useState(() => loadState('history', [
        {
            id: 1,
            role: 'system',
            content: UI_TEXT.CONTENT.HISTORY_SYSTEM_INIT,
            timestamp: '00:00'
        },
        {
            id: 2,
            role: 'ai',
            content: UI_TEXT.CONTENT.HISTORY_AI_INIT,
            timestamp: '00:01'
        }
    ]));

    // Character Creation State
    const [playerName, setPlayerName] = useState(() => loadState('playerName', ''));
    const [playerRole, setPlayerRole] = useState(() => loadState('playerRole', null));
    const [setupData, setSetupData] = useState(() => loadState('setupData', null)); // Cache AI setup response
    const [initialCharacterData, setInitialCharacterData] = useState(() => loadState('initialCharacterData', null)); // For Restart Mission

    const [choices, setChoices] = useState([]); // Dynamic Action Choices

    const [isProcessing, setIsProcessing] = useState(false);
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('nexus_api_key') || '');
    const [language, setLanguage] = useState(() => localStorage.getItem('nexus_language') || 'English');
    const [isMockMode, setIsMockMode] = useState(() => localStorage.getItem('nexus_mock_mode') === 'true');

    // Advanced Interactions State
    const [qteActive, setQteActive] = useState(false);
    const [feedback, setFeedback] = useState(null); // { msg: string, color: string }
    const [allowCombo, setAllowCombo] = useState(false); // Enable Combo Mode

    // Custom UI Text from LLM Translation
    const [customUiText, setCustomUiText] = useState(() => {
        try {
            const saved = localStorage.getItem('nexus_ui_custom');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });

    const updateUiText = (lang, data, merge = false) => {
        setCustomUiText(prev => {
            let newData = data;
            if (merge && prev && prev.language === lang) {
                newData = { ...prev.data, ...data };
            }
            const newCustom = { language: lang, data: newData };
            localStorage.setItem('nexus_ui_custom', JSON.stringify(newCustom));
            return newCustom;
        });
    };

    // Helper for Deep Merge (Hardened & Type-Safe)
    const deepMerge = (target, source) => {
        const output = { ...target };
        if (source && typeof source === 'object' && !Array.isArray(source)) {
            Object.keys(source).forEach(key => {
                const sourceValue = source[key];
                const targetValue = target[key];

                const isSourceObj = sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue);
                const isTargetObj = targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue);

                if (isTargetObj) {
                    // Target is object. Only merge if source is also object.
                    if (isSourceObj) {
                        output[key] = deepMerge(targetValue, sourceValue);
                    }
                    // If source is not object (e.g. string/null), IGNORE it. Keep target structure.
                } else {
                    // Target is primitive. Overwrite if source is valid.
                    if (sourceValue !== undefined && sourceValue !== null) {
                        Object.assign(output, { [key]: sourceValue });
                    }
                }
            });
        }
        return output;
    };

    const uiText = useMemo(() => {
        try {
            // 1. Check if we have custom translation for current language
            if (customUiText && customUiText.language.toLowerCase() === language.toLowerCase()) {
                // Deep merge to ensure no keys are lost
                return {
                    ...UI_TEXT,
                    UI: deepMerge(UI_TEXT.UI, customUiText.data)
                };
            }
        } catch (err) {
            console.error("Error merging UI text, falling back to English:", err);
            // Fallback will happen below
        }

        // 2. Fallback to hardcoded translations
        const langKey = Object.keys(TRANSLATIONS).find(k => k.toLowerCase() === language.toLowerCase()) || 'English';
        return {
            ...UI_TEXT, // Keep FIXED and CONTENT
            UI: TRANSLATIONS[langKey] // Override UI
        };
    }, [language, customUiText]);

    return {
        stats, setStats,
        inventory, setInventory,
        quest, setQuest,
        genre, setGenre,
        environment, setEnvironment,
        lastOutcome, setLastOutcome,
        gameOver, setGameOver,
        summary, setSummary,
        history, setHistory,
        playerName, setPlayerName,
        playerRole, setPlayerRole,
        setupData, setSetupData,
        initialCharacterData, setInitialCharacterData,
        choices, setChoices,
        isProcessing, setIsProcessing,
        apiKey, setApiKey,
        language, setLanguage,
        isMockMode, setIsMockMode,
        qteActive, setQteActive,
        feedback, setFeedback,
        allowCombo, setAllowCombo,
        uiText,
        updateUiText,
        STORAGE_KEY
    };
}
