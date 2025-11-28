export const SCENARIOS = {
    horror: {
        narrative: "Anda terbangun di lantai dingin sebuah rumah sakit tua. Bau antiseptik bercampur dengan bau busuk yang samar. Senter di tangan Anda berkedip lemah, satu-satunya sumber cahaya di kegelapan yang mencekam ini.",
        outcome: "NEUTRAL",
        stats_set: { health: 60, stamina: 40, sanity: 100 },
        inventory_set: [
            { name: "Rusty Flashlight", count: 1, tags: ["tool", "light"], type: "tool", icon: "🔦", value: 100, max_value: 100 },
            { name: "Dirty Bandage", count: 2, tags: ["consumable", "heal"], type: "consumable", icon: "🩹" },
            { name: "Old Key", count: 1, tags: ["key", "rusty"], type: "key", icon: "🗝️" }
        ],
        quest_update: "Cari jalan keluar dari Bangsal 4",
        game_over: false,
        theme_config: { main: "#0a0505", accent: "#dc2626" }
    },
    romance: {
        narrative: "Angin sore berhembus lembut di taman kota Neo-Kyoto. Anda memegang surat beraroma mawar itu dengan tangan gemetar. Dia berjanji akan datang hari ini, di bawah pohon sakura hologram ini.",
        outcome: "NEUTRAL",
        stats_set: { mood: 80, energy: 100, charm: 50 },
        inventory_set: [
            { name: "Golden Locket", count: 1, tags: ["keepsake", "memory"], type: "keepsake", icon: "💖" },
            { name: "Perfumed Letter", count: 1, tags: ["intel", "paper"], type: "intel", icon: "💌" },
            { name: "Red Rose", count: 1, tags: ["gift", "flower"], type: "gift", icon: "🌹" }
        ],
        quest_update: "Tunggu kedatangan 'Dia'",
        game_over: false,
        theme_config: { main: "#1f1016", accent: "#db2777" }
    },
    scifi: {
        narrative: "Hujan neon membasahi jaket sintetikmu. Drone polisi berpatroli di atas, memindai setiap sudut lorong gelap ini. Misi Anda baru saja dimulai.",
        outcome: "NEUTRAL",
        stats_set: { health: 100, energy: 100, shield: 100 },
        inventory_set: [
            { name: "Plasma Cutter", count: 1, tags: ["tool", "heat", "weapon"], type: "tool", icon: "🔫" },
            { name: "Stimpack", count: 3, tags: ["consumable", "heal"], type: "consumable", icon: "💉" },
            { name: "Encrypted Datapad", count: 1, tags: ["intel", "encrypted"], type: "intel", icon: "💾" }
        ],
        quest_update: "Temui Kontak di Sektor 7",
        game_over: false,
        theme_config: { main: "#09090b", accent: "#4f46e5" }
    }
};
