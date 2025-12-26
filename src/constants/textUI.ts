const TEXT_UI_EN = {
    BUTTON_SUMMARY: "View Mission Progress",
    TEMPLATES: {
        ACTION_INSPECT: "Inspecting {0}...",
    },
    API_MODAL: {
        TITLE: "API Configuration",
        SUBTITLE: "Enter your Google Gemini API Key",
        PLACEHOLDER: "AIzaSy...",
        PRIVACY_NOTE: "Your key is stored locally in your browser. It is never sent to any server other than Google's API.",
        BTN_TEST: "Test Key",
        BTN_SAVE: "Save",
        BTN_SAVE_CONFIG: "Save Configuration",
        STATUS_TESTING: "Verifying key with Google...",
        STATUS_SUCCESS: "Connection Successful! Key is valid.",
        ERR_EMPTY: "Please enter an API Key first.",
        LANGUAGE_LABEL: "Language (Optional)",
        LANGUAGE_PLACEHOLDER: "e.g. Indonesian, English, Japanese...",
    },
    API_ERRORS: {
        MISSING_KEY: "API Key is missing",
        EMPTY_KEY: "API Key is empty",
        INVALID_KEY: "Invalid API Key. Please check your key.",
        ACCESS_DENIED: "Access Denied. API Key may be invalid or restricted.",
        QUOTA_EXCEEDED: "Quota Exceeded. You have hit the rate limit.",
        SERVER_ERROR: "Google Server Error. Please try again later.",
        SERVICE_UNAVAILABLE: "Service Unavailable. Google servers are overloaded.",
        NETWORK_ERROR: "Network Error. Check your internet connection.",
        UNKNOWN_ERROR: "Unknown API Error",
        DEFAULT_FAIL: "Failed to connect to Gemini API.",
        JSON_PARSE: "The system glitched. Data corruption detected. (JSON Parse Error)",
    },
    HUB: {
        HEADER: "Where to Next?",
        SUBHEADER: "",
        SELECT_WORLD: "Pick a universe!",
        BTN_RESUME: "RESUME",
        BTN_START: "START",
        BTN_CANCEL: "Cancel",
        NOTIFICATIONS: {
            CONFIRM_NEW_GAME_TITLE: "Start New Game?",
            CONFIRM_NEW_GAME: "Starting a new game will overwrite your current auto-save. Are you sure?",
            RESUME_SUCCESS: "Game Resumed!",
            RESUME_FAIL: "Failed to resume game",
            SAVE_SUCCESS: "Game Saved Successfully!",
            SAVE_FAIL: "Failed to save game",
            LOAD_INVALID: "Invalid Save File",
            LOAD_FAIL: "Failed to load file",
            LOAD_SUCCESS: "Loaded: {0}"
        }
    },
    COMBAT: {
        HEADER: "BATTLE MODE",
        BTN_ATTACK: "ATTACK",
        BTN_HEAL: "HEAL",
        BTN_FLEE: "FLEE"
    },
    ADVENTURE: {
        CHAPTER: "CHAPTER",
        CONNECTION_LOST: "CONNECTION LOST",
        BTN_ABORT: "ABORT MISSION"
    },
    CUTE_UI: {
        INVENTORY: {
            TITLE: "Inventory",
            EMPTY: "Your backpack is empty!"
        },
        ACTIONS: {
            FEED: "Feed",
            PLAY: "Play",
            SLEEP: "Nap",
            PET: "Pet"
        },
        EXPLORE: "Explore",
        STATS: {
            HAPPY: "Happiness",
            ENERGY: "Energy",
            BELLY: "Belly"
        },
        NEW_FRIEND: "New Friend!",
        GIVE_NAME: "Give a Name",
        BTN_CHOOSE: "CHOOSE",
        BTN_CONTINUE: "CONTINUE",
        BTN_BACK: "Back to Choice",
        BTN_ADOPT: "ADOPT",
        STARTER_PACK: "Starter Pack",
        READY: "is ready!",
        LOADING: {
            EGGS: "FINDING EGGS...",
            ADOPTING: "SIGNING ADOPTION PAPERS...",
            CONNECTING: "Connecting to Pal-Verse..."
        }
    },
    CONTENT: {
        QUEST_INIT: "Initializing...",
        QUEST_DEFAULT: "Neon Rain",
        SUMMARY_INIT: "Waiting for AI response...",
        SUMMARY_RESTORED: "Simulation restored.",
        HISTORY_SYSTEM_INIT: "Waiting for AI response...",
        HISTORY_AI_INIT: "Waiting for AI response...",
        LOAD_SUCCESS_MSG: "Game loaded successfully.",
    },
    FIXED: {
        APP_TITLE: "Nexus RPG",
        APP_VERSION: "v0.0.1 • System Alpha",
        GENRE_DEFAULT: "scifi"
    }
};

