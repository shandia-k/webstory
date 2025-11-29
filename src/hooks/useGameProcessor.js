import { useCallback } from 'react';
import { generateGameResponse } from '../services/llmService';
import { UI_TEXT } from '../constants/strings';

export function useGameProcessor(state, gameCore) {
    const {
        stats,
        inventory,
        quest,
        genre,
        history,
        summary,
        language,
        apiKey,
        gameOver,
        isProcessing,
        setIsProcessing,
        setHistory,
        setChoices
    } = state;

    const { processResponseUpdates } = gameCore;

    const handleAction = useCallback(async (input) => {
        // Allow initialization even if gameOver is true
        const isInit = input.startsWith('SYSTEM_INIT_GENRE:');
        if (!input.trim() || isProcessing || (gameOver && !isInit)) return;

        // 1. Add User Message
        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: input.startsWith('inspect:')
                ? UI_TEXT.UI.TEMPLATES.ACTION_INSPECT.replace('{0}', input.split(':')[1])
                : input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setHistory(prev => [...prev, userMsg]);
        setChoices([]); // Clear choices immediately
        setIsProcessing(true);

        try {
            // 2. Prepare State for LLM
            const gameState = { stats, inventory, quest, history, summary, genre, language };

            // Check for API Key if not init
            if (!isInit && !apiKey) {
                throw new Error("API_KEY_MISSING");
            }

            // 3. Call LLM
            const response = await generateGameResponse(apiKey, input, gameState);

            // 4. Process Response via Core Logic
            processResponseUpdates(response);

            // 5. Add AI Narrative
            const aiMsg = {
                id: Date.now() + 1,
                role: 'ai',
                content: response.narrative,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setHistory(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("LLM Error:", error);

            let errorMessage = 'Error: Connection to Neural Link lost.';
            if (error.message === 'API_KEY_MISSING') {
                errorMessage = 'SYSTEM ERROR: API Key Missing. Please configure it in Settings.';
            }

            setHistory(prev => [...prev, {
                id: Date.now() + 2,
                role: 'system',
                content: errorMessage,
                timestamp: new Date().toLocaleTimeString()
            }]);
        } finally {
            setIsProcessing(false);
        }
    }, [
        stats, inventory, quest, genre, history, summary, language, apiKey,
        gameOver, isProcessing, setIsProcessing, setHistory, setChoices,
        processResponseUpdates
    ]);

    return { handleAction };
}
