import { useState, useMemo, useEffect, useCallback } from 'react';
import { TRANSLATIONS, TEXT_UI as UI_TEXT } from '../constants/textUI';
import { GAME_CONFIG } from '../config/constants';
import { saveGameToFile, parseSaveFile } from '../utils/fileHandler';
import { Pal, Wallet, Stats, Item, Campaign } from '../types/game';

const STORAGE_KEY = GAME_CONFIG.STORAGE_KEYS.AUTOSAVE;

// Helper to load initial state (lazy initialization)
const loadState = <T>(key: string, fallback: T): T => {
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

interface Notification {
    message: string;
    type: 'success' | 'error';
}

export function useGameState() {
    // --- CORE GAME STATE (Refactored from OmniHub) ---
    const [phase, setPhase] = useState<string>(() => loadState<string>('phase', 'hub')); // 'hub', 'adoption', 'game', 'adventure', 'rigging'
    const [selectedWorld, setSelectedWorld] = useState<string>(() => loadState<string>('selectedWorld', 'scifi'));
    const [adoptedPal, setAdoptedPal] = useState<Pal | null>(() => loadState<Pal | null>('adoptedPal', null));
    const [wallet, setWallet] = useState<Wallet>(() => loadState<Wallet>('wallet', GAME_CONFIG.INITIAL_WALLET));

    // --- LEGACY / SPECIFIC STATE ---
    const [stats, setStats] = useState<Stats>(() => loadState<Stats>('stats', GAME_CONFIG.INITIAL_STATS));
    // @ts-ignore
    const [inventory, setInventory] = useState<Item[]>(() => loadState<Item[]>('inventory', GAME_CONFIG.INITIAL_INVENTORY || [])); // Enhanced wallet/inventory separation later

    const [quest, setQuest] = useState<string>(() => loadState<string>('quest', UI_TEXT.CONTENT.QUEST_DEFAULT));
    const [history, setHistory] = useState<any[]>(() => loadState<any[]>('history', []));

    const [campaign, setCampaign] = useState<Campaign>(() => loadState<Campaign>('campaign', GAME_CONFIG.INITIAL_CAMPAIGN));

    // API & SETTINGS
    const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('nexus_api_key') || '');
    const [language, setLanguage] = useState<string>(() => localStorage.getItem('nexus_language') || 'English');

    // UI & NOTIFICATIONS
    const [notification, setNotification] = useState<Notification | null>(null);

    // --- ACTIONS ---
    const showNotification = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
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
    const saveGame = async () => {
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
    };

    const loadGame = async (file: File) => {
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
    };

    const resetGameState = useCallback(() => {
        setPhase('hub');
        setAdoptedPal(null);
        setWallet(GAME_CONFIG.INITIAL_WALLET);
        setStats(GAME_CONFIG.INITIAL_STATS);
        setInventory(GAME_CONFIG.INITIAL_INVENTORY || []);
        setHistory([]);
        setCampaign(GAME_CONFIG.INITIAL_CAMPAIGN);
        setQuest(UI_TEXT.CONTENT.QUEST_DEFAULT);
        // Clear autosave immediately
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // DYNAMIC TRANSLATIONS
    const [customTranslations, setCustomTranslations] = useState<Record<string, any>>({});

    const updateUiText = useCallback((lang: string, data: any) => {
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
        // @ts-ignore - Index signature mismatch in constant, safe to ignore for migration
        const langKey = Object.keys(TRANSLATIONS).find(k => k.toLowerCase() === langLower) || 'English';
        return {
            ...UI_TEXT,
            // @ts-ignore
            ...TRANSLATIONS[langKey],
            // @ts-ignore
            UI: TRANSLATIONS[langKey]
        };
    }, [language, customTranslations]);

    return {
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
        resetGameState,
        // Computed
        uiText
    };
}


