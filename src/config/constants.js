export const GAME_CONFIG = {
    INITIAL_STATS: {
        hp: 100,
        maxHp: 100,
        energy: 100,
        happiness: 100,
        xp: 0,
        level: 1
    },
    INITIAL_WALLET: {
        gold: 100,
        gems: 0
    },
    INITIAL_INVENTORY: [
        { name: 'Small Potion', icon: '🧪', desc: 'Restores 50 HP.' },
        { name: 'Small Potion', icon: '🧪', desc: 'Restores 50 HP.' },
        { name: 'Mega Burger', icon: '🍔', desc: 'A delicious meal.' }
    ],
    INITIAL_CAMPAIGN: {
        isActive: false,
        title: null,
        mainGoal: null,
        currentChapter: 0,
        historySummary: [],
        knowledge: {}
    },
    COMBAT: {
        BASE_DAMAGE: 20,
        CRIT_MULTIPLIER: 1.5,
        ENEMY_SPAWN_CHANCE: 0.5
    },
    ANIMATION: {
        FLOAT_DURATION: '4s',
        POP_SCALE: 1.1
    },
    STORAGE_KEYS: {
        AUTOSAVE: 'omnihub_last_session',
        SETTINGS: 'omnihub_settings'
    },
    TRAITS: {
        BRAVE: { id: 'brave', name: 'Brave', desc: 'Ignores "Wait" commands, +10% ATK', effects: { atk: 1.1, obedience: 0.8 } },
        COWARD: { id: 'coward', name: 'Coward', desc: 'High Dodge, tries to Flee', effects: { dodge: 1.2, flee_chance: 0.3 } },
        LAZY: { id: 'lazy', name: 'Lazy', desc: 'Skips turns if Energy < 50%', effects: { skip_turn_chance: 0.2 } },
        GLUTTON: { id: 'glutton', name: 'Glutton', desc: 'Eats inventory food automatically', effects: { auto_eat: true } },
        PROUD: { id: 'proud', name: 'Proud', desc: 'Refuses "Scold", High Crit', effects: { crit: 1.2, obedience_scold: 0 } },
        PLAYFUL: { id: 'playful', name: 'Playful', desc: 'High Energy regen, easily distracted', effects: { energy_regen: 1.2, distract_chance: 0.1 } }
    },
    ELEMENTS: {
        // [MODIFIED] Now using Arrays for multiple advantages
        CYCLE: {
            // FIRE > Plant, Ice, Wind (Basic RPG logic)
            api: ['tumbuhan', 'plant', 'ice', 'wind', 'ice'],
            fire: ['tumbuhan', 'plant', 'ice', 'wind', 'ice'],

            // WATER > Fire, Earth
            air: ['api', 'fire'],
            water: ['api', 'fire'],

            // PLANT > Water, Electric (Ground logic)
            tumbuhan: ['air', 'water', 'electric', 'light'],
            plant: ['air', 'water', 'electric', 'light'],

            // ELECTRIC > Water, Wind
            electric: ['air', 'water', 'wind', 'flying'],

            // ICE > Plant, Wind
            ice: ['tumbuhan', 'plant', 'wind', 'flying'],

            // WIND > Plant (Blows away)
            wind: ['tumbuhan', 'plant'],

            // DARK > Light (Eclipse)
            dark: ['light', 'holy'],

            // LIGHT > Dark (Purify)
            light: ['dark', 'shadow']
        },
        MULTIPLIERS: {
            STRONG: 1.5, // Buffed back to 1.5 for "Tactical Satisfaction"
            WEAK: 0.7,
            NEUTRAL: 1.0
        }
    },
    EXP_CURVES: {
        BASE: 100,
        MULTIPLIER: 1.5 // lvl 2 needs 150, lvl 3 needs 225...
    },
    VERSION: 'OmniHub-v1.1-CombatReady'
};
