import { useState } from 'react';
import { UI_TEXT } from '../constants/strings';

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

    const [isProcessing, setIsProcessing] = useState(false);

    return {
        stats, setStats,
        inventory, setInventory,
        quest, setQuest,
        genre, setGenre,
        lastOutcome, setLastOutcome,
        gameOver, setGameOver,
        summary, setSummary,
        history, setHistory,
        isProcessing, setIsProcessing,
        STORAGE_KEY // Exporting key for persistence hook
    };
}
