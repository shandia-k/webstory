import { useState, useMemo, useEffect, useCallback } from 'react';
import { TRANSLATIONS, TEXT_UI as UI_TEXT } from '../constants/textUI';
import { GAME_CONFIG } from '../config/constants';
import { saveGameToFile, parseSaveFile } from '../utils/fileHandler';

const STORAGE_KEY = GAME_CONFIG.STORAGE_KEYS.AUTOSAVE;

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
    // --- CORE GAME STATE (Refactored from OmniHub) ---
    const [phase, setPhase] = useState(() => loadState('phase', 'hub')); // 'hub', 'adoption', 'game', 'adventure', 'rigging'
    const [selectedWorld, setSelectedWorld] = useState(() => loadState('selectedWorld', 'scifi'));
    const [adoptedPal, setAdoptedPal] = useState(() => loadState('adoptedPal', null));
    const [wallet, setWallet] = useState(() => loadState('wallet', GAME_CONFIG.INITIAL_WALLET));

    // --- LEGACY / SPECIFIC STATE ---
    const [stats, setStats] = useState(() => loadState('stats', GAME_CONFIG.INITIAL_STATS));
    const [inventory, setInventory] = useState(() => loadState('inventory', [])); // Enhanced wallet/inventory separation later

    const [quest, setQuest] = useState(() => loadState('quest', UI_TEXT.CONTENT.QUEST_DEFAULT));
    const [history, setHistory] = useState(() => loadState('history', []));

    const [campaign, setCampaign] = useState(() => loadState('campaign', GAME_CONFIG.INITIAL_CAMPAIGN));

    // API & SETTINGS
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('nexus_api_key') || '');
    const [language, setLanguage] = useState(() => localStorage.getItem('nexus_language') || 'English');

    // UI & NOTIFICATIONS
    const [notification, setNotification] = useState(null);

    // --- ACTIONS ---
    const showNotification = useCallback((msg, type = 'success') => {
        setNotification({ message: msg, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    // AUTO-SAVE SYSTEM (Debounced 2s)
    useEffect(() => {
        if (!adoptedPal) return;

        const saveTimeout = setTimeout(() => {
            console.log("Auto-Saving Game State...");
            const stateToSave = {
                version: GAME_CONFIG.VERSION,
                timestamp: new Date().toISOString(),
                phase,
                selectedWorld,
                adoptedPal,
                wallet,
                stats,
                inventory,
                quest,
                history,
                campaign
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        }, 2000); // Wait for 2 seconds of inactivity before writing to disk

        return () => clearTimeout(saveTimeout);
    }, [phase, selectedWorld, adoptedPal, wallet, stats, inventory, quest, history, campaign]);

    // EXPORT / IMPORT
    const saveGame = useCallback(async () => {
        try {
            const data = {
                version: GAME_CONFIG.VERSION,
                timestamp: new Date().toISOString(),
                phase, selectedWorld, adoptedPal, wallet, stats, inventory, quest, history, campaign
            };
            await saveGameToFile(data, `omnihub_save_${new Date().getTime()}.json`);
            showNotification('Game Saved Successfully!');
        } catch (e) {
            console.error("Save Failed", e);
            showNotification('Save Failed', 'error');
        }
    }, [phase, selectedWorld, adoptedPal, wallet, stats, inventory, quest, history, campaign, showNotification]);

    const loadGame = useCallback(async (file) => {
        try {
            const data = await parseSaveFile(file);
            if (data.version && data.version.startsWith('OmniHub')) {
                setPhase(data.phase || 'game');
                setSelectedWorld(data.selectedWorld || 'scifi');
                setAdoptedPal(data.adoptedPal);
                setWallet(data.wallet || GAME_CONFIG.INITIAL_WALLET);
                if (data.inventory) setInventory(data.inventory);
                if (data.stats) setStats(data.stats);
                if (data.history) setHistory(data.history);
                if (data.campaign) setCampaign(data.campaign);

                showNotification(`Loaded save for ${data.adoptedPal?.name || 'Unknown'}`);
            } else {
                showNotification('Invalid Save File', 'error');
            }
        } catch (e) {
            console.error("Load Failed", e);
            showNotification('Load Failed', 'error');
        }
    }, [showNotification]);

    // DYNAMIC TRANSLATIONS
    const [customTranslations, setCustomTranslations] = useState({});

    const updateUiText = useCallback((lang, data) => {
        setCustomTranslations(prev => ({
            ...prev,
            [lang]: data
        }));
    }, []);

    // UI TEXT LOGIC (Simplified)
    const uiText = useMemo(() => {
        const langLower = language.toLowerCase();

        // 1. Check Custom Translations
        const customLangKey = Object.keys(customTranslations).find(k => k.toLowerCase() === langLower);
        if (customLangKey) {
            return {
                ...UI_TEXT,
                ...customTranslations[customLangKey],
                UI: customTranslations[customLangKey]
            };
        }

        // 2. Check Static Translations
        const langKey = Object.keys(TRANSLATIONS).find(k => k.toLowerCase() === langLower) || 'English';
        return {
            ...UI_TEXT,
            ...TRANSLATIONS[langKey],
            UI: TRANSLATIONS[langKey]
        };
    }, [language, customTranslations]);

    const contextValue = useMemo(() => ({
        // State
        phase, setPhase,
        selectedWorld, setSelectedWorld,
        adoptedPal, setAdoptedPal,
        wallet, setWallet,
        stats, setStats,
        inventory, setInventory,
        quest, setQuest,
        history, setHistory,
        campaign, setCampaign,
        apiKey, setApiKey,
        language, setLanguage,
        notification, showNotification,
        updateUiText,
        // Actions
        saveGame,
        loadGame,
        // Computed
        uiText
    }), [
        phase, selectedWorld, adoptedPal, wallet, stats, inventory, quest, history, campaign,
        apiKey, language, notification, showNotification, updateUiText, saveGame, loadGame, uiText
    ]);

    return contextValue;
}
