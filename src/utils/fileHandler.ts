/**
 * Handles saving game data to a JSON file.
 * Supports File System Access API with fallback to legacy download.
 */
export const saveGameToFile = async (data: any, customFileName: string | null = null): Promise<void> => {
    const jsonString = JSON.stringify(data, null, 2);
    const fileName = customFileName || `nexus_save_${new Date().toISOString().slice(0, 10)}.json`;

    try {
        // Try File System Access API (Modern Browsers)
        // @ts-ignore - Window interface augmentation would be better, but keeping it simple for now
        if ('showSaveFilePicker' in window) {
            // @ts-ignore
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
    } catch (err: any) {
        // Re-throw error unless it's a user cancellation
        if (err.name !== 'AbortError') {
            throw err;
        }
    }
};

/**
 * Parses a JSON save file.
 */
export const parseSaveFile = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("No file provided"));
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const result = event.target?.result;
                if (typeof result === 'string') {
                    const data = JSON.parse(result);
                    resolve(data);
                } else {
                    reject(new Error("File content is not text"));
                }
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
    });
};

