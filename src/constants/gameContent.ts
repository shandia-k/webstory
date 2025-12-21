export const GAME_CONTENT = {
    WORLDS: {
        scifi: {
            title: "Cyberpunk City",
            desc: "Neon lights, high-tech gadgets, and corporate dystopia.",
            mascot: "🤖"
        },
        fantasy: {
            title: "Magic Kingdom",
            desc: "Dragons, wizards, and epic quests await you.",
            mascot: "🐉"
        },
        horror: {
            title: "Haunted Mansion",
            desc: "Spooky ghosts and creaky floorboards. Watch your back!",
            mascot: "👻"
        },
        romance: {
            title: "Love Academy",
            desc: "Find your soulmate in this high school drama.",
            mascot: "💌"
        },
        slice_of_life: {
            title: "Cozy Town",
            desc: "Relax, farm, and make friends in a peaceful village.",
            mascot: "☕"
        },
        isekai: {
            title: "Another World",
            desc: "Summoned to a strange land with cheat powers!",
            mascot: "🌀"
        },
        mythology: {
            title: "Olympus Heights",
            desc: "Walk among gods and legends of old.",
            mascot: "⚡"
        },
        wild_west: {
            title: "Dusty Frontier",
            desc: "Cowboys, outlaws, and high noon duels.",
            mascot: "🤠"
        },
        dark: {
            title: "Shadow Realm",
            desc: "A grim world where survival is the only goal.",
            mascot: "💀"
        },
        comedy: {
            title: "Toon World",
            desc: "Everything is a joke, and physics doesn't apply.",
            mascot: "🤡"
        },
        world_war: {
            title: "Battlefield 194X",
            desc: "Historical warfare with tanks and trenches.",
            mascot: "🎖️"
        },
        surreal: {
            title: "Dreamscape",
            desc: "Logic is optional in this abstract dimension.",
            mascot: "🫠"
        }
    },
    FEEDBACK: {
        FEED: { EMOJI: "😋", MSG: "Yummy!" },
        PLAY: { EMOJI: "🎉", MSG: "So fun!" },
        SLEEP: { EMOJI: "💤", MSG: "Zzz..." },
        PET: { EMOJI: "💖", MSG: "Loves it!" }
    },
    COMBAT: {
        DEFAULT_ENEMY: {
            NAME: "Glitch Imp",
            EMOJI: "👾",
            INTRO: "A digital glitch blocks your path!",
            ELEMENT: "api" // Default element
        },
        LOGS: {
            PLAYER_ATTACK: (dmg) => `You deal ${dmg} damage!`,
            PLAYER_HEAL: (amount) => `You heal for ${amount} HP.`,
            ENEMY_ATTACK: (dmg) => `Enemy deals ${dmg} damage!`
        }
    },
    CHAT_DEFAULTS: {
        MODEL_INTRO: (name) => `Hello! I am ${name}. Let's have fun!`,
        INITIAL_MSG: "I'm so happy to meet you!",
        PAL_INTRO: (name) => `${name} looks at you with sparkling eyes.`
    },
    FALLBACKS: {
        ADOPTION: [
            {
                id: "fallback_1",
                name: "Ignis",
                emoji: "🔥",
                element: "api",
                trait: "brave",
                desc: "A small flame spirit.",
                stats: { happiness: 80, energy: 100, hunger: 50 },
                items: [{ name: "Coal", icon: "🌑", desc: "Warm snacc" }],
                suggested_names: ["Sparky", "Ash", "Blaze"]
            },
            {
                id: "fallback_2",
                name: "Sprout",
                emoji: "🌿",
                element: "tumbuhan",
                trait: "playful",
                desc: "A lively little plant.",
                stats: { happiness: 90, energy: 80, hunger: 20 },
                items: [{ name: "Water Can", icon: "💧", desc: "Drink me" }],
                suggested_names: ["Leafy", "Bud", "Flora"]
            },
            {
                id: "fallback_3",
                name: "Aqua",
                emoji: "💧",
                element: "air",
                trait: "lazy",
                desc: "A floating water droplet.",
                stats: { happiness: 70, energy: 90, hunger: 40 },
                items: [{ name: "Ice Cube", icon: "🧊", desc: "Stay cool" }],
                suggested_names: ["Dew", "River", "Splash"]
            }
        ]
    }
};
