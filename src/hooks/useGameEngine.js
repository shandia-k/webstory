import { useState, useEffect } from 'react';
import { GAME_DATA } from '../data/gameData';

export function useGameEngine(initialTheme = 'scifi') {
    const [theme, setTheme] = useState(initialTheme);
    const [gameData, setGameData] = useState(GAME_DATA[initialTheme]);
    const [chatLog, setChatLog] = useState([
        { text: "Waiting for initialization...", type: "system" }
    ]);

    useEffect(() => {
        const data = GAME_DATA[theme];
        setGameData(data);
        document.body.setAttribute('data-theme', theme);

        addMessage(`<strong>[SYSTEM]</strong> Genre changed to: ${theme.toUpperCase()}`, 'system');
        addMessage(data.intro, 'ai');
    }, [theme]);

    const addMessage = (text, type) => {
        setChatLog(prev => [...prev, { text, type, id: Date.now() + Math.random() }]);
    };

    const handleInput = (text) => {
        if (!text.trim()) return;
        addMessage(text, 'user');

        // Theme-aware responses
        let response = "...";
        if (theme === 'scifi') response = "Accessing neural link... Command processed.";
        else if (theme === 'horror') response = "The shadows whisper back... 'Did you hear that?'";
        else if (theme === 'romance') response = "She smiles at your words. 'Tell me more...'";

        setTimeout(() => {
            addMessage(response, 'ai');
        }, 600);
    };

    const clearChat = () => {
        setChatLog([{ text: "System memory purged.", type: "system", id: Date.now() }]);
    };

    const inspectItem = (item) => {
        addMessage(`Anda memeriksa <strong>[${item.name}]</strong>...`, 'user');
        setTimeout(() => {
            const tagString = item.tags.join(', ');
            addMessage(`Deskripsi: ${item.desc}<br>Sifat Objek: <span style="color:var(--accent)">[${tagString}]</span>`, 'system');
        }, 300);
    };

    return {
        theme,
        setTheme,
        gameData,
        chatLog,
        handleInput,
        inspectItem,
        clearChat
    };
}
