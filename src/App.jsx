import React, { useState, useEffect, useRef } from 'react';
import { useGameEngineV2 } from './hooks/useGameEngineV2';
import {
    Menu,
    X,
    Zap,
    Shield,
    Activity,
    ChevronRight,
    Send,
    User,
    MoreHorizontal,
    AlertTriangle,
    Download,
    Upload
} from 'lucide-react';

export default function App() {
    // Default open
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Use the new V2 Engine
    const {
        stats,
        inventory,
        quest,
        history,
        isProcessing,
        handleAction,
        genre,
        lastOutcome, // SUCCESS, FAILURE, or null
        gameOver,
        resetGame,
        setGenre,
        quitGame,
        exportSave,
        importSave
    } = useGameEngineV2();

    // Initialize gameStarted based on history (persistence check)
    const [gameStarted, setGameStarted] = useState(() => history.length > 0);
    const [inputValue, setInputValue] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, isProcessing]);

    const handleSend = () => {
        if (inputValue.trim()) {
            handleAction(inputValue);
            setInputValue("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    // --- SAVE / LOAD HANDLERS ---
    const handleSaveGame = async () => {
        const data = exportSave();
        const jsonString = JSON.stringify(data, null, 2);
        const fileName = `nexus_save_${new Date().toISOString().slice(0, 10)}.json`;

        try {
            // Try File System Access API (Modern Browsers)
            if ('showSaveFilePicker' in window) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'Nexus RPG Save File',
                        accept: { 'application/json': ['.json'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(jsonString);
                await writable.close();
            } else {
                // Fallback for browsers that don't support the API
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            // Ignore abort errors (user cancelled)
            if (err.name !== 'AbortError') {
                console.error('Failed to save game:', err);
                alert('Failed to save game. See console for details.');
            }
        } finally {
            setIsMenuOpen(false);
        }
    };

    const handleLoadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                const success = importSave(data);
                if (success) {
                    setGameStarted(true);
                    setIsMenuOpen(false);
                } else {
                    alert("Failed to load save file: Invalid format.");
                }
            } catch (err) {
                console.error("Failed to parse save file", err);
                alert("Error reading save file.");
            }
        };
        reader.readAsText(file);
        // Reset input so same file can be selected again if needed
        e.target.value = null;
    };

    // Determine feedback styles
    let feedbackClass = "";
    if (lastOutcome === 'SUCCESS') feedbackClass = "ring-4 ring-emerald-500/50 bg-emerald-500/20";
    if (lastOutcome === 'FAILURE') feedbackClass = "ring-4 ring-red-500/50 bg-red-500/20 animate-shake";

    return (
        <div
            data-theme={genre}
            className={`flex h-screen bg-theme-main text-theme-text font-sans selection:bg-theme-accent/30 selection:text-theme-accent transition-all duration-300 ${feedbackClass}`}
        >
            {/* Hidden File Input for Loading */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
            />

            {!gameStarted ? (
                <GenreSelection onSelect={(g) => {
                    resetGame(g);
                    setGameStarted(true);
                }} />
            ) : (
                <>
                    {/* --- GAME OVER OVERLAY --- */}
                    {gameOver && (
                        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-1000">
                            <div className="max-w-md w-full bg-theme-panel border border-red-500/50 rounded-2xl p-8 text-center shadow-2xl shadow-red-900/20 relative overflow-hidden">
                                {/* Background Pulse */}
                                <div className="absolute inset-0 bg-red-500/5 animate-pulse" />

                                <div className="relative z-10 flex flex-col items-center gap-6">
                                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2 animate-bounce">
                                        <AlertTriangle size={40} />
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold text-white tracking-widest uppercase">Signal Lost</h2>
                                        <p className="text-red-400 font-mono text-sm">Vital signs critical. Connection terminated.</p>
                                    </div>

                                    <div className="w-full h-px bg-red-500/20" />

                                    <button
                                        onClick={() => resetGame(genre)}
                                        className="group relative px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 w-full"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            <Zap size={18} />
                                            Reboot System
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- MOBILE OVERLAY --- */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    {/* --- SIDEBAR (Clean & Structured) --- */}
                    <aside className={`
                        fixed lg:static inset-y-0 left-0 z-50
                        bg-theme-panel border-r border-theme-border
                        transform transition-all duration-300 ease-in-out
                        ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-none lg:overflow-hidden'}
                        flex flex-col
                    `}>

                        {/* Header Sidebar */}
                        <div className="h-16 flex items-center px-6 border-b border-theme-border justify-between min-w-[18rem]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-theme-accent rounded-lg flex items-center justify-center text-white font-bold">
                                    N
                                </div>
                                <span className="font-semibold text-theme-text tracking-tight">Nexus RPG</span>
                            </div>
                            {/* Close button for mobile */}
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="lg:hidden text-theme-muted hover:text-theme-text"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Sidebar */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 min-w-[18rem]">

                            {/* Profile Section */}
                            <div className="flex items-center gap-4 p-3 bg-black/20 rounded-xl border border-theme-border">
                                <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-theme-muted">
                                    <User size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-theme-text">Operative 7</div>
                                    <div className="text-xs text-theme-accent flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-pulse" />
                                        Online
                                    </div>
                                </div>
                            </div>

                            {/* Stats - Dynamic */}
                            <div>
                                <h3 className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-4">Status</h3>
                                <div className="space-y-4">
                                    {Object.entries(stats).map(([key, value]) => {
                                        // Dynamic Config based on Stat Name
                                        let icon = <Activity size={14} />;
                                        let color = "bg-theme-accent";
                                        let label = key.charAt(0).toUpperCase() + key.slice(1);

                                        if (key === 'health') { icon = <Activity size={14} />; color = "bg-emerald-500"; }
                                        if (key === 'energy') { icon = <Zap size={14} />; color = "bg-amber-500"; }
                                        if (key === 'shield') { icon = <Shield size={14} />; color = "bg-blue-500"; }
                                        if (key === 'sanity') { icon = <div className="text-xs">🧠</div>; color = "bg-purple-500"; }
                                        if (key === 'stamina') { icon = <div className="text-xs">⚡</div>; color = "bg-yellow-500"; }
                                        if (key === 'mood') { icon = <div className="text-xs">❤️</div>; color = "bg-pink-500"; }
                                        if (key === 'charm') { icon = <div className="text-xs">✨</div>; color = "bg-rose-400"; }

                                        return (
                                            <StatItem key={key} icon={icon} label={label} value={value} color={color} />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Inventory - Dynamic & Clickable */}
                            <div>
                                <h3 className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-4">Inventory</h3>
                                <div className="space-y-2">
                                    {inventory.map((item, idx) => (
                                        <InventoryItem
                                            key={idx}
                                            label={item.name}
                                            count={item.count}
                                            tags={item.tags}
                                            icon={item.icon}
                                            value={item.value}
                                            max_value={item.max_value}
                                            onClick={() => handleAction(`inspect:${item.name}`)}
                                        />
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Footer Sidebar */}
                        <div className="p-4 border-t border-theme-border text-xs text-theme-muted text-center min-w-[18rem]">
                            v2.0.4 • System Stable
                        </div>
                    </aside>


                    {/* --- MAIN CONTENT --- */}
                    <main className="flex-1 flex flex-col min-w-0 bg-transparent relative transition-colors duration-500">

                        {/* Top Navigation Bar */}
                        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-theme-border bg-theme-main/80 backdrop-blur sticky top-0 z-30 transition-colors duration-500">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="p-2 -ml-2 text-theme-muted hover:text-theme-text rounded-lg hover:bg-theme-panel transition-colors"
                                >
                                    <Menu size={20} />
                                </button>
                                <div className="flex items-center text-sm text-theme-muted gap-2">
                                    <span>Mission</span>
                                    <ChevronRight size={14} />
                                    <span className="text-theme-text font-medium">{quest}</span>
                                </div>
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="text-theme-muted hover:text-theme-text p-2 rounded-lg hover:bg-theme-panel transition-colors"
                                >
                                    <MoreHorizontal size={20} />
                                </button>

                                {/* Dropdown Menu */}
                                {isMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-theme-panel border border-theme-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <div className="p-1">
                                                <button
                                                    onClick={handleSaveGame}
                                                    className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-main rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <Download size={14} />
                                                    Save Game
                                                </button>
                                                <button
                                                    onClick={handleLoadClick}
                                                    className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-main rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <Upload size={14} />
                                                    Load Game
                                                </button>
                                                <div className="h-px bg-theme-border my-1" />
                                                <button
                                                    onClick={() => {
                                                        resetGame(genre);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-main rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <Zap size={14} />
                                                    Restart Mission
                                                </button>
                                                <div className="h-px bg-theme-border my-1" />
                                                <button
                                                    onClick={() => {
                                                        quitGame();
                                                        setGameStarted(false);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <X size={14} />
                                                    Exit Simulation
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </header>

                        {/* Narrative Feed Area */}
                        <div className="flex-1 overflow-y-auto p-4 lg:p-0" ref={scrollRef}>
                            <div className="max-w-3xl mx-auto py-8 lg:py-12 space-y-8">

                                {history.map((msg) => {
                                    if (msg.role === 'system') {
                                        return (
                                            <div key={msg.id} className="flex justify-center">
                                                <span className="text-xs font-medium px-3 py-1 rounded-full bg-theme-panel text-theme-muted border border-theme-border">
                                                    {msg.content}
                                                </span>
                                            </div>
                                        );
                                    }

                                    if (msg.role === 'ai') {
                                        return (
                                            <div key={msg.id} className="group">
                                                <div className="pl-4 border-l-2 border-theme-accent/50 group-hover:border-theme-accent transition-colors">
                                                    <p className="text-lg leading-relaxed text-theme-text font-serif tracking-wide">
                                                        {msg.content}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (msg.role === 'user') {
                                        return (
                                            <div key={msg.id} className="flex flex-col items-end gap-2">
                                                <div className="bg-theme-panel text-theme-text px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm border border-theme-border">
                                                    <p className="text-sm">{msg.content}</p>
                                                </div>
                                                <span className="text-[10px] text-theme-muted mr-2">{msg.timestamp}</span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}

                                {isProcessing && (
                                    <div className="flex items-center gap-2 pl-4 py-2">
                                        <div className="w-2 h-2 bg-theme-accent rounded-full animate-typing delay-100" />
                                        <div className="w-2 h-2 bg-theme-accent rounded-full animate-typing delay-200" />
                                        <div className="w-2 h-2 bg-theme-accent rounded-full animate-typing delay-300" />
                                        <span className="text-xs text-theme-muted font-mono ml-2 animate-pulse">Nexus processing...</span>
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* Input Area - Floating & Clean */}
                        <div className="p-4 lg:p-6 pb-6 lg:pb-10">
                            <div className="max-w-3xl mx-auto relative">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Apa tindakanmu selanjutnya?"
                                    className="w-full bg-theme-panel text-theme-text placeholder:text-theme-muted pl-5 pr-14 py-4 rounded-xl border border-theme-border focus:border-theme-accent focus:ring-1 focus:ring-theme-accent focus:outline-none shadow-lg shadow-black/20 transition-all"
                                />
                                <button
                                    onClick={handleSend}
                                    className="absolute right-2 top-2 p-2 bg-theme-accent hover:opacity-90 text-white rounded-lg transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <div className="text-center mt-3">
                                <p className="text-[10px] text-theme-muted">Tekan Enter untuk mengirim • Tab untuk autocomplete</p>
                            </div>
                        </div>

                    </main>
                </>
            )}
        </div>
    );
}

// --- Sub-Components ---

function StatItem({ icon, label, value, color }) {
    return (
        <div className="group">
            <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2 text-theme-muted group-hover:text-theme-text transition-colors">
                    {icon}
                    <span className="text-xs font-medium">{label}</span>
                </div>
                <span className="text-xs font-mono text-theme-muted">{value}%</span>
            </div>
            <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

function InventoryItem({ label, count, tags, icon, value, max_value, onClick }) {
    return (
        <div
            onClick={onClick}
            className="flex flex-col p-2.5 rounded-lg hover:bg-black/20 transition-colors cursor-pointer group border border-transparent hover:border-theme-border"
        >
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{icon || '📦'}</span>
                    <span className="text-sm text-theme-muted group-hover:text-theme-text transition-colors">{label}</span>
                </div>
                <span className="text-xs font-mono bg-black/40 text-theme-muted px-2 py-0.5 rounded group-hover:bg-black/60 group-hover:text-theme-text transition-colors">x{count}</span>
            </div>

            {/* Durability Bar */}
            {value !== undefined && max_value !== undefined && (
                <div className="w-full h-1 bg-black/40 rounded-full mb-1.5 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${value < 30 ? 'bg-red-500' : 'bg-theme-accent'}`}
                        style={{ width: `${(value / max_value) * 100}%` }}
                    />
                </div>
            )}

            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {tags.map((tag, i) => (
                        <span key={i} className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-theme-accent/10 text-theme-accent border border-theme-accent/20">
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function GenreSelection({ onSelect }) {
    return (
        <div className="w-full h-full bg-white text-black flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
            <div className="max-w-4xl w-full space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">PROTOCOL OMEGA</h1>
                    <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">Select Simulation Parameters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GenreCard
                        title="SCI-FI"
                        desc="Cybernetics, Neon, Dystopia"
                        onClick={() => onSelect('scifi')}
                    />
                    <GenreCard
                        title="HORROR"
                        desc="Fear, Darkness, Survival"
                        onClick={() => onSelect('horror')}
                    />
                    <GenreCard
                        title="ROMANCE"
                        desc="Emotion, Drama, Connection"
                        onClick={() => onSelect('romance')}
                    />
                </div>

                <div className="text-center pt-12">
                    <p className="text-xs text-gray-400 font-mono">v2.1.0 • SYSTEM READY</p>
                </div>
            </div>
        </div>
    );
}

function GenreCard({ title, desc, onClick }) {
    return (
        <button
            onClick={onClick}
            className="group relative h-64 border border-gray-200 hover:border-black transition-all duration-500 bg-gray-50 hover:bg-white flex flex-col items-center justify-center gap-4 overflow-hidden"
        >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
            <h3 className="text-2xl font-bold tracking-tight group-hover:scale-110 transition-transform duration-500">{title}</h3>
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">{desc}</p>
        </button>
    );
}
