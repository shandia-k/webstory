# Analisis Dependensi & Fitur Khusus `src/components/testing/TestPage.jsx`

Berikut adalah hasil analisis mendalam mengenai `TestPage.jsx` dan ketergantungannya terhadap project utama.

## 1. Modul Project Besar yang Digunakan oleh `TestPage.jsx`

`TestPage.jsx` tidak berdiri sendiri; ia sangat bergantung pada infrastruktur project utama. Berikut adalah modul-modul dari project besar yang diimpor dan digunakan:

### Context & Services (Logic Core)
*   **`src/context/GameContext.jsx`**: Digunakan untuk mengakses `apiKey` global dan hook `useGame`.
*   **`src/services/mockService.js`**: Digunakan untuk mengambil data dungeon palsu (`getMockDungeonData`) untuk simulasi offline.
*   **`src/services/llmService.js`**: Digunakan untuk logika AI, khususnya fungsi `generateGameResponse` dan `generateSector`.

### UI Components (Visual Building Blocks)
*   **`src/components/game/game-board/input-area/InputArea.jsx`**: Komponen input utama (kartu aksi & text area).
*   **`src/components/game/game-board/sidebar/Sidebar.jsx`**: Panel kiri yang menampilkan status karakter dan inventory.
*   **`src/components/game/game-board/header/Header.jsx`**: Header atas untuk navigasi dan judul quest.
*   **`src/components/game/game-board/narrative-feed/NarrativeFeed.jsx`**: Area tampilan teks cerita/chat.
*   **`src/components/game/game-board/BackgroundLayer.jsx`**: Layer background visual.
*   **`src/components/game/game-board/ParticleLayer.jsx`**: Efek partikel visual.

### External Libraries
*   **`lucide-react`**: Ikon-ikon UI.

---

## 2. Fitur Khusus Modul untuk Mengakomodasi `TestPage.jsx`

Ditemukan beberapa fitur atau pola desain pada modul-modul di atas yang tampaknya dibuat **khusus** atau **sangat memfasilitasi** keberadaan `TestPage.jsx` agar bisa berjalan terisolasi dari game utama:

### A. Pola "Prop Fallback" pada Komponen UI Utama
Komponen `Sidebar`, `Header`, dan `NarrativeFeed` memiliki pola kode spesifik yang memungkinkan `TestPage` menyuntikkan datanya sendiri tanpa merusak atau bergantung penuh pada `GameContext` global.

*   **Di `Sidebar.jsx`:**
    ```javascript
    // Baris 11-14:
    const stats = propStats || gameContext.stats;
    const inventory = propInventory || gameContext.inventory;
    const playerName = propPlayerName || gameContext.playerName;
    ```
    **Analisis:** Fitur ini memungkinkan `TestPage` mengirimkan `stats` dan `inventory` simulasi (lokal state) langsung via props, mengabaikan data dari `GameContext` yang dipakai oleh game utama.

*   **Di `Header.jsx`:**
    ```javascript
    // Baris 15-16:
    const quest = propQuest || gameContext.quest;
    const uiText = propUiText || gameContext.uiText;
    // Baris 35:
    {rightContent ? rightContent : ( ... tombol menu default ... )}
    ```
    **Analisis:** `TestPage` menggunakan prop `rightContent` untuk merender tombol "EXIT LAB" khusus, menggantikan tombol menu hamburger standar yang ada di game utama.

*   **Di `NarrativeFeed.jsx`:**
    ```javascript
    // Baris 15:
    const history = propHistory || gameContext.history;
    ```
    **Analisis:** Memungkinkan `TestPage` menampilkan log/history lokalnya sendiri (`feed` state) daripada history global game.

### B. Fungsi Khusus di `mockService.js`
File ini berisi fungsi yang secara eksplisit didedikasikan untuk kebutuhan testing di `TestPage`:

*   **`getMockDungeonData()`**: Docstring-nya secara harfiah berbunyi *"Returns the mock dungeon data for the Test Lab."*. Fungsi ini menyediakan struktur data map/room statis yang dipakai `TestPage` saat mode offline.
*   **`getMockSector()`**: Digunakan untuk mensimulasikan respons pembuatan sektor area baru tanpa memanggil AI, fitur yang sedang diuji di `TestPage`.

### C. Arsitektur "Sector Generation" di `llmService.js`
*   **`generateSector()`**: Fungsi ini diimpor secara *dynamic import* di dalam `TestPage.jsx` (`const { generateSector } = await import(...)`).
    **Analisis:** Saat ini, `TestPage.jsx` adalah satu-satunya konsumen dari fungsi `generateSector`. Ini menunjukkan bahwa fitur "Pre-Generation" (membuat 5-8 ruangan sekaligus dengan AI) adalah fitur eksperimental yang sedang dikembangkan dan diuji secara eksklusif di dalam `TestPage` sebelum diintegrasikan ke game utama.
