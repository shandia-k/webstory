import React, { useState } from 'react';
import { Settings, Map } from 'lucide-react';
// @ts-ignore
import StatsDisplay from './hud/StatsDisplay';
// @ts-ignore
import ActionMenu from './hud/ActionMenu';
// @ts-ignore
import ChatOverlay from './ChatOverlay';
import { useGameStore } from '../../../store/useGameStore';

interface CuteInterfaceProps {
    // Props that are still passed by parent or needed for legacy reasons
    onExplore: (stats: any) => void;
    onOpenSettings: () => void;
    // Legacy props (can be ignored if we pull from store)
    palData?: any;
    wallet?: any;
<<<<<<< HEAD
    onUpdateStats?: (stats: any) => void;
}

const CuteInterface: React.FC<CuteInterfaceProps> = ({
    onExplore,
=======
    onUpdateStats?: (stats: any) => void;
}

const CuteInterface: React.FC<CuteInterfaceProps> = ({
    onExplore,
>>>>>>> origin/main
    onOpenSettings,
    // Ignored legacy props
}) => {
    // Use Store Directly
    const { player, updateStats, items } = useGameStore();

    // Mock UI Text for migration
<<<<<<< HEAD
    const uiText = {
        CUTE_UI: {
            STATS: "Stats",
            ACTIONS: "Actions",
            EXPLORE: "Explore",
            SETTINGS: "Settings"
        }
=======
    const uiText = {
        CUTE_UI: {
            STATS: "Stats",
            ACTIONS: "Actions",
            EXPLORE: "Explore",
            SETTINGS: "Settings"
        }
>>>>>>> origin/main
    };

    if (!player) return <div>Loading Player...</div>;

    const palData = {
        name: player.name,
        role: {
            stats: player.stats,
            trait: player.trait,
             // Mocks for legacy HUD compatibility
<<<<<<< HEAD
            element: 'Neutral',
=======
            element: 'Neutral',
>>>>>>> origin/main
            emoji: '🦸'
        }
    };

    return (
        <div className="w-full h-full p-4 md:p-8 flex flex-col md:flex-row gap-6 relative max-w-7xl mx-auto">

            {/* --- LEFT COLUMN: STATS --- */}
            <div className="md:w-1/3 flex flex-col gap-6 animate-in slide-in-from-left duration-500">
<<<<<<< HEAD

                {/* PROFILE CARD */}
                <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border-4 border-white flex flex-col items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent opacity-50 pointer-events-none"></div>

=======

                {/* PROFILE CARD */}
                <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border-4 border-white flex flex-col items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent opacity-50 pointer-events-none"></div>

>>>>>>> origin/main
                    {/* AVATAR */}
                    <div className="relative group cursor-pointer">
                        <div className="text-[100px] md:text-[120px] drop-shadow-2xl filter hover:scale-110 transition-transform duration-300 animate-bounce-slow">
                            {palData.role.emoji}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-yellow-300 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full shadow-lg rotate-12">
                            Lvl {palData.role.stats.level}
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-700 mt-4 text-center font-cute tracking-wide">
                        {palData.name}
                    </h2>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">
                        {player.trait} Hero
                    </p>

                    {/* STATS GRID */}
                    <StatsDisplay stats={palData.role.stats} uiText={uiText} />
                </div>
<<<<<<< HEAD

=======

>>>>>>> origin/main
                {/* WALLET (Mini) */}
                <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg border-2 border-white flex justify-between items-center text-gray-600 font-bold">
                    <div className="flex items-center gap-2">
                        <span className="text-yellow-500 text-xl">🪙</span>
                        <span>{player.wallet.gold}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-purple-500 text-xl">💎</span>
                        <span>{player.wallet.gems}</span>
                    </div>
                </div>

            </div>

            {/* --- MIDDLE COLUMN: CHAT / FEED --- */}
            <div className="flex-1 h-full min-h-0 animate-in fade-in zoom-in duration-500 delay-100 flex flex-col">
<<<<<<< HEAD
                 <ChatOverlay
=======
                 <ChatOverlay
>>>>>>> origin/main
                    palName={player.name}
                    genre={"Adventure"} // Mock
                    apiKey={""} // ChatOverlay needs legacy props or refactor. Keep generic for now.
                    language={"English"}
                 />
            </div>

            {/* --- RIGHT COLUMN: ACTIONS --- */}
            <div className="md:w-1/4 flex flex-col gap-4 animate-in slide-in-from-right duration-500 delay-200">
<<<<<<< HEAD

                {/* MAIN ACTIONS */}
                <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-4 shadow-xl border-4 border-white flex flex-col gap-3">
                     <button
=======

                {/* MAIN ACTIONS */}
                <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-4 shadow-xl border-4 border-white flex flex-col gap-3">
                     <button
>>>>>>> origin/main
                        onClick={() => onExplore(palData.role.stats)}
                        className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all hover:-translate-y-1 hover:shadow-blue-200 flex items-center justify-center gap-3 text-lg"
                    >
                        <Map size={24} />
                        {uiText.CUTE_UI.EXPLORE}
                    </button>

<<<<<<< HEAD
                    <ActionMenu
=======
                    <ActionMenu
>>>>>>> origin/main
                        onFeed={() => {
                            // Example Action using Store directly
                             updateStats({ hp: Math.min(player.stats.hp + 10, player.stats.maxHp) });
                        }}
                        onPlay={() => {
                             updateStats({ happiness: Math.min(player.stats.happiness + 10, 100) });
                        }}
                        onTrain={() => {
                             updateStats({ xp: player.stats.xp + 10 }); // Just add XP visual
                        }}
                        uiText={uiText}
                    />
                </div>

                 {/* SETTINGS BUTTON */}
<<<<<<< HEAD
                 <button
=======
                 <button
>>>>>>> origin/main
                    onClick={onOpenSettings}
                    className="mt-auto bg-white/50 hover:bg-white text-gray-500 hover:text-gray-700 p-3 rounded-full self-end transition-all"
                >
                    <Settings size={24} />
                </button>
            </div>

        </div>
    );
};

export default CuteInterface;
