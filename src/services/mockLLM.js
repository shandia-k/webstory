import { SCENARIOS } from '../constants/scenarios';

// This service simulates the High-Context LLM defined in the System Prompt.
// It returns strict JSON objects to control the game state.

export const mockLLM = async (userInput, gameState) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const input = userInput.toLowerCase();

    // --- ON-DEMAND CONTEXT AWARENESS ---
    // Only access history if specific keywords are present to save context window.


    if (input.includes('ringkasan') || input.includes('summary') || input.includes('recap')) {
        // Return stored summary from save file
        return {
            narrative: gameState.summary || "(No summary available)",
            outcome: "NEUTRAL",
            stat_updates: null,
            inventory_updates: { add: [], remove: [] },
            quest_update: null,
            game_over: false
        };
    }

    // --- SCENARIO: SYSTEM INITIALIZATION (Start States) ---
    if (userInput.startsWith('SYSTEM_INIT_GENRE:')) {
        const genre = userInput.split(':')[1].trim().toLowerCase();

        // Return scenario data if exists, otherwise default to scifi
        return SCENARIOS[genre] || SCENARIOS['scifi'];
    }

    // --- SCENARIO: ITEM DURABILITY (Liquid Stats) ---
    // Logic: If action is 'inspect'/'search' and user has Flashlight, reduce its value.
    if (input.includes('inspect') || input.includes('periksa') || input.includes('cari') || input.includes('lihat')) {
        const flashlight = gameState.inventory.find(i => i.name === "Rusty Flashlight");

        if (flashlight) {
            if (flashlight.value > 0) {
                // Consume Battery
                const newValue = Math.max(0, flashlight.value - 10);

                return {
                    narrative: `[Baterai: ${newValue}%] Cahaya senter menyapu area tersebut. Anda melihat goresan aneh di dinding.`,
                    outcome: "NEUTRAL",
                    inventory_updates: {
                        add: [], // No new items
                        remove: [],
                    },
                    inventory_set: gameState.inventory.map(i =>
                        i.name === "Rusty Flashlight" ? { ...i, value: newValue } : i
                    )
                };
            } else {
                // Battery Dead
                return {
                    narrative: "Klik. Klik. Senter Anda mati. Kegelapan total menyelimuti. Anda mendengar napas di dekat telinga Anda...",
                    outcome: "FAILURE",
                    stat_updates: { sanity: -20 }, // Penalty for darkness
                    theme_config: { main: "#000000", accent: "#333333" } // Pitch black theme
                };
            }
        }
    }

    if (input.includes('fail')) {
        return {
            narrative: "Tindakan gagal total. Sistem menolak akses Anda.",
            outcome: "FAILURE",
            stat_updates: { health: -10 },
            inventory_updates: { add: [], remove: [] },
            quest_update: null,
            game_over: false
        };
    }

    if (input.includes('hack') || input.includes('retas') || input.includes('jebol')) {
        return {
            narrative: "Anda menghubungkan port data ke terminal. Baris kode hijau mengalir deras di layar retina Anda. Firewall sistem mencoba memblokir, tetapi algoritma 'Phantom' Anda berhasil menembusnya. Pintu terbuka dengan suara hidrolik yang berat.",
            outcome: "SUCCESS",
            stat_updates: {
                energy: -15,
                hacking: 5
            },
            inventory_updates: {
                add: [],
                remove: []
            },
            quest_update: "Cari Terminal Utama di Lantai 2",
            game_over: false
        };
    }

    // --- SCENARIO: GAME OVER (Suicide/Give Up) ---
    if (input.includes('die') || input.includes('give up') || input.includes('surrender')) {
        return {
            narrative: "Anda memutuskan untuk menyerah pada nasib. Drone keamanan mengepung Anda, dan layar pandangan Anda perlahan memudar menjadi hitam...",
            outcome: "FAILURE",
            stat_updates: { health: -100 },
            inventory_updates: { add: [], remove: [] },
            quest_update: null,
            game_over: true
        };
    }

    // --- SCENARIO 2: USE STIMPACK (Item Usage) ---
    if (input.includes('stimpack') || input.includes('heal') || input.includes('obat')) {
        // Check if user actually has a stimpack (simple validation logic simulation)
        const hasStimpack = gameState.inventory.some(i => i.name === 'Stimpack');

        if (hasStimpack) {
            return {
                narrative: "Anda menyuntikkan Stimpack ke lengan. Rasa dingin menyebar, diikuti lonjakan adrenalin. Luka-luka Anda menutup dengan cepat, namun jantung Anda berdegup kencang.",
                outcome: "SUCCESS",
                stat_updates: {
                    health: 30,
                    energy: -5
                },
                inventory_updates: {
                    add: [],
                    remove: ["Stimpack"]
                },
                quest_update: null,
                game_over: false
            };
        } else {
            return {
                narrative: "Anda merogoh tas, tetapi tidak menemukan Stimpack tersisa. Situasi semakin gawat.",
                outcome: "FAILURE",
                stat_updates: null,
                inventory_updates: { add: [], remove: [] },
                quest_update: null,
                game_over: false
            };
        }
    }

    // --- SCENARIO 3: TAG-BASED INTERACTION (Heat/Melt) ---
    if (input.includes('melt') || input.includes('leleh') || input.includes('cair') || input.includes('bakar')) {
        // Check for item with 'heat' tag
        const heatItem = gameState.inventory.find(i => i.tags && i.tags.includes('heat'));

        if (heatItem) {
            return {
                narrative: `Anda mengaktifkan **${heatItem.name}**. Semburan panas intens memancar, mengubah es tebal yang menghalangi jalan menjadi uap dalam hitungan detik. Jalan kini terbuka.`,
                outcome: "SUCCESS",
                stat_updates: { energy: -10 },
                inventory_updates: { add: [], remove: [] },
                quest_update: "Masuk ke Ruang Server Dingin",
                game_over: false
            };
        } else {
            return {
                narrative: "Anda mencoba mencari cara untuk melelehkan halangan ini, tetapi tidak ada alat yang menghasilkan panas yang cukup di inventory Anda.",
                outcome: "FAILURE",
                stat_updates: { energy: -2 },
                inventory_updates: { add: [], remove: [] },
                quest_update: null,
                game_over: false
            };
        }
    }

    // --- SCENARIO 4: DEFAULT / FALLBACK ---
    return {
        narrative: `Sistem memproses tindakan: "${userInput}". Lingkungan sekitar tampak tenang, namun waspada. Apa langkah Anda selanjutnya?`,
        outcome: "NEUTRAL",
        stat_updates: null,
        inventory_updates: {
            add: [],
            remove: []
        },
        quest_update: null,
        game_over: false,
        theme_config: {
            scifi: { main: "#09090b", accent: "#4f46e5" },
            horror: { main: "#0a0505", accent: "#dc2626" },
            romance: { main: "#1f1016", accent: "#db2777" }
        }
    };
};
