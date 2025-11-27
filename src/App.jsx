import React, { useState, useEffect, useRef } from 'react';
import {
    Menu,
    X,
    Zap,
    Shield,
    Activity,
    Box,
    ChevronRight,
    Send,
    User,
    MoreHorizontal
} from 'lucide-react';

export default function App() {
    // Default open
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [text, setText] = useState("");
    const fullText = "Hujan neon membasahi jaket sintetikmu. Drone polisi berpatroli di atas, memindai setiap sudut lorong gelap ini.";
    const scrollRef = useRef(null);

    // Efek mengetik yang lebih halus
    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            setText(fullText.slice(0, index));
            index++;
            if (index > fullText.length) clearInterval(timer);
        }, 30);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">

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
        bg-zinc-900 border-r border-zinc-800
        transform transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-none lg:overflow-hidden'}
        flex flex-col
      `}>

                {/* Header Sidebar */}
                <div className="h-16 flex items-center px-6 border-b border-zinc-800 justify-between min-w-[18rem]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                            N
                        </div>
                        <span className="font-semibold text-zinc-100 tracking-tight">Nexus RPG</span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-zinc-500 hover:text-zinc-300"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Sidebar */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 min-w-[18rem]">

                    {/* Profile Section */}
                    <div className="flex items-center gap-4 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-400">
                            <User size={20} />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-zinc-100">Operative 7</div>
                            <div className="text-xs text-indigo-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                Online
                            </div>
                        </div>
                    </div>

                    {/* Stats - Minimalist Lines */}
                    <div>
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Status</h3>
                        <div className="space-y-4">
                            <StatItem icon={<Activity size={14} />} label="Health" value={80} color="bg-emerald-500" />
                            <StatItem icon={<Zap size={14} />} label="Energy" value={60} color="bg-amber-500" />
                            <StatItem icon={<Shield size={14} />} label="Shield" value={40} color="bg-indigo-500" />
                        </div>
                    </div>

                    {/* Inventory - Clean List */}
                    <div>
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Inventory</h3>
                        <div className="space-y-2">
                            <InventoryItem label="Plasma Cutter" count={1} />
                            <InventoryItem label="Stimpack" count={3} />
                            <InventoryItem label="Encrypted Datapad" count={1} />
                        </div>
                    </div>
                </div>

                {/* Footer Sidebar */}
                <div className="p-4 border-t border-zinc-800 text-xs text-zinc-600 text-center min-w-[18rem]">
                    v2.0.4 • System Stable
                </div>
            </aside>


            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col min-w-0 bg-zinc-950 relative">

                {/* Top Navigation Bar */}
                <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex items-center text-sm text-zinc-500 gap-2">
                            <span>Mission</span>
                            <ChevronRight size={14} />
                            <span className="text-zinc-200 font-medium">Neon Rain</span>
                        </div>
                    </div>

                    <button className="text-zinc-500 hover:text-zinc-300 p-2 rounded-lg hover:bg-zinc-900">
                        <MoreHorizontal size={20} />
                    </button>
                </header>

                {/* Narrative Feed Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-0" ref={scrollRef}>
                    <div className="max-w-3xl mx-auto py-8 lg:py-12 space-y-8">

                        {/* System Message - Clean Badge Style */}
                        <div className="flex justify-center">
                            <span className="text-xs font-medium px-3 py-1 rounded-full bg-zinc-900 text-zinc-500 border border-zinc-800">
                                System initialized • Sector 7
                            </span>
                        </div>

                        {/* Narrative Block */}
                        <div className="group">
                            <div className="pl-4 border-l-2 border-indigo-500/50 group-hover:border-indigo-500 transition-colors">
                                <p className="text-lg leading-relaxed text-zinc-100 font-serif tracking-wide">
                                    {text}
                                </p>
                            </div>
                        </div>

                        {/* Action/Response Block */}
                        <div className="flex flex-col items-end gap-2">
                            <div className="bg-zinc-800 text-zinc-200 px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
                                <p className="text-sm">Saya memeriksa [Stimpack]. Apa efek sampingnya?</p>
                            </div>
                            <span className="text-[10px] text-zinc-600 mr-2">10:42 AM</span>
                        </div>

                        {/* System Response - Card Style */}
                        <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800 flex gap-4 items-start">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <Box size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-zinc-200 mb-1">Stimpack Analysis</h4>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Injeksi adrenalin sintetik. Meningkatkan refleks sebesar 50% selama 30 detik.
                                    <br />
                                    <span className="text-amber-500/80 mt-1 block text-xs">⚠️ Peringatan: Menyebabkan kelelahan ringan setelah efek habis.</span>
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Input Area - Floating & Clean */}
                <div className="p-4 lg:p-6 pb-6 lg:pb-10">
                    <div className="max-w-3xl mx-auto relative">
                        <input
                            type="text"
                            placeholder="Apa tindakanmu selanjutnya?"
                            className="w-full bg-zinc-900 text-zinc-200 placeholder:text-zinc-600 pl-5 pr-14 py-4 rounded-xl border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none shadow-lg shadow-black/20 transition-all"
                        />
                        <button className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
                            <Send size={18} />
                        </button>
                    </div>
                    <div className="text-center mt-3">
                        <p className="text-[10px] text-zinc-600">Tekan Enter untuk mengirim • Tab untuk autocomplete</p>
                    </div>
                </div>

            </main>
        </div>
    );
}

// --- Sub-Components for Cleaner Code ---

function StatItem({ icon, label, value, color }) {
    return (
        <div className="group">
            <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    {icon}
                    <span className="text-xs font-medium">{label}</span>
                </div>
                <span className="text-xs font-mono text-zinc-500">{value}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

function InventoryItem({ label, count }) {
    return (
        <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer group border border-transparent hover:border-zinc-800">
            <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">{label}</span>
            <span className="text-xs font-mono bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded group-hover:bg-zinc-700 group-hover:text-zinc-300 transition-colors">x{count}</span>
        </div>
    );
}
