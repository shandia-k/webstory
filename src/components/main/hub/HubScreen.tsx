import React from 'react';
import {
    User, Minimize, Maximize, Key, Settings, Play, Bookmark
} from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { AssetButton } from '../../../context/AssetContext';
import { WORLD_THEMES } from '../../../constants/worldThemes';
import FitText from '../../common/FitText';

import NewGameModal from './NewGameModal';
import { Pal } from '../../../types/game';

interface HubScreenProps {
    selectedWorld: string;
    setSelectedWorld: (world: string) => void;
    hasSavedGame: boolean;
    onNewGame: () => void;
    onResumeGame: () => void;
    onOpenApi: () => void;
    onOpenSaveLoad: () => void;
    isFullscreen: boolean;
    toggleFullscreen: () => void;
    palData: Pal | null;
    onOpenRigging: () => void;
}

export const HubScreen: React.FC<HubScreenProps> = ({
    selectedWorld,
    setSelectedWorld,
    hasSavedGame,
    onNewGame,
    onResumeGame,
    onOpenApi,
    onOpenSaveLoad,
    isFullscreen,
    toggleFullscreen,
    palData,
    onOpenRigging,
}) => {
    const { uiText } = useGame();
    // @ts-ignore
    const currentTheme = WORLD_THEMES[selectedWorld];
    const [showNewGameModal, setShowNewGameModal] = React.useState(false);

    const handleStartClick = () => {
        if (hasSavedGame) {
            setShowNewGameModal(true);
        } else {
            onNewGame();
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
            <div className="relative w-full max-w-sm md:max-w-6xl paper-card bg-theme-panel p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 transition-all duration-500 h-full md:h-[90vh] max-h-[900px]">
                {/* Decorative Tape */}
                <div className="tape-top" />
                {/* --- LEFT (Desktop) / TOP (Mobile): VISUAL PREVIEW --- */}
                <div className="flex-[3] md:flex-[4] flex flex-col gap-4 min-h-0">

                    {/* Header (Profile & Settings) */}
                    <div className="flex justify-between items-center px-1 shrink-0">
                        {/* Fullscreen Button */}
                        <button
                            onClick={toggleFullscreen}
                            className="bg-theme-main/50 p-2 md:p-3 rounded-xl border border-theme-border shadow-paper hover:bg-theme-main transition-all active:translate-y-0.5 active:shadow-none"
                            title="Toggle Fullscreen"
                        >
                            {isFullscreen ? (
                                <Minimize size={20} className="text-theme-text md:w-6 md:h-6" />
                            ) : (
                                <Maximize size={20} className="text-theme-text md:w-6 md:h-6" />
                            )}
                        </button>

                        <div className="flex items-center gap-2 bg-theme-main/50 px-4 py-1.5 md:px-6 md:py-2 rounded-xl border border-theme-border shadow-paper">
                            <User size={16} className="md:w-5 md:h-5 text-theme-accent" />
                            <span className="text-sm md:text-base font-bold text-theme-text">
                                {palData ? palData.name : "Traveler"}
                            </span>
                            {palData && (
                                <span className="text-lg ml-1" title={palData.role?.element || "api"}>
                                    {palData.role?.element === 'air' ? '💧' : palData.role?.element === 'tumbuhan' ? '🌿' : '🔥'}
                                </span>
                            )}
                        </div>

                        {/* MISSION LOG BUTTON */}


                        <button
                            onClick={onOpenApi}
                            className="bg-theme-main/50 p-3 rounded-xl border border-theme-border shadow-paper hover:bg-theme-main transition-all active:translate-y-0.5 active:shadow-none md:hidden"
                            title="API Configuration"
                        >
                            <Key size={20} className="text-theme-text" />
                        </button>

                        <button
                            onClick={onOpenSaveLoad}
                            className="bg-theme-main/50 p-3 rounded-xl border border-theme-border shadow-paper hover:bg-theme-main transition-all active:translate-y-0.5 active:shadow-none md:hidden"
                        >
                            <Settings size={20} className="text-theme-text" />
                        </button>
                    </div>

                    {/* The Screen / Monitor */}
                    <div className="flex-1 bg-theme-main border-2 border-theme-border rounded-[2rem] md:rounded-[2.5rem] pt-8 p-2 md:p-8 text-center shadow-inner flex flex-col items-center justify-center relative overflow-hidden group min-h-0">
                        {/* Mascot */}
                        <div className="text-[70px] md:text-[160px] lg:text-[200px] mb-2 md:mb-4 animate-float-paper drop-shadow-md transition-transform group-hover:scale-110 cursor-pointer select-none shrink-0 z-0">
                            {currentTheme.mascot}
                        </div>

                        {/* Title & Desc */}
                        <div className="relative z-10 paper-card bg-theme-panel px-3 py-1.5 md:p-4 w-[85%] md:w-auto max-w-md shrink md:shrink-0 -mt-6 md:-mt-8 shadow-paper border-2 border-theme-border mb-1 md:mb-0">
                            <h2 className={`w-full min-h-[2.25rem] md:min-h-[4rem] px-1 font-bold mb-0.5 md:mb-2 transition-colors duration-300 text-theme-text tracking-tight flex items-center justify-center overflow-hidden`}>
                                <FitText maxFontSize={42} minFontSize={16} className="font-bold pb-0.5 w-full text-center uppercase">{currentTheme.title}</FitText>
                            </h2>
                            <p className="text-[10px] md:text-lg text-theme-muted font-medium leading-tight px-1 pb-1">
                                {currentTheme.desc}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT (Desktop) / BOTTOM (Mobile): CONTROLS --- */}
                <div className="flex-[3] flex flex-col min-h-0 relative">

                    {/* Settings Button (Desktop - Absolute Top Right) */}
                    <div className="hidden md:flex absolute top-0 right-0 gap-2 z-20">
                        {/* API KEY BUTTON */}
                        <button
                            onClick={onOpenApi}
                            className="bg-theme-main/50 p-3 rounded-xl border border-theme-border shadow-paper hover:bg-theme-main transition-all active:translate-y-0.5 active:shadow-none"
                            title="Configure API"
                        >
                            <Key size={24} className="text-theme-text" />
                        </button>
                        {/* SAVE/LOAD MENU */}
                        <button
                            onClick={onOpenSaveLoad}
                            className="bg-theme-main/50 p-3 rounded-xl border border-theme-border shadow-paper hover:bg-theme-main transition-all active:translate-y-0.5 active:shadow-none"
                            title="Save/Load Menu"
                        >
                            <Settings size={24} className="text-theme-text" />
                        </button>
                    </div>

                    {/* Intro Text (Desktop Only) */}
                    <div className="hidden md:block text-left space-y-2 mb-6 pt-4 shrink-0">
                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">{uiText.HUB.HEADER}</h1>
                    </div>

                    {/* CHANNEL SELECTOR (Scrollable) */}
                    <div className="flex flex-col gap-2 min-h-0 flex-1">
                        <p className="text-center md:text-left text-xs font-bold uppercase tracking-widest opacity-70 ml-1 shrink-0">{uiText.HUB.SELECT_WORLD}</p>

                        {/* Scroll Container */}
                        <div className="bg-black/10 p-2 md:p-3 rounded-3xl overflow-x-auto hide-scrollbar flex md:grid md:grid-cols-2 gap-3 md:gap-3 w-full snap-x snap-mandatory flex-1 min-h-0 md:overflow-y-auto content-start">

                            {Object.entries(WORLD_THEMES).map(([key, data]) => (
                                <AssetButton
                                    key={key}
                                    id={`theme_${key}`}
                                    onClick={() => setSelectedWorld(key)}
                                    className={`
                                    group relative flex-none w-[160px] md:w-full p-0 rounded-2xl flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-0 transition-all duration-200 snap-center min-h-[90px] h-full overflow-hidden
                                    ${selectedWorld === key
                                            ? 'scale-[1.02] ring-4 ring-theme-accent/20 z-10'
                                            : 'hover:scale-[0.98] opacity-80 hover:opacity-100'}
                                `}
                                >
                                    {/* FALLBACK CONTENT (If Image Not Found) */}
                                    <div className={`w-full h-full p-4 flex flex-col md:flex-row items-center gap-3 ${selectedWorld === key ? 'bg-theme-panel text-theme-text' : 'bg-theme-main/40 text-theme-muted'}`}>
                                        <span className={`text-2xl md:text-3xl filter drop-shadow-sm shrink-0 transition-transform duration-300 ${selectedWorld === key ? 'scale-110' : 'group-hover:scale-110'}`}>
                                            {data.icon}
                                        </span>
                                        <div className="flex flex-col items-center md:items-start overflow-hidden min-w-0 w-full h-5 md:h-6">
                                            <FitText maxFontSize={16} className="md:items-start md:justify-start font-bold uppercase tracking-wide">
                                                {key.replace(/_/g, ' ')}
                                            </FitText>
                                        </div>
                                    </div>

                                    {/* Active Indicator (Desktop) OVERLAY */}
                                    {selectedWorld === key && (
                                        <div className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-sm animate-pulse pointer-events-none" />
                                    )}
                                </AssetButton>
                            ))}

                        </div>
                    </div>

                    {/* TOOLS BUTTON (Mini) */}
                    <div className="hidden md:flex justify-end mt-4">
                        <button
                            onClick={onOpenRigging}
                            className="text-xs md:text-sm font-bold text-gray-400 hover:text-indigo-500 flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-white/50"
                        >
                            <Settings size={14} /> 2D Rigging Studio
                        </button>
                    </div>

                    {/* ACTION BUTTONS ROW */}
                    <div className="flex gap-3 md:gap-4 mt-4 md:mt-6 shrink-0">
                        {/* RESUME BUTTON */}
                        {hasSavedGame && (
                            <button
                                onClick={onResumeGame}
                                className="flex-1 py-4 md:py-6 rounded-2xl font-bold text-lg md:text-xl shadow-paper transform transition-all hover:translate-y-[-2px] hover:shadow-paper-hover active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 bg-theme-panel text-theme-text border-2 border-theme-border animate-in slide-in-from-bottom-2 fade-in duration-500 overflow-hidden px-4"
                            >
                                <div className="bg-theme-main p-1.5 rounded-full shrink-0"><Bookmark size={20} className="text-theme-accent" /></div>
                                <div className="flex-1 h-full max-w-[120px] md:max-w-none">
                                    <FitText compression={0.9} maxFontSize={20}>{uiText.HUB.BTN_RESUME}</FitText>
                                </div>
                            </button>
                        )}

                        {/* START BUTTON */}
                        <button
                            onClick={handleStartClick}
                            className={`
                            flex-[2] py-4 md:py-6 rounded-2xl font-bold text-xl md:text-2xl shadow-paper transform transition-all hover:translate-y-[-2px] hover:shadow-paper-hover active:translate-y-1 active:shadow-none flex items-center justify-center gap-3
                            bg-theme-accent text-white overflow-hidden px-4 border-2 border-white/20
                        `}>
                            <Play fill="currentColor" size={24} className="shrink-0" />
                            <div className="flex-1 h-full max-w-[150px] md:max-w-none">
                                <FitText compression={0.9} maxFontSize={24}>{uiText.HUB.BTN_START}</FitText>
                            </div>
                        </button>
                    </div>

                </div>
            </div>


            <NewGameModal
                isOpen={showNewGameModal}
                onClose={() => setShowNewGameModal(false)}
                onConfirm={() => {
                    setShowNewGameModal(false);
                    onNewGame();
                }}
                uiText={uiText}
            />
        </div >
    );
};

