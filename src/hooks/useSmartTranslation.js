import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { translateUiSubset } from '../services/llmService';
import { TRANSLATIONS } from '../constants/textUI';

export function useSmartTranslation(sectionKey) {
    const { language, apiKey, updateUiText, uiText } = useGame();
    const [isLoading, setIsLoading] = useState(false);

    // Check if we are using a custom language (not English)
    const isCustomLanguage = language && language.toLowerCase() !== 'english';

    // Check if the section is already translated
    // We can check if the current UI text for this section is different from English default
    // OR better: check if it exists in the custom data source (if we had access to raw customUiText)
    // But since uiText is merged, we can't easily tell source.
    // However, we can check if we have a "custom" entry in localStorage directly or via a new exposed state?
    // Actually, useGameState exposes `uiText`.
    // Let's rely on a simpler heuristic:
    // If language is custom, we TRY to translate.
    // But we need to avoid re-translating if already done.
    // We can check if the current text matches English. If it does, it likely needs translation.
    // BUT, what if the translation is identical to English? (Rare, but possible).

    // Better approach:
    // We can't easily access `customUiText` raw state from here unless we expose it.
    // Let's assume if we are in this hook, we want to ensure translation.
    // We can maintain a local "attempted" state or check a global cache?
    // No, let's just expose `customUiText` from useGame?
    // Or, we can just check if `uiText.UI[sectionKey]` is strictly equal to `TRANSLATIONS['English'][sectionKey]`.
    // If strictly equal (reference), then it's definitely the fallback.

    const isTranslated = uiText.UI[sectionKey] !== TRANSLATIONS['English'][sectionKey];

    useEffect(() => {
        if (!isCustomLanguage || !apiKey || !sectionKey) return;
        if (isTranslated) return; // Already translated

        let mounted = true;

        const performTranslation = async () => {
            setIsLoading(true);
            try {
                // Get source text for this section
                const sourceSubset = { [sectionKey]: TRANSLATIONS['English'][sectionKey] };

                // Translate
                const translatedSubset = await translateUiSubset(apiKey, language, sourceSubset);

                if (mounted) {
                    updateUiText(language, translatedSubset, true); // Merge
                }
            } catch (error) {
                console.error(`Smart Translation failed for ${sectionKey}`, error);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        performTranslation();

        return () => { mounted = false; };
    }, [sectionKey, language, apiKey, isTranslated, isCustomLanguage, updateUiText]);

    return { isLoading, isTranslated };
}
