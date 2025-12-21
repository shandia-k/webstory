import React from 'react';
import { Play, Settings, Monitor, Power, Github } from 'lucide-react';
// @ts-ignore
import { WORLD_THEMES } from '../../../constants/worldThemes';

interface HubScreenProps {
    selectedWorld: string;
    setSelectedWorld: (world: string) => void;
    hasSavedGame: boolean;
    palData?: any;
    onNewGame: () => void;
    onResumeGame: () => void;
    onOpenApi: () => void;
    onOpenSaveLoad: () => void;
    isFullscreen: boolean;
    toggleFullscreen: () => void;
    onOpenRigging: () => void;
}

export const HubScreen: React.FC<HubScreenProps> = ({
    selectedWorld, setSelectedWorld, hasSavedGame, palData,
    onNewGame, onResumeGame, onOpenApi, onOpenSaveLoad,
    isFullscreen, toggleFullscreen, onOpenRigging
}) => {

    const currentTheme = (WORLD_THEMES as any)[selectedWorld] || (WORLD_THEMES as any)['scifi'];

    return (
        <div className="w-full h-full flex flex-col md:flex-row p-6 md:p-12 gap-8 items-center justify-center animate-in fade-in duration-700">

            {/* --- LEFT: TITLE & WORLD SELECTOR --- */}
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-6 z-10">

                {/* TITLE */}
                <div className="relative">
                    <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)] tracking-tight leading-none font-cute animate-float">
                        Where to <br/> Next?
                    </h1>
                    <div className="absolute -top-10 -right-10 text-yellow-300 animate-spin-slow opacity-80">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    </div>
                </div>

                {/* USER BADGE */}
                <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-white font-bold flex items-center gap-3 animate-in slide-in-from-left duration-700 delay-200">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span>{palData ? `Welcome back, ${palData.name}` : "Hello, Traveler"}</span>
                </div>

                {/* WORLD CARDS GRID */}
                <div className="grid grid-cols-2 gap-3 mt-4 w-full max-w-md animate-in slide-in-from-bottom duration-700 delay-300">
                    <div className="col-span-2 text-xs font-bold text-white/60 uppercase tracking-widest mb-1">
                        Pick a Universe!
                    </div>
                    {Object.entries(WORLD_THEMES).map(([key, theme]: [string, any]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedWorld(key)}
                            className={`
                                group relative p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 overflow-hidden
                                ${selectedWorld === key
                                    ? 'bg-white text-gray-800 border-white scale-105 shadow-xl'
                                    : 'bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/30'
                                }
                            `}
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">{theme.icon}</span>
                            <span className="font-bold text-sm tracking-wide">{theme.title}</span>

                            {/* Selected Indicator */}
                            {selectedWorld === key && (
                                <div className="absolute right-3 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- RIGHT: ACTION PANEL --- */}
            <div className="w-full md:w-96 flex flex-col gap-4 z-10 animate-in slide-in-from-right duration-700 delay-500">

                {/* MAIN ACTION CARD */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">

                    {/* START BUTTON */}
                    {hasSavedGame ? (
                         <button
                            onClick={onResumeGame}
                            className="w-full bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white text-xl font-black py-5 rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3 transition-all hover:-translate-y-1"
                        >
                            <Play fill="currentColor" /> CONTINUE
                        </button>
                    ) : (
                        <button
                            onClick={onNewGame}
                            className="w-full bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white text-xl font-black py-5 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3 transition-all hover:-translate-y-1"
                        >
                            <Play fill="currentColor" /> START ADVENTURE
                        </button>
                    )}

                    {/* SUB ACTIONS */}
                    <div className="grid grid-cols-2 gap-3">
                         <button
                            onClick={onOpenSaveLoad}
                            className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Settings size={18} /> Settings
                        </button>
                        <button
                             onClick={onOpenApi}
                             className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Monitor size={18} /> API Key
                        </button>
                    </div>

                    <button
                        onClick={onOpenRigging}
                        className="w-full text-xs text-white/40 hover:text-white/80 font-mono text-center py-2 transition-colors flex items-center justify-center gap-2"
                    >
                        <Settings size={12} /> 2D Rigging Studio
                    </button>
                </div>

                {/* FOOTER TOOLS */}
                <div className="flex justify-end gap-3 opacity-60">
                    <button onClick={toggleFullscreen} className="p-2 bg-black/20 rounded-full hover:bg-black/40 text-white transition-colors" title="Toggle Fullscreen">
                        {isFullscreen ? <Power size={20} /> : <Monitor size={20} />}
                    </button>
                    <a href="https://github.com/shandia-k" target="_blank" rel="noopener noreferrer" className="p-2 bg-black/20 rounded-full hover:bg-black/40 text-white transition-colors">
                        <Github size={20} />
                    </a>
                </div>

            </div>

        </div>
    );
};
