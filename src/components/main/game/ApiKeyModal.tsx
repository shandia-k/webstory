import React, { useRef, useEffect } from 'react';
import { Key, Globe, Volume2, Save, X } from 'lucide-react';
import { useGameStore } from '../../../store/useGameStore';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (key: string, lang: string) => void; // Optional if handled by store directly
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
    // Access Store
    const { settings, setApiKey, setLanguage, setVolume } = useGameStore();

    // Local refs for inputs (uncontrolled for performance, or use state if validation needed live)
    const keyRef = useRef<HTMLInputElement>(null);
    const langRef = useRef<HTMLSelectElement>(null);
    const volumeRef = useRef<HTMLInputElement>(null);

    // Sync from store when opening
    useEffect(() => {
        if (isOpen && keyRef.current) keyRef.current.value = settings.apiKey;
        if (isOpen && langRef.current) langRef.current.value = settings.language;
        if (isOpen && volumeRef.current) volumeRef.current.value = String(settings.volume * 100);
    }, [isOpen, settings]);

    if (!isOpen) return null;

    const handleSave = () => {
        const newKey = keyRef.current?.value || '';
        const newLang = langRef.current?.value || 'English';
        const newVol = parseInt(volumeRef.current?.value || '50') / 100;

        // Update Store
        setApiKey(newKey);
        setLanguage(newLang);
        setVolume(newVol);

        // Call legacy prop if provided (for backward compat if any parent relies on it)
        if (onSave) onSave(newKey, newLang);

        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                role="dialog"
                aria-modal="true"
                className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-2xl border-4 border-blue-100 relative animate-in zoom-in-95 duration-200"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Close"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-2 font-cute">
                    <SettingsIcon /> Settings
                </h2>

                <div className="space-y-4">
                    {/* API KEY */}
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1 flex items-center gap-2">
                            <Key size={16} /> Gemini API Key
                        </label>
                        <input
                            ref={keyRef}
                            type="password"
                            placeholder="Paste your API key here..."
                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-blue-400 focus:outline-none transition-colors font-mono text-sm"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                            Key is stored locally in your browser.
                        </p>
                    </div>

                    {/* LANGUAGE */}
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1 flex items-center gap-2">
                            <Globe size={16} /> Language
                        </label>
                        <select
                            ref={langRef}
                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-blue-400 focus:outline-none transition-colors"
                        >
                            <option value="English">English</option>
                            <option value="Indonesian">Bahasa Indonesia</option>
                            <option value="Japanese">Japanese (日本語)</option>
                        </select>
                    </div>

                    {/* VOLUME */}
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1 flex items-center gap-2">
                            <Volume2 size={16} /> Volume
                        </label>
                        <input
                            ref={volumeRef}
                            type="range"
                            min="0" max="100"
                            className="w-full accent-blue-500"
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-200"
                    >
                        <Save size={18} /> Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper Icon Component
const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

export default ApiKeyModal;
