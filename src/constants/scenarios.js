export const SCENARIOS = {
    horror: {
        narrative: "You wake up on the cold floor of an old hospital. The smell of antiseptic mixes with a faint stench of decay. The flashlight in your hand flickers weakly, the only source of light in this oppressive darkness.",
        outcome: "NEUTRAL",
        stats_set: { health: 60, stamina: 40, sanity: 100 },
        inventory_set: [
            { name: "Rusty Flashlight", count: 1, tags: ["tool", "light"], type: "tool", icon: "🔦", value: 100, max_value: 100 },
            { name: "Dirty Bandage", count: 2, tags: ["consumable", "heal"], type: "consumable", icon: "🩹" },
            { name: "Old Key", count: 1, tags: ["key", "rusty"], type: "key", icon: "🗝️" }
        ],
        quest_update: "Find a way out of Ward 4",
        game_over: false,
        theme_config: { main: "#0a0505", accent: "#dc2626" }
    },
    romance: {
        narrative: "The evening breeze blows gently in the Neo-Kyoto city park. You hold the rose-scented letter with trembling hands. She promised to come today, under this hologram cherry blossom tree.",
        outcome: "NEUTRAL",
        stats_set: { mood: 80, energy: 100, charm: 50 },
        inventory_set: [
            { name: "Golden Locket", count: 1, tags: ["keepsake", "memory"], type: "keepsake", icon: "💖" },
            { name: "Perfumed Letter", count: 1, tags: ["intel", "paper"], type: "intel", icon: "💌" },
            { name: "Red Rose", count: 1, tags: ["gift", "flower"], type: "gift", icon: "🌹" }
        ],
        quest_update: "Wait for 'Her' arrival",
        game_over: false,
        theme_config: { main: "#1f1016", accent: "#db2777" }
    },
    scifi: {
        narrative: "Neon rain soaks your synthetic jacket. Police drones patrol overhead, scanning every corner of this dark alley. Your mission has just begun.",
        outcome: "NEUTRAL",
        stats_set: { health: 100, energy: 100, shield: 100 },
        inventory_set: [
            { name: "Plasma Cutter", count: 1, tags: ["tool", "heat", "weapon"], type: "tool", icon: "🔫" },
            { name: "Stimpack", count: 3, tags: ["consumable", "heal"], type: "consumable", icon: "💉" },
            { name: "Encrypted Datapad", count: 1, tags: ["intel", "encrypted"], type: "intel", icon: "💾" }
        ],
        quest_update: "Meet Contact in Sector 7",
        game_over: false,
        theme_config: { main: "#09090b", accent: "#4f46e5" }
    },
    rpg: {
        narrative: "You stand before the ancient gates of the Forgotten Citadel. The air hums with magical energy, and the distant roar of a dragon echoes through the valley. Your sword feels heavy in your hand.",
        outcome: "NEUTRAL",
        stats_set: { health: 100, mana: 100, strength: 80 },
        inventory_set: [
            { name: "Iron Sword", count: 1, tags: ["weapon", "sharp"], type: "weapon", icon: "⚔️" },
            { name: "Health Potion", count: 3, tags: ["consumable", "heal"], type: "consumable", icon: "🧪" },
            { name: "Map Scroll", count: 1, tags: ["intel", "paper"], type: "intel", icon: "📜" }
        ],
        quest_update: "Enter the Citadel",
        game_over: false,
        theme_config: { main: "#1a120b", accent: "#d97706" }
    }
};
