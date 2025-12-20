import React, { useState, useEffect } from 'react';
import { Bug, X, Terminal, Cpu, RefreshCw, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { useGame } from '../../context/GameContext';

export function DebugMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState([]);
    const [selectedLogId, setSelectedLogId] = useState(null);

    // Load logs
    const refreshLogs = () => {
        try {
            const savedLogs = JSON.parse(localStorage.getItem('nexus_debug_history') || '[]');
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

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-black/80 hover:bg-black text-green-400 p-3 rounded-full shadow-2xl border border-green-900/50 backdrop-blur-sm transition-all hover:scale-110 active:scale-95 group"
                    title="Debug AI"
                >
                    <Bug size={24} className="group-hover:rotate-12 transition-transform" />
                </button>
            )}

            {/* FULLSCREEN OVERLAY */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col p-4 md:p-8 animate-in fade-in duration-200">

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
                                onClick={() => setIsOpen(false)}
                                className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* MAIN SPLIT VIEW */}
                    <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">

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
