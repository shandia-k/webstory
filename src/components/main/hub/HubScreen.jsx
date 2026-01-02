import React from 'react';
import {
    User, Minimize, Maximize, Key, Settings, Play, Bookmark
} from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { WORLD_THEMES } from '../../../constants/worldThemes';
import FitText from '../../common/FitText';

import NewGameModal from './NewGameModal';

export const HubScreen = ({
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
    onOpenRigging
}) => {
    const { uiText } = useGame();
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
            <div className="relative w-full max-w-sm md:max-w-6xl bg-white/20 backdrop-blur-xl border-4 border-white/40 rounded-[2rem] md:rounded-[3rem] shadow-2xl p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 transition-all duration-500 h-full md:h-[90vh] max-h-[900px]">
                {/* --- LEFT (Desktop) / TOP (Mobile): VISUAL PREVIEW --- */}
                <div className="flex-[4] flex flex-col gap-4 min-h-0">

                    {/* Header (Profile & Settings) */}
                    <div className="flex justify-between items-center px-1 shrink-0">
                        {/* Fullscreen Button */}
                        <button
                            onClick={toggleFullscreen}
                            className="bg-white/30 p-2 md:p-3 rounded-full hover:bg-white/50 transition-colors active:scale-95 focus-visible:ring-2 focus-visible:ring-white/80 outline-none"
                            title="Toggle Fullscreen"
                            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                            aria-pressed={isFullscreen}
                        >
                            {isFullscreen ? (
                                <Minimize size={20} className="text-white md:w-6 md:h-6" />
                            ) : (
                                <Maximize size={20} className="text-white md:w-6 md:h-6" />
                            )}
                        </button>

                        <div className="flex items-center gap-2 bg-white/30 px-4 py-1.5 md:px-6 md:py-2 rounded-full">
                            <User size={16} className="md:w-5 md:h-5" />
                            <span className="text-sm md:text-base font-bold">
                                {palData ? palData.name : "Traveler"}
                            </span>
                            {palData && (
                                <span className="text-lg ml-1" title={palData.role?.element || "api"}>
                                    {palData.role?.element === 'air' ? '💧' : palData.role?.element === 'tumbuhan' ? '🌿' : '🔥'}
                                </span>
                            )}
                        </div>

                        <button
                            onClick={onOpenApi}
                            className="bg-white/30 p-2 md:p-3 rounded-full hover:bg-white/50 transition-colors active:scale-95 md:hidden focus-visible:ring-2 focus-visible:ring-white/80 outline-none"
                            title="API Configuration"
                            aria-label="Configure API Key"
                        >
                            <Key size={20} className="text-white md:w-6 md:h-6" />
                        </button>

                        <button
                            onClick={onOpenSaveLoad}
                            className="bg-white/30 p-2 md:p-3 rounded-full hover:bg-white/50 transition-colors active:scale-95 md:hidden focus-visible:ring-2 focus-visible:ring-white/80 outline-none"
                            aria-label="Open Save/Load Menu"
                        >
                            <Settings size={20} className="text-white md:w-6 md:h-6" />
                        </button>
                    </div>

                    {/* The Screen / Monitor */}
                    <div className="flex-1 bg-white/80 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-center shadow-inner flex flex-col items-center justify-center relative overflow-hidden group min-h-0">
                        {/* Mascot - Reduced size to prevent clipping */}
                        <div className="text-[100px] md:text-[160px] lg:text-[200px] mb-2 md:mb-4 animate-float drop-shadow-md transition-transform group-hover:scale-110 cursor-pointer select-none shrink-0 z-0">
                            {currentTheme.mascot}
                        </div>

                        {/* Title & Desc */}
                        <div className="relative z-10 bg-white/60 backdrop-blur-sm p-4 rounded-xl max-w-md shrink-0 -mt-4 md:-mt-8 shadow-sm border border-white/40">
                            <h2 className={`h-10 md:h-14 font-bold mb-2 transition-colors duration-300 text-gray-800 tracking-tight flex items-center justify-center`}>
                                <FitText maxFontSize={48} className="font-bold">{currentTheme.title}</FitText>
                            </h2>
                            <p className="text-sm md:text-lg text-gray-600 font-medium leading-relaxed">
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
                            className="bg-white/30 p-3 rounded-full hover:bg-white/50 transition-colors active:scale-95 focus-visible:ring-2 focus-visible:ring-white/80 outline-none"
                            title="Configure API"
                            aria-label="Configure API Key"
                        >
                            <Key size={24} className="text-white" />
                        </button>
                        {/* SAVE/LOAD MENU */}
                        <button
                            onClick={onOpenSaveLoad}
                            className="bg-white/30 p-3 rounded-full hover:bg-white/50 transition-colors active:scale-95 focus-visible:ring-2 focus-visible:ring-white/80 outline-none"
                            title="Save/Load Menu"
                            aria-label="Open Save/Load Menu"
                        >
                            <Settings size={24} className="text-white" />
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
                        <div
                            className="bg-black/10 p-2 md:p-3 rounded-3xl overflow-x-auto hide-scrollbar flex md:grid md:grid-cols-2 gap-3 md:gap-3 w-full snap-x snap-mandatory flex-1 min-h-0 md:overflow-y-auto content-start"
                            role="radiogroup"
                            aria-label="Select World"
                        >

                            {Object.entries(WORLD_THEMES).map(([key, data]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedWorld(key)}
                                    aria-checked={selectedWorld === key}
                                    role="radio"
                                    className={`
                                    group relative flex-none w-[140px] md:w-full p-3 rounded-2xl flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-2 md:gap-4 transition-all duration-200 snap-center min-h-[80px] h-full focus-visible:ring-2 focus-visible:ring-white/80 outline-none
                                    ${selectedWorld === key
                                            ? 'bg-white text-gray-800 shadow-xl ring-4 ring-white/50 z-10'
                                            : 'bg-white/10 hover:bg-white/20 text-white/90 hover:scale-[0.98]'}
                                `}
                                >
                                    <span className={`text-2xl md:text-3xl filter drop-shadow-sm shrink-0 transition-transform duration-300 ${selectedWorld === key ? 'scale-110' : 'group-hover:scale-110'}`}>
                                        {data.icon}
                                    </span>
                                    <div className="flex flex-col items-center md:items-start overflow-hidden min-w-0 w-full h-5 md:h-6">
                                        <FitText maxFontSize={16} className="md:items-start md:justify-start font-bold uppercase tracking-wide">
                                            {key.replace(/_/g, ' ')}
                                        </FitText>
                                    </div>

                                    {/* Active Indicator (Desktop) */}
                                    {selectedWorld === key && (
                                        <div className="hidden md:block absolute right-4 w-2 h-2 rounded-full bg-current animate-pulse" />
                                    )}
                                </button>
                            ))}

                        </div>
                    </div>

                    {/* TOOLS BUTTON (Mini) */}
                    <div className="flex justify-end mt-2 md:mt-4">
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
                                className="flex-1 py-4 md:py-6 rounded-2xl font-bold text-lg md:text-xl shadow-lg transform transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 bg-white text-gray-800 border-2 border-gray-100 hover:border-gray-300 animate-in slide-in-from-bottom-2 fade-in duration-500 overflow-hidden px-4"
                            >
                                <div className="bg-gray-100 p-1.5 rounded-full shrink-0"><Bookmark size={20} className="text-indigo-500" /></div>
                                <div className="flex-1 h-full max-w-[120px] md:max-w-none">
                                    <FitText compression={0.9} maxFontSize={20}>{uiText.HUB.BTN_RESUME}</FitText>
                                </div>
                            </button>
                        )}

                        {/* START BUTTON */}
                        <button
                            onClick={handleStartClick}
                            className={`
                            flex-[2] py-4 md:py-6 rounded-2xl font-bold text-xl md:text-2xl shadow-lg transform transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3
                            bg-gradient-to-r ${currentTheme.buttonGradient} text-white overflow-hidden px-4
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
