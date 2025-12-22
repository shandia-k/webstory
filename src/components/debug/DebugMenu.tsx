import React, { useState, useEffect } from 'react';
import { Bug, X, Terminal, Cpu, RefreshCw, Trash2, ChevronDown } from 'lucide-react';
import { ITEM_DB } from '../../game-mechanics/ItemRegistry';
import { Wallet, Pal, Item } from '../../types/game';

interface DebugLog {
    id: string;
    timestamp: string;
    type: string;
    prompt?: string;
    model?: string;
    data: any;
}

interface DebugMenuProps {
    isOpen: boolean;
    onClose: () => void;
    wallet: Wallet;
    onUpdateWallet: (w: Wallet) => void;
    palData: Pal | null;
    onUpdatePal: (p: Pal) => void;
    inventory: Item[];
    onUpdateInventory: (i: Item[]) => void;
}

export function DebugMenu({ isOpen, onClose, wallet, onUpdateWallet, palData, onUpdatePal, inventory, onUpdateInventory }: DebugMenuProps) {
    const [activeTab, setActiveTab] = useState<'logs' | 'console'>('logs');
    const [logs, setLogs] = useState<DebugLog[]>([]);
    const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

    // Load logs
    const refreshLogs = () => {
        try {
            const savedLogs: DebugLog[] = JSON.parse(localStorage.getItem('nexus_debug_history') || '[]');
            setLogs(savedLogs);
            if (!selectedLogId && savedLogs.length > 0) {
                setSelectedLogId(savedLogs[0].id);
            }
        } catch (e) {
            console.error("Failed to load logs", e);
        }
    };

    useEffect(() => {
        if (isOpen) refreshLogs();
    }, [isOpen]);

    const clearLogs = () => {
        localStorage.removeItem('nexus_debug_history');
        setLogs([]);
        setSelectedLogId(null);
    };

    const selectedLog = logs.find(l => l.id === selectedLogId);

    // --- CHEATS ---
    const addGold = (amount: number) => onUpdateWallet({ ...wallet, gold: wallet.gold + amount });
    const addGems = (amount: number) => onUpdateWallet({ ...wallet, gems: wallet.gems + amount });

    const setLevel = (lvl: number) => {
        if (!palData) return;
        const stats = palData.role?.stats || {}; // @ts-ignore
        onUpdatePal({
            ...palData,
            role: {
                ...palData.role,
                stats: { ...stats, level: lvl, xp: 0, maxHp: 100 + (lvl * 10) }
            }
        });
    };

    const addItem = (key: string) => { // @ts-ignore
        const item = Object.values(ITEM_DB).find(i => i.name === key || i.id === key);
        if (item) {
            onUpdateInventory([...inventory, { name: item.name, icon: item.icon, desc: item.desc }]);
        }
    };
    const clearInventory = () => onUpdateInventory([]);

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            {/* FULLSCREEN OVERLAY */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex flex-col p-4 md:p-8 animate-in fade-in duration-200 text-xs md:text-sm">

                    {/* TOP BAR */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
                        <div className="flex items-center gap-4">
                            <Terminal size={32} className="text-green-500" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-100 tracking-tight font-mono">NEURAL DEBUGGER</h1>
                                <p className="text-xs text-gray-500 font-mono">Live Inspection of LLM Traffic</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={refreshLogs}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                title="Refresh Logs"
                            >
                                <RefreshCw size={20} />
                            </button>
                            <button
                                onClick={clearLogs}
                                className="p-2 text-red-900 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Clear History"
                            >
                                <Trash2 size={20} />
                            </button>
                            <div className="w-px h-8 bg-gray-800 mx-2"></div>

                            <button
                                onClick={onClose}
                                className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>


                    {/* TABS */}
                    <div className="flex border-b border-gray-800 mb-4">
                        <button onClick={() => setActiveTab('logs')} className={`px-6 py-3 font-mono font-bold hover:bg-gray-900 transition-colors ${activeTab === 'logs' ? 'text-green-400 border-b-2 border-green-500 bg-green-900/10' : 'text-gray-500'}`}>
                            NETWORK LOGS
                        </button>
                        <button onClick={() => setActiveTab('console')} className={`px-6 py-3 font-mono font-bold hover:bg-gray-900 transition-colors ${activeTab === 'console' ? 'text-green-400 border-b-2 border-green-500 bg-green-900/10' : 'text-gray-500'}`}>
                            GAME CONSOLE
                        </button>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="flex-1 min-h-0 relative">

                        {/* --- TAB: LOGS --- */}
                        {activeTab === 'logs' && (
                            <div className="flex flex-col md:flex-row gap-6 h-full">

                                {/* LEFT: LOG LIST & PROMPT */}
                                <div className="flex-[2] flex flex-col gap-4 min-h-0 border-r border-gray-800/50 pr-4">
                                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest font-mono flex items-center gap-2">
                                        <ChevronDown size={14} /> Traffic History
                                    </h2>

                                    {/* List of Logs */}
                                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {logs.map(log => (
                                            <div
                                                key={log.id}
                                                onClick={() => setSelectedLogId(log.id)}
                                                className={`p-3 rounded-lg border cursor-pointer font-mono text-sm transition-all duration-200 ${selectedLogId === log.id
                                                    ? 'bg-green-900/20 border-green-500/50 text-gray-100'
                                                    : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className={`font-bold text-xs px-2 py-0.5 rounded ${log.type === 'GAME_RESPONSE' ? 'bg-blue-900/50 text-blue-400' :
                                                        log.type === 'CHAR_SETUP' ? 'bg-purple-900/50 text-purple-400' :
                                                            log.type.includes('ERROR') ? 'bg-red-900/50 text-red-400' :
                                                                'bg-gray-800 text-gray-500'
                                                        }`}>
                                                        {log.type}
                                                    </span>
                                                    <span className="text-xs opacity-50">{log.timestamp}</span>
                                                </div>
                                                {/* Preview of prompt (first 60 chars) */}
                                                <div className="text-xs opacity-60 truncate">
                                                    {log.prompt ? log.prompt.replace(/\s+/g, ' ').substring(0, 60) + '...' : 'No Prompt Recorded'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Model Version View (Bottom Left) */}
                                    <div className="h-1/3 bg-gray-900 rounded-xl p-4 overflow-hidden flex flex-col border border-gray-800">
                                        <h3 className="text-xs text-gray-500 font-bold mb-2 uppercase flex items-center gap-2">
                                            <Terminal size={12} /> Model Version
                                        </h3>
                                        <div className="flex-1 flex items-center justify-center bg-black/30 rounded-lg">
                                            <span className="text-xl md:text-2xl font-mono text-green-400 font-bold tracking-widest">
                                                {selectedLog?.model || "UNKNOWN"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT: AI RESPONSE */}
                                <div className="flex-[3] flex flex-col min-h-0 bg-gray-900/30 rounded-xl border border-gray-800 p-4 md:p-6 overflow-hidden">
                                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest font-mono flex items-center gap-2 mb-4">
                                        <Cpu size={14} /> AI Response Data
                                    </h2>
                                    <div className="flex-1 overflow-auto custom-scrollbar bg-black/20 rounded-xl p-4 border border-gray-800/50">
                                        {selectedLog ? (
                                            <pre className="text-xs md:text-sm text-green-400 font-mono whitespace-pre-wrap">
                                                {JSON.stringify(selectedLog.data, null, 2)}
                                            </pre>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-gray-600 font-mono text-sm">
                                                Select a log entry...
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        )}

                        {/* --- TAB: CONSOLE --- */}
                        {activeTab === 'console' && (
                            <div className="h-full overflow-y-auto space-y-6 max-w-4xl mx-auto p-4 custom-scrollbar">
                                {/* ECONOMY CARD */}
                                <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex gap-2 items-center"><Terminal size={16} /> ECONOMY OVERRIDE</h3>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">GOLD_BALANCE</div>
                                            <div className="text-3xl font-mono text-yellow-400 mb-3">{wallet.gold}</div>
                                            <div className="flex gap-2">
                                                <button onClick={() => addGold(100)} className="bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-200 border border-yellow-700/50 px-3 py-1 rounded text-xs">+100</button>
                                                <button onClick={() => addGold(1000)} className="bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-200 border border-yellow-700/50 px-3 py-1 rounded text-xs">+1K</button>
                                                <button onClick={() => addGold(-100)} className="bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-800/50 px-3 py-1 rounded text-xs">-100</button>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">GEM_BALANCE</div>
                                            <div className="text-3xl font-mono text-purple-400 mb-3">{wallet.gems}</div>
                                            <div className="flex gap-2">
                                                <button onClick={() => addGems(10)} className="bg-purple-900/30 hover:bg-purple-900/50 text-purple-200 border border-purple-700/50 px-3 py-1 rounded text-xs">+10</button>
                                                <button onClick={() => addGems(100)} className="bg-purple-900/30 hover:bg-purple-900/50 text-purple-200 border border-purple-700/50 px-3 py-1 rounded text-xs">+100</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* STATS CARD */}
                                {palData && (
                                    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex gap-2 items-center"><Cpu size={16} /> ENTITY STATE</h3>
                                        <div className="flex gap-4 mb-6">
                                            <button onClick={() => setLevel(1)} className="flex-1 bg-gray-800 hover:bg-blue-900/50 border border-gray-700 text-gray-300 py-3 rounded-lg text-xs font-mono">FORCE LV 1</button>
                                            <button onClick={() => setLevel(5)} className="flex-1 bg-gray-800 hover:bg-blue-900/50 border border-gray-700 text-gray-300 py-3 rounded-lg text-xs font-mono">FORCE LV 5</button>
                                            <button onClick={() => setLevel(9)} className="flex-1 bg-gray-800 hover:bg-blue-900/50 border border-gray-700 text-gray-300 py-3 rounded-lg text-xs font-mono">FORCE LV 9</button>
                                            <button onClick={() => setLevel(10)} className="flex-1 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 hover:from-yellow-900 hover:to-orange-900 border border-yellow-700 text-yellow-200 py-3 rounded-lg text-xs font-mono font-bold animate-pulse">FORCE LV 10 (EVO)</button>
                                        </div>
                                        <div className="bg-black/50 p-4 rounded text-gray-500 font-mono text-xs overflow-x-auto">
                                            {JSON.stringify(palData.role?.stats, null, 2)}
                                        </div>
                                    </div>
                                )}

                                {/* INVENTORY CARD */}
                                <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex gap-2 items-center"><Trash2 size={16} /> INVENTORY OPS</h3>
                                    <div className="flex gap-2 flex-wrap mb-4">
                                        {/* @ts-ignore */}
                                        {Object.values(ITEM_DB).map((item: any) => (
                                            <button
                                                key={item.id}
                                                onClick={() => addItem(item.name)}
                                                className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded border border-gray-700 flex gap-2 items-center text-gray-300 hover:text-white transition-colors"
                                            >
                                                <span>{item.icon}</span> {item.name}
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={clearInventory} className="w-full py-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded flex gap-2 justify-center items-center transition-colors">
                                        <Trash2 size={16} /> WIPE INVENTORY
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CSS for custom scrollbar in this component scope */}
                    <style>{`
                        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                        .custom-scrollbar::-webkit-scrollbar-track { bg: rgba(0,0,0,0.2); }
                        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4B5563; }
                    `}</style>
                </div>
            )}
        </div>
    );
}
