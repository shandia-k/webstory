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
    INITIAL_CAMPAIGN: {
        isActive: false,
        title: null,
        mainGoal: null,
        currentChapter: 0,
        historySummary: [], // ["Met a merchant", "Defeated the Rat King"]
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
        CYCLE: {
            api: 'tumbuhan',      // Fire beats Plant
            tumbuhan: 'air',      // Plant beats Water
            air: 'api'            // Water beats Fire
        },
        MULTIPLIERS: {
            STRONG: 1.2, // Nerfed from 1.5 to reduce one-shot mechanics
            WEAK: 0.8,   // Buffed from 0.75 to be less punishing
            NEUTRAL: 1.0
        }
    },
    EXP_CURVES: {
        BASE: 100,
        MULTIPLIER: 1.5 // lvl 2 needs 150, lvl 3 needs 225...
    },
    VERSION: 'OmniHub-v1.1-CombatReady'
};
