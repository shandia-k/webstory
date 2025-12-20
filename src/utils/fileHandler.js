/**
 * Handles saving game data to a JSON file.
 * Supports File System Access API with fallback to legacy download.
 * @param {Object} data - The game state object to save.
 * @returns {Promise<void>}
 */
export const saveGameToFile = async (data, customFileName = null) => {
    const jsonString = JSON.stringify(data, null, 2);
    const fileName = customFileName || `nexus_save_${new Date().toISOString().slice(0, 10)}.json`;

    try {
        // Try File System Access API (Modern Browsers)
        if ('showSaveFilePicker' in window) {
            const handle = await window.showSaveFilePicker({
                suggestedName: fileName,
                types: [{
                    description: 'Nexus RPG Save File',
                    accept: { 'application/json': ['.json'] },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(jsonString);
            await writable.close();
        } else {
            // Fallback for browsers that don't support the API
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    } catch (err) {
        // Re-throw error unless it's a user cancellation
        if (err.name !== 'AbortError') {
            throw err;
        }
    }
};

/**
 * Parses a JSON save file.
 * @param {File} file - The file object from input[type="file"].
 * @returns {Promise<Object>} - The parsed JSON data.
 */
export const parseSaveFile = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("No file provided"));
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
    });
};
