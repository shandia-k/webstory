export const GAME_DATA = {
    scifi: {
        avatar: "🤖",
        stats: { "Hacking": 80, "Battery": 60, "Reputation": 40 },
        status: ["Wanted", "Enhanced"],
        quest: "Retas mainframe Arasaka Tower.",
        intro: "Hujan neon membasahi jaket sintetikmu. Drone polisi berpatroli di atas.",
        items: [
            { name: "Plasma Cutter", icon: "🔫", desc: "Pemotong logam laser.", tags: ["Tool", "Heat", "Illegal"] },
            { name: "Datapad", icon: "📱", desc: "Tablet enkripsi tingkat militer.", tags: ["Intel", "Hack"] },
            { name: "Stimpack", icon: "💉", desc: "Peningkat refleks instan.", tags: ["Consumable", "Buff"] },
            { name: "ID Palsu", icon: "💳", desc: "Akses level 2.", tags: ["Key", "Social"] }
        ]
    },
    horror: {
        avatar: "😱",
        stats: { "Fisik": 45, "Kewarasan": 90, "Adrenalin": 30 },
        status: ["Terluka", "Paranoid"],
        quest: "Cari jalan keluar dari Mansion sebelum jam 3 pagi.",
        intro: "Lantai kayu berderit... Sesuatu baru saja lewat di belakangmu.",
        items: [
            { name: "Senter Tua", icon: "🔦", desc: "Baterai tinggal sedikit.", tags: ["Light", "Tool"] },
            { name: "Kunci Karat", icon: "🗝️", desc: "Bau darah kering.", tags: ["Key", "Metal"] },
            { name: "P3K", icon: "🩹", desc: "Perban dan antiseptik.", tags: ["Heal", "Consumable"] }
        ]
    },
    romance: {
        avatar: "🥰",
        stats: { "Penampilan": 85, "Mood": 70, "Afeksi": 20 },
        status: ["Nervous", "Wangi"],
        quest: "Ajak dia ke prom night tanpa terlihat canggung.",
        intro: "Dia sedang membaca buku di perpustakaan. Cahaya matahari mengenai wajahnya.",
        items: [
            { name: "Cokelat", icon: "🍫", desc: "Merk mahal, favoritnya.", tags: ["Gift", "Food"] },
            { name: "Surat Cinta", icon: "💌", desc: "Ditulis tangan dengan rapi.", tags: ["KeyItem", "Risky"] },
            { name: "Parfum", icon: "🧴", desc: "Aroma vanilla lembut.", tags: ["Buff", "Cosmetic"] },
            { name: "Tiket Film", icon: "🎫", desc: "Film horor terbaru.", tags: ["Event", "Date"] }
        ]
    }
};
