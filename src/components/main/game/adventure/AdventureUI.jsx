import React, { useMemo } from 'react';
import {
    Rocket, Star, Battery, Zap,
    Sword, Shield, Heart, Skull, Milestone,
    Flag, ArrowRight, CheckCircle
} from 'lucide-react';
import LoadingDisplay from './LoadingDisplay';
import StarBackground from './StarBackground';
import FormattedText from '../../../common/FormattedText';
import FitText from '../../../common/FitText';
import './AdventureUI.css';

const AdventureUI = React.memo(({
    isLoading,
    genre,
    activeEmoji,
    combatMode,
    bgGradient,
    showChapterTitle,
    chapter,
    sectorName,
    uiText,
    shake,
    enemy,
    loot,
    hp,
    maxHp,
    combatLog,
    playerTurn,
    currentScene,
    onCombatAction,
    onChoice,
    onReturn,
    playerElement
}) => {
    return (
        <div className={`w-full h-screen font-space text-white overflow-hidden relative flex flex-col items-center justify-center transition-all duration-1000 bg-gradient-to-b ${combatMode ? 'from-red-900 to-black' : bgGradient}`}>

            {/* FULLSCREEN LOADING OVERLAY */}
            {isLoading && <LoadingDisplay genre={genre} emoji={activeEmoji} />}

            {/* STARS BG */}
            <StarBackground />

            {/* CHAPTER TITLE OVERLAY */}
            {showChapterTitle && (
                <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                    <div className="text-yellow-400 text-6xl mb-4 animate-bounce"><Flag size={64} /></div>
                    <h1 className="text-4xl font-bold tracking-widest text-white mb-2">{uiText.ADVENTURE.CHAPTER} {chapter}</h1>
                    <p className="text-xl text-indigo-300 font-bold uppercase tracking-widest">{sectorName}</p>
                </div>
            )}

            {/* MAIN DEVICE FRAME (SPLIT VIEW OPTIMIZED) */}
            {!isLoading && (
                <div className={`relative z-10 w-full max-w-sm md:max-w-6xl md:h-[85vh] md:aspect-[16/9] h-[95vh] bg-white/10 backdrop-blur-xl border-4 border-white/30 rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all duration-300 ${shake ? 'animate-shake' : ''}`}>

                    {/* --- LEFT PANEL: VISUALS --- */}
                    <div className="flex-1 md:w-7/12 relative flex flex-col p-6 items-center justify-center border-b md:border-b-0 md:border-r border-white/10">

                        {/* Header Info (Top Left) */}
                        <div className="absolute top-6 left-6 flex gap-2 items-center">
                            <div className={`p-2 rounded-full ${combatMode ? 'bg-red-500 animate-pulse' : 'bg-indigo-500/50'}`}>
                                {combatMode ? <Sword size={20} /> : <Rocket size={20} />}
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-widest opacity-70">{combatMode ? uiText.COMBAT.HEADER : `${uiText.ADVENTURE.CHAPTER} ${chapter}`}</div>
                                <div className="text-sm font-bold">{sectorName}</div>
                            </div>
                        </div>

                        {/* Main Visual */}
                        <div className="flex-1 flex flex-col items-center justify-center w-full">
                            {(!currentScene) ? (
                                // ERROR / EMPTY STATE
                                <div className="text-center animate-shake">
                                    <div className="text-[120px] mb-4">⚠️</div>
                                    <div className="text-xl font-bold text-red-400">{uiText.ADVENTURE.CONNECTION_LOST}</div>
                                    <button
                                        onClick={() => onReturn({ hp, loot })}
                                        className="mt-4 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-xl font-bold"
                                    >
                                        {uiText.ADVENTURE.BTN_ABORT}
                                    </button>
                                </div>
                            ) : combatMode ? (
                                // COMBAT VISUAL
                                <div className="flex flex-col items-center animate-in zoom-in duration-300 transform scale-125">
                                    <div className={`text-[150px] md:text-[200px] mb-6 filter drop-shadow-2xl transition-transform ${playerTurn ? 'animate-float' : 'animate-shake scale-110'}`}>
                                        {enemy.emoji}
                                    </div>
                                </div>
                            ) : (
                                // STORY VISUAL
                                <div className="text-[150px] md:text-[220px] mb-8 animate-float drop-shadow-2xl filter hover:scale-110 transition-transform cursor-pointer">
                                    {currentScene?.visual || activeEmoji}
                                </div>
                            )}
                        </div>

                        {/* Quick Stats (Overlay) */}
                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                            <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10">
                                <span className="text-yellow-400 font-bold">{loot}</span> <Star size={14} className="text-yellow-400" />
                            </div>
                            {/* Player Element Badge */}
                            <div className="bg-black/30 backdrop-blur-md px-3 py-2 rounded-2xl flex items-center justify-center border border-white/10 text-xl" title="Your Element">
                                {playerElement === 'air' ? '💧' : playerElement === 'tumbuhan' ? '🌿' : '🔥'}
                            </div>
                            <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10">
                                <Battery size={14} className={hp < 30 ? "text-red-400" : "text-green-400"} />
                                <span className={hp < 30 ? "text-red-400 font-bold" : "text-green-400 font-bold"}>{hp}/{maxHp}</span>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT PANEL: CONTROLS & LOG --- */}
                    <div className="md:w-5/12 bg-black/20 p-6 flex flex-col gap-4">

                        {/* 1. Context / Log Area */}
                        <div className="flex-1 bg-black/20 rounded-3xl p-6 border border-white/5 overflow-y-auto">
                            {!isLoading && (
                                combatMode ? (
                                    <div className="flex flex-col h-full justify-center text-center">
                                        <h3 className="text-red-300 font-bold text-xl mb-2 flex items-center justify-center gap-2">
                                            {enemy.name}
                                            <span title={enemy.element || "api"}>
                                                {enemy.element === 'air' ? '💧' : enemy.element === 'tumbuhan' ? '🌿' : '🔥'}
                                            </span>
                                        </h3>
                                        {/* Enemy HP Bar */}
                                        <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden mb-6 border border-white/20">
                                            <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}></div>
                                        </div>
                                        <p className="text-lg leading-relaxed">{combatLog}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col h-full justify-center">
                                        {currentScene && (
                                            <div className="animate-slide-up">
                                                <p className={`font-bold leading-relaxed mb-4 ${currentScene.text.length < 50 ? 'text-3xl md:text-4xl' : currentScene.text.length < 120 ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'}`}>
                                                    <FormattedText text={currentScene.text} />
                                                </p>
                                                <div className="h-1 w-10 bg-white/30 rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                )
                            )}
                        </div>

                        {/* 2. Action Deck */}
                        <div className="min-h-[160px]">
                            {!isLoading && (
                                combatMode ? (
                                    <div className="grid grid-cols-2 gap-3 animate-slide-up h-full">
                                        <button
                                            onClick={() => onCombatAction('attack')}
                                            disabled={!playerTurn}
                                            className="bg-red-500 hover:bg-red-400 text-white p-4 rounded-3xl font-bold flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                        >
                                            <Sword size={32} />
                                            <div className="w-full h-8 flex items-center justify-center">
                                                <FitText maxFontSize={24}>{uiText.COMBAT.BTN_ATTACK}</FitText>
                                            </div>
                                        </button>
                                        <div className="flex flex-col gap-3">
                                            <button
                                                onClick={() => onCombatAction('heal')}
                                                disabled={!playerTurn}
                                                className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 px-2"
                                            >
                                                <Zap size={20} className="shrink-0" />
                                                <div className="flex-1 h-6 max-w-[100px]">
                                                    <FitText maxFontSize={16}>{uiText.COMBAT.BTN_HEAL}</FitText>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => onCombatAction('flee')}
                                                disabled={!playerTurn}
                                                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 px-2"
                                            >
                                                <Milestone size={20} className="shrink-0" />
                                                <div className="flex-1 h-6 max-w-[100px]">
                                                    <FitText maxFontSize={16}>{uiText.COMBAT.BTN_FLEE}</FitText>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3 animate-slide-up">
                                        {currentScene?.choices.map((choice, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => onChoice(choice)}
                                                className={`w-full p-5 rounded-2xl flex items-center justify-between group transition-all active:scale-95 border hover:-translate-y-1 ${choice.isCombat ? 'bg-red-500/80 border-red-400 text-white animate-pulse' : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'}`}
                                            >
                                                <span className="font-bold text-lg flex items-center gap-3 flex-1 min-w-0 mr-4">
                                                    {choice.isCombat && <Skull size={20} className="shrink-0" />}
                                                    {choice.isEnd && <CheckCircle size={20} className="shrink-0" />}
                                                    {choice.isReturn && <Rocket size={20} className="shrink-0" />}
                                                    <div className="w-full h-8 flex items-center justify-start min-w-0">
                                                        <FitText maxFontSize={18} className="justify-start" transformOrigin="left center">{choice.label}</FitText>
                                                    </div>
                                                </span>
                                                <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/40 shrink-0"><ArrowRight size={20} /></div>
                                            </button>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>

                    </div>

                </div>
            )}
        </div>
    );
});

export default AdventureUI;
