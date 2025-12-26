import React, { createContext, useContext, useEffect, useState } from 'react';

interface AssetContextType {
    // Check if an asset exists in the system
    getAssetPath: (id: string, ext?: string) => string | null;
    // Helper to get CSS style for background image if asset exists
    getAssetStyle: (id: string) => React.CSSProperties | undefined;
    // Map of loaded assets (optimization)
    loadedAssets: Record<string, boolean>;
}

const AssetContext = createContext<AssetContextType>({
    getAssetPath: () => null,
    getAssetStyle: () => undefined,
    loadedAssets: {}
});

export const AssetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loadedAssets, setLoadedAssets] = useState<Record<string, boolean>>({});

    // Pre-check common assets
    // In a real app, we might scan the directory or use a manifest. 
    // For now, we'll try to load them on demand or rely on browser caching.

    // We can use a simple "Image Exists" check
    const checkImageExists = (url: string): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    };

    const getAssetPath = (id: string, ext = 'png') => {
        // Respect Vite Base URL (e.g., /webstory/)
        const base = import.meta.env.BASE_URL.endsWith('/')
            ? import.meta.env.BASE_URL
            : `${import.meta.env.BASE_URL}/`;

        return `${base}assets/ui/${id}.${ext}`;
    };

    const getAssetStyle = (id: string): React.CSSProperties | undefined => {
        const path = getAssetPath(id);
        return {
            backgroundImage: `url(${path})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            // Fallback relies on the component handling transparent styling if this is set
        };
    };

    return (
        <AssetContext.Provider value={{ getAssetPath, getAssetStyle, loadedAssets }}>
            {children}
        </AssetContext.Provider>
    );
};

export const useAssets = () => useContext(AssetContext);

// --- COMPONENT: ASSET BUTTON ---
// A deeper integration that renders an IMG if available, or children (CSS) if not.

export const AssetButton: React.FC<{
    id: string; // "btn_feed"
    onClick?: () => void;
    className?: string; // Additional classes
    children?: React.ReactNode; // Fallback content (Text/Icon)
    forceCss?: boolean;
}> = ({ id, onClick, className, children, forceCss }) => {
    const [exists, setExists] = useState(false);
    const { getAssetPath } = useAssets();

    useEffect(() => {
        const url = getAssetPath(id);
        console.log(`[AssetButton] Checking: ${url}`);
        const img = new Image();
        img.onload = () => {
            console.log(`[AssetButton] FOUND: ${url}`);
            setExists(true);
        }
        img.onerror = () => {
            console.log(`[AssetButton] MISSING: ${url}`);
            setExists(false);
        }
        img.src = url;
    }, [id, getAssetPath]);

    if (exists && !forceCss) {
        return (
            <button
                onClick={onClick}
                className={`transition-transform active:scale-95 ${className}`}
                title={id}
            >
                <img src={getAssetPath(id)} alt={id} className="w-full h-full object-contain pointer-events-none" />
            </button>
        );
    }

    // Fallback or Force CSS
    return (
        <button onClick={onClick} className={className}>
            {children}
        </button>
    );
};
