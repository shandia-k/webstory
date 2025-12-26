import { useState, useEffect } from 'react';
import { generateVisualDirection } from '../services/llmService';
import { VisualResponse } from '../types/api';

const DEFAULT_VISUALS: VisualResponse = {
    paper_texture: 'clean',
    lighting: 'flat',
    palette: {
        bg: '#18181b', // Default zinc-900
        panel: '#27272a', // zinc-800
        accent: '#4f46e5', // indigo-600
        text: '#e4e4e7' // zinc-200
    },
    filter: 'none'
};

export const useVisualDirector = (context: string) => {
    const [visuals, setVisuals] = useState<VisualResponse>(DEFAULT_VISUALS);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!context) return;

        const fetchVisuals = async () => {
            const apiKey = localStorage.getItem('nexus_api_key');
            if (!apiKey) return;

            setLoading(true);
            try {
                // Debounce or cache check could happen here
                const data = await generateVisualDirection(apiKey, context);
                setVisuals(data);
                applyVisualsToDom(data);
            } catch (err) {
                console.error("Failed to update visuals:", err);
            } finally {
                setLoading(false);
            }
        };

        // Simple debounce to prevent thrashing on rapid context updates
        const timer = setTimeout(fetchVisuals, 1000);
        return () => clearTimeout(timer);

    }, [context]);

    const applyVisualsToDom = (data: VisualResponse) => {
        const root = document.documentElement;

        // Colors
        root.style.setProperty('--color-bg-main', data.palette.bg);
        root.style.setProperty('--color-bg-panel', data.palette.panel);
        root.style.setProperty('--color-accent', data.palette.accent);
        root.style.setProperty('--color-text-main', data.palette.text);

        // Texture
        if (data.paper_texture === 'rough') {
            root.style.setProperty('--opacity-grain', '0.1');
        } else if (data.paper_texture === 'crumpled') {
            root.style.setProperty('--opacity-grain', '0.15');
        } else {
            root.style.setProperty('--opacity-grain', '0.05');
        }

        // Filter
        document.body.style.filter = data.filter !== 'none' ? data.filter : '';

        // Lighting Logic (Simplified for CSS)
        // We can map 'long-right' to shadow offsets
        if (data.lighting === 'long-right') {
            root.style.setProperty('--shadow-offset-x', '8px');
            root.style.setProperty('--shadow-offset-y', '8px');
        } else if (data.lighting === 'flat') {
            root.style.setProperty('--shadow-offset-x', '2px');
            root.style.setProperty('--shadow-offset-y', '2px');
        } else {
            root.style.setProperty('--shadow-offset-x', '4px');
            root.style.setProperty('--shadow-offset-y', '4px');
        }
    };

    return { visuals, loading };
};
