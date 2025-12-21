/**
 * Saves a JSON object to a local file.
 * @param data - The data object to save.
 * @param filename - The name of the file (e.g., 'savegame.json').
 */
export const saveGameToFile = (data: any, filename: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const href = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = href;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(href);
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

/**
 * Parses a JSON file from an input event/file object.
 * @param file - The File object from an input.
 * @returns Promise resolving to the parsed JSON object.
 */
export const parseSaveFile = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("No file provided"));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    const parsed = JSON.parse(result);
                    resolve(parsed);
                } else {
                    reject(new Error("File read failed"));
                }
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error("File read error"));
        reader.readAsText(file);
    });
};
