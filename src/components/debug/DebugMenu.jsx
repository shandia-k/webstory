import React, { useState } from 'react';
import { Bug, Skull, Heart, Plus, Trash2, Zap, ToggleLeft, ToggleRight, Check, XCircle } from 'lucide-react';
import { useGame } from '../../context/GameContext';

export function DebugMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const {
        stats, setStats,
        inventory, setInventory,
        setGameOver,
        setLastOutcome,
        isMockMode, setIsMockMode
    } = useGame();

    const toggleMockMode = () => {
        const newValue = !isMockMode;
        setIsMockMode(newValue);
        localStorage.setItem('nexus_mock_mode', newValue);
    };

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

                    {/* Mock Mode Toggle */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Mock LLM Mode</span>
                        <button
                            onClick={toggleMockMode}
                            className={`text-2xl transition-colors ${isMockMode ? 'text-green-400' : 'text-gray-600'}`}
                        >
                            {isMockMode ? <ToggleRight /> : <ToggleLeft />}
                        </button>
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
                            onClick={() => {
                                setLastOutcome('SUCCESS');
                                setTimeout(() => setLastOutcome(null), 1000);
                            }}
                            className="flex flex-col items-center justify-center gap-1 p-2 bg-green-900/30 hover:bg-green-900/50 text-green-400 rounded-lg border border-green-900/50 transition-colors"
                        >
                            <Check size={16} />
                            <span className="text-[10px]">Success</span>
                        </button>
                        <button
                            onClick={() => {
                                setLastOutcome('FAILURE');
                                setTimeout(() => setLastOutcome(null), 1000);
                            }}
                            className="flex flex-col items-center justify-center gap-1 p-2 bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 rounded-lg border border-rose-900/50 transition-colors"
                        >
                            <XCircle size={16} />
                            <span className="text-[10px]">Failure</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
