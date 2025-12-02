import React from 'react';
import { useGame } from '../../../context/GameContext';
import { useRPGController } from '../../../features/rpg/hooks/useRPGController';
import { DungeonMap } from '../game-board/narrative-feed/DungeonMap';
import { NarrativeFeed } from '../game-board/narrative-feed/NarrativeFeed';
import { InputArea } from '../game-board/input-area/InputArea';
import { Sidebar } from '../game-board/sidebar/Sidebar';
import { Header } from '../game-board/header/Header';

export function RPGMode({ setGameStarted, isSidebarOpen, setIsSidebarOpen, isMenuOpen, setIsMenuOpen, initialData }) {
    const { initialCharacterData, gameOver } = useGame();

    // Initialize RPG Controller
    // Prefer initialData prop (direct from creation) over context (which might be slow to update)
    const rpgState = useRPGController(initialData || initialCharacterData);

    const handleSend = (action) => {
        rpgState.handleSend(action);
    };

    return (
        <>
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                stats={rpgState.combatState.playerStats}
                inventory={rpgState.inventory}
                handleAction={rpgState.handleAction}
                statDefinitions={initialData?.role?.stat_definitions}
            />

            <main className="flex-1 flex flex-col min-w-0 bg-transparent relative transition-colors duration-500 z-10">
                <Header
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                    quest={`RPG // ${rpgState.currentRoom?.name?.toUpperCase() || "UNKNOWN"}`}
                />

                <div className="flex-1 min-h-0 relative flex flex-col">
                    <div className="flex-1 min-h-0 flex relative">
                        {/* Col 1: Tactical Map (Left, 2/3) */}
                        <div className="w-2/3 relative border-r border-theme-border bg-theme-panel/50 backdrop-blur-sm">
                            <DungeonMap
                                rooms={rpgState.useRealAI ? rpgState.roomRegistry : rpgState.gameData.rooms}
                                currentRoomId={rpgState.currentRoomId}
                                visitedIds={rpgState.useRealAI ? rpgState.visitedIds : new Set([rpgState.currentRoomId])}
                            />
                        </div>

                        {/* Col 2: Feed (Right, 1/3) */}
                        <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
                            <NarrativeFeed
                                history={rpgState.feed}
                                isProcessing={rpgState.isProcessing}
                                uiText={{ UI: { FEED: { TYPING: "Dungeon Master thinking..." } } }}
                            />
                        </div>
                    </div>
                </div>

                <InputArea
                    inputValue={rpgState.inputValue}
                    setInputValue={rpgState.setInputValue}
                    handleSend={handleSend}
                    choices={rpgState.choices}
                    inventory={rpgState.inventory}
                    handleAction={rpgState.handleAction}
                    disabled={gameOver}
                />
            </main>
        </>
    );
}
