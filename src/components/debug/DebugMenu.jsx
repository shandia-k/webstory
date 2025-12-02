import React, { useState } from 'react';
import { Bug, Skull, Heart, Plus, Trash2, Zap, FileText } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { saveGameToFile } from '../../utils/fileHandler';

export function DebugMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [debugLogs, setDebugLogs] = useState([]);
    const [selectedLogId, setSelectedLogId] = useState("");

    // Load logs when menu opens
    React.useEffect(() => {
        if (isOpen) {
            try {
                const savedLogs = JSON.parse(localStorage.getItem('nexus_debug_history') || '[]');
                setDebugLogs(savedLogs);
                if (savedLogs.length > 0) {
                    setSelectedLogId(savedLogs[0].id); // Auto-select newest
                }
            } catch (e) {
                console.error("Failed to load debug logs", e);
            }
        }
    }, [isOpen]);
    const {
        stats, setStats,
        inventory, setInventory,
        setGameOver,
        setLastOutcome,
        handleAction, // Added handleAction
        setQteActive, // Added setQteActive
        rpgState // Added rpgState
    } = useGame();

    const damageCharacter = () => {
        setStats(prev => {
            const newHealth = Math.max(0, prev.health - 20);
            if (newHealth === 0) setGameOver(true);
            return { ...prev, health: newHealth };
        });
    };

    const healCharacter = () => {
        setStats(prev => ({ ...prev, health: 100, energy: 100, sanity: 100 }));
        setGameOver(false);
    };

    const addItem = () => {
        const newItem = {
            name: "Debug Tool",
            count: 1,
            tags: ["tool", "debug"],
            type: "tool",
            icon: "🔧"
        };
        setInventory(prev => [...prev, newItem]);
    };

    const clearInventory = () => {
        setInventory([]);
    };

    const killCharacter = () => {
        setStats(prev => ({ ...prev, health: 0 }));
        setGameOver(true);
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999] pb-[env(safe-area-inset-bottom)]">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-3 rounded-full shadow-lg transition-all ${isOpen ? 'bg-red-500 text-white rotate-45' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
                <Bug size={24} />
            </button>

            {/* Menu Panel */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4 space-y-4 animate-in slide-in-from-bottom-5 fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Debug Console</h3>
                        <span className="text-[10px] text-gray-500">v0.1</span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">

                        <button
                            onClick={healCharacter}
                            className="flex flex-col items-center justify-center gap-1 p-2 bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 rounded-lg border border-emerald-900/50 transition-colors"
                        >
                            <Heart size={16} />
                            <span className="text-[10px]">Heal All</span>
                        </button>
                        <button
                            onClick={damageCharacter}
                            className="flex flex-col items-center justify-center gap-1 p-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg border border-red-900/50 transition-colors"
                        >
                            <Zap size={16} />
                            <span className="text-[10px]">Dmg -20</span>
                        </button>
                        <button
                            onClick={addItem}
                            className="flex flex-col items-center justify-center gap-1 p-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 rounded-lg border border-blue-900/50 transition-colors"
                        >
                            <Plus size={16} />
                            <span className="text-[10px]">Add Item</span>
                        </button>
                        <button
                            onClick={clearInventory}
                            className="flex flex-col items-center justify-center gap-1 p-2 bg-orange-900/30 hover:bg-orange-900/50 text-orange-400 rounded-lg border border-orange-900/50 transition-colors"
                        >
                            <Trash2 size={16} />
                            <span className="text-[10px]">Clear Inv</span>
                        </button>
                        <button
                            onClick={killCharacter}
                            className="flex flex-col items-center justify-center gap-1 p-2 bg-red-950/50 hover:bg-red-900/80 text-red-500 rounded-lg border border-red-900/50 transition-colors col-span-2"
                        >
                            <Skull size={16} />
                            <span className="text-[10px]">KILL PLAYER (TEST GAME OVER)</span>
                        </button>

                        {/* Debug Logs Section */}
                        <div className="col-span-2 border-t border-gray-800 pt-2 mt-2">
                            <label className="text-[10px] text-gray-500 uppercase block mb-1">Raw JSON Logs</label>
                            <select
                                className="w-full bg-gray-800 text-gray-300 text-[10px] p-1 rounded border border-gray-700 mb-2"
                                value={selectedLogId}
                                onChange={(e) => setSelectedLogId(Number(e.target.value))}
                            >
                                <option value="">Select a log...</option>
                                {debugLogs.map(log => (
                                    <option key={log.id} value={log.id}>
                                        [{log.timestamp}] {log.type}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={async () => {
                                    try {
                                        const logToDownload = debugLogs.find(l => l.id === selectedLogId);

                                        if (logToDownload) {
                                            const fileName = `nexus_raw_${logToDownload.type}_${logToDownload.timestamp.replace(/:/g, '-')}.json`;
                                            await saveGameToFile(logToDownload.data, fileName);
                                        } else {
                                            alert("Please select a log to download.");
                                        }
                                    } catch (error) {
                                        console.error("Download failed:", error);
                                        alert(`Download failed: ${error.message}`);
                                    }
                                }}
                                disabled={!selectedLogId}
                                className={`flex flex-col items-center justify-center gap-1 p-2 w-full rounded-lg border transition-colors ${selectedLogId
                                    ? 'bg-purple-900/30 hover:bg-purple-900/50 text-purple-400 border-purple-900/50'
                                    : 'bg-gray-800/50 text-gray-600 border-gray-800 cursor-not-allowed'
                                    }`}
                            >
                                <FileText size={16} />
                                <span className="text-[10px]">DOWNLOAD SELECTED JSON</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