const TEXT_UI_ID = {
    BUTTON_SUMMARY: "Lihat Progres Misi",
    TEMPLATES: {
        ACTION_INSPECT: "Memeriksa {0}...",
    },
    API_MODAL: {
        TITLE: "Konfigurasi API",
        SUBTITLE: "Masukkan Google Gemini API Key Anda",
        PLACEHOLDER: "AIzaSy...",
        PRIVACY_NOTE: "Key Anda disimpan secara lokal di browser. Tidak pernah dikirim ke server selain Google API.",
        BTN_TEST: "Tes Key",
        BTN_SAVE: "Simpan",
        BTN_SAVE_CONFIG: "Simpan Konfigurasi",
        STATUS_TESTING: "Memverifikasi key dengan Google...",
        STATUS_SUCCESS: "Koneksi Berhasil! Key valid.",
        ERR_EMPTY: "Mohon masukkan API Key terlebih dahulu.",
        LANGUAGE_LABEL: "Bahasa (Opsional)",
        LANGUAGE_PLACEHOLDER: "cth. Indonesian, English, Japanese...",
    },
    API_ERRORS: {
        MISSING_KEY: "API Key hilang",
        EMPTY_KEY: "API Key kosong",
        INVALID_KEY: "API Key tidak valid. Cek key Anda.",
        ACCESS_DENIED: "Akses Ditolak. API Key mungkin salah atau dibatasi.",
        QUOTA_EXCEEDED: "Kuota Terlampaui. Anda mencapai batas rate limit.",
        SERVER_ERROR: "Google Server Error. Coba lagi nanti.",
        SERVICE_UNAVAILABLE: "Layanan Tidak Tersedia. Server Google sibuk.",
        NETWORK_ERROR: "Error Jaringan. Cek koneksi internet Anda.",
        UNKNOWN_ERROR: "Error API Tidak Diketahui",
        DEFAULT_FAIL: "Gagal terhubung ke Gemini API.",
        JSON_PARSE: "Sistem glitch. Korupsi data terdeteksi. (JSON Parse Error)",
    },
    HUB: {
        HEADER: "Mau kemana?",
        SUBHEADER: "",
        SELECT_WORLD: "Pilih sebuah semesta!",
        BTN_RESUME: "LANJUT",
        BTN_START: "MULAI",
        BTN_CANCEL: "Batal",
        NOTIFICATIONS: {
            CONFIRM_NEW_GAME_TITLE: "Mulai Game Baru?",
            CONFIRM_NEW_GAME: "Memulai game baru akan menimpa auto-save saat ini. Anda yakin?",
            RESUME_SUCCESS: "Game Dilanjutkan!",
            RESUME_FAIL: "Gagal melanjutkan game",
            SAVE_SUCCESS: "Game Berhasil Disimpan!",
            SAVE_FAIL: "Gagal menyimpan game",
            LOAD_INVALID: "File Save Tidak Valid",
            LOAD_FAIL: "Gagal memuat file",
            LOAD_SUCCESS: "Dimuat: {0}"
        }
    },
    COMBAT: {
        HEADER: "MODE TEMPUR",
        BTN_ATTACK: "SERANG",
        BTN_HEAL: "PULIH",
        BTN_FLEE: "KABUR"
    },
    ADVENTURE: {
        CHAPTER: "BAB",
        CONNECTION_LOST: "KONEKSI TERPUTUS",
        BTN_ABORT: "BATALKAN MISI"
    },
    CUTE_UI: {
        INVENTORY: {
            TITLE: "Inventaris",
            EMPTY: "Tasmu kosong!"
        },
        ACTIONS: {
            FEED: "Makan",
            PLAY: "Main",
            SLEEP: "Tidur",
            PET: "Elus"
        },
        EXPLORE: "Jelajah",
        STATS: {
            HAPPY: "Bahagia",
            ENERGY: "Energi",
            BELLY: "Perut"
        },
        NEW_FRIEND: "Teman Baru!",
        GIVE_NAME: "Beri Nama",
        BTN_CHOOSE: "PILIH",
        BTN_CONTINUE: "LANJUT",
        BTN_BACK: "Kembali",
        BTN_ADOPT: "ADOPSI",
        STARTER_PACK: "Paket Awal",
        READY: "sudah siap!",
        LOADING: {
            EGGS: "MENCARI TELUR...",
            ADOPTING: "MENANDATANGANI SURAT ADOPSI...",
            CONNECTING: "Terhubung ke Pal-Verse..."
        }
    },
    CONTENT: {
        QUEST_INIT: "Menginisialisasi...",
        QUEST_DEFAULT: "Neon Rain",
        SUMMARY_INIT: "Menunggu respon AI...",
        SUMMARY_RESTORED: "Simulasi dipulihkan.",
        HISTORY_SYSTEM_INIT: "Menunggu respon AI...",
        HISTORY_AI_INIT: "Menunggu respon AI...",
        LOAD_SUCCESS_MSG: "Game berhasil dimuat.",
    },
    FIXED: {
        APP_TITLE: "Nexus RPG",
        APP_VERSION: "v0.0.1 • System Alpha",
        GENRE_DEFAULT: "scifi"
    }
};

export const TEXT_UI = TEXT_UI_EN; // Default export for backward compatibility

export const TRANSLATIONS = {
    'English': TEXT_UI_EN,
    'Indonesian': TEXT_UI_ID,
    'Bahasa Indonesia': TEXT_UI_ID, // Alias
    'ID': TEXT_UI_ID // Alias
};
