// This service simulates the High-Context LLM defined in the System Prompt.
// It returns strict JSON objects to control the game state.

export const mockLLM = async (userInput, gameState) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const input = userInput.toLowerCase();

    // --- ON-DEMAND CONTEXT AWARENESS ---
    // Only access history if specific keywords are present to save context window.


    if (input.includes('ringkasan') || input.includes('summary') || input.includes('recap')) {
        // Simple summary based on history length (Simulation)
        const count = gameState.history.length;
        return {
            narrative: `(Analisis Log) Kita telah melewati ${count} pertukaran data. Misi "${gameState.quest}" masih aktif. Kondisi fisik tercatat: Health ${gameState.stats.health}%. Fokus pada tujuan utama.`,
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

        if (genre === 'horror') {
            return {
                narrative: "Anda terbangun di lantai dingin sebuah rumah sakit tua. Bau antiseptik bercampur dengan bau busuk yang samar. Senter di tangan Anda berkedip lemah, satu-satunya sumber cahaya di kegelapan yang mencekam ini.",
                outcome: "NEUTRAL",
                // Horror: Health, Stamina (Energy), Sanity (Shield replacement)
                stats_set: { health: 60, stamina: 40, sanity: 100 },
                inventory_set: [ // New operation: SET inventory
                    { name: "Rusty Flashlight", count: 1, tags: ["tool", "light"], type: "tool", icon: "🔦", value: 100, max_value: 100 },
                    { name: "Dirty Bandage", count: 2, tags: ["consumable", "heal"], type: "consumable", icon: "🩹" },
                    { name: "Old Key", count: 1, tags: ["key", "rusty"], type: "key", icon: "🗝️" }
                ],
                quest_update: "Cari jalan keluar dari Bangsal 4",
                game_over: false,
                theme_config: { main: "#0a0505", accent: "#dc2626" }
            };
        } else if (genre === 'romance') {
            return {
                narrative: "Angin sore berhembus lembut di taman kota Neo-Kyoto. Anda memegang surat beraroma mawar itu dengan tangan gemetar. Dia berjanji akan datang hari ini, di bawah pohon sakura hologram ini.",
                outcome: "NEUTRAL",
                // Romance: Mood (Health), Energy, Charm (Shield replacement)
                stats_set: { mood: 80, energy: 100, charm: 50 },
                inventory_set: [
                    { name: "Golden Locket", count: 1, tags: ["keepsake", "memory"], type: "keepsake", icon: "💖" },
                    { name: "Perfumed Letter", count: 1, tags: ["intel", "paper"], type: "intel", icon: "💌" },
                    { name: "Red Rose", count: 1, tags: ["gift", "flower"], type: "gift", icon: "🌹" }
                ],
                quest_update: "Tunggu kedatangan 'Dia'",
                game_over: false,
                theme_config: { main: "#1f1016", accent: "#db2777" }
            };
        } else {
            // Default SCIFI
            return {
                narrative: "Hujan neon membasahi jaket sintetikmu. Drone polisi berpatroli di atas, memindai setiap sudut lorong gelap ini. Misi Anda baru saja dimulai.",
                outcome: "NEUTRAL",
                // Sci-Fi: Health, Energy, Shield
                stats_set: { health: 100, energy: 100, shield: 100 },
                inventory_set: [
                    { name: "Plasma Cutter", count: 1, tags: ["tool", "heat", "weapon"], type: "tool", icon: "🔫" },
                    { name: "Stimpack", count: 3, tags: ["consumable", "heal"], type: "consumable", icon: "💉" },
                    { name: "Encrypted Datapad", count: 1, tags: ["intel", "encrypted"], type: "intel", icon: "💾" }
                ],
                quest_update: "Temui Kontak di Sektor 7",
                game_over: false,
                theme_config: { main: "#09090b", accent: "#4f46e5" }
            };
        }
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
