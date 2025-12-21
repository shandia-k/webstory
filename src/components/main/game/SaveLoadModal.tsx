import React, { useRef } from 'react';
import { Save, Upload, X, Home } from 'lucide-react';
import { useGameStore } from '../../../store/useGameStore';
import { saveGameToFile, parseSaveFile } from '../../../utils/fileHandler';

interface SaveLoadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExitToMenu: () => void;
}

export const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
    isOpen, onClose, onExitToMenu
}) => {
    const { player, items, phase, world, loadGameData } = useGameStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleManualSave = async () => {
        if (!player) return;
        const data = {
            version: "2.0-TS",
            timestamp: new Date().toISOString(),
            player, items, phase, world
        };
        await saveGameToFile(data, `nexus_rpg_save_${Date.now()}.json`);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const data = await parseSaveFile(file);
            loadGameData(data);
            alert("Game Loaded Successfully!");
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to load save file.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-2xl border-4 border-purple-100 relative animate-in zoom-in-95 duration-200">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-2 font-cute">
                    <Save className="text-purple-500" /> Game Menu
                </h2>

                <div className="space-y-3">
                    {/* SAVE GAME */}
                    <button
                        onClick={handleManualSave}
                        className="w-full bg-purple-50 hover:bg-purple-100 text-purple-600 font-bold py-3 px-4 rounded-xl flex items-center gap-3 transition-colors"
                    >
                        <Save size={20} />
                        <span>Export Save File</span>
                    </button>

                    {/* LOAD GAME */}
                    <div className="relative">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                        <button
                            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-500 font-bold py-3 px-4 rounded-xl flex items-center gap-3 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload size={20} />
                            <span>Import Save File</span>
                        </button>
                    </div>

                     {/* EXIT TO MENU */}
                     <button
                        onClick={onExitToMenu}
                        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold py-3 px-4 rounded-xl flex items-center gap-3 transition-colors mt-6 border-t border-rose-100"
                    >
                        <Home size={20} />
                        <span>Exit to Main Menu</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
