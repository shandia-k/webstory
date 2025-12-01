import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { InputArea } from '../game/game-board/input-area/InputArea';
import { Sidebar } from '../game/game-board/sidebar/Sidebar';
import { Header } from '../game/game-board/header/Header';
import { NarrativeFeed } from '../game/game-board/narrative-feed/NarrativeFeed';
import { BackgroundLayer } from '../game/game-board/BackgroundLayer';
import { ParticleLayer } from '../game/game-board/ParticleLayer';

// RPG Imports
import { DungeonMap } from '../../features/rpg/components/DungeonMap';
import { useRPGController } from '../../features/rpg/hooks/useRPGController.jsx';

export function TestPage({ onBack, useRealAI = false, initialData = null }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Initialize RPG Controller
    // We pass initialData to the hook if needed, or let it use defaults
    const rpgState = useRPGController(initialData);

    // Force Real AI mode in the hook if the prop is set
    // Note: The hook currently auto-detects based on apiKey, but we might want to enforce it from props.
    // For now, we'll assume the hook handles it or we can modify the hook later to accept an override.
    // Actually, looking at the hook, it uses `useGame().apiKey`. 
    // If `useRealAI` prop is passed here, it might be for the "MOCK AI" toggle in App.jsx.
    // The hook doesn't currently accept a `useRealAI` override, it derives it.
    // Let's rely on the hook's internal logic for now, or if we need to force it, we'd need to update the hook.
    // Wait, the hook has `const useRealAI = !!apiKey;`. 
    // The `TestPage` prop `useRealAI` comes from `App.jsx` state. 
    // If we want to respect the `App.jsx` toggle, we should probably pass it to the hook.
    // But the hook signature is `useRPGController(initialData)`.
    // Let's stick to the plan: use the hook. If the toggle doesn't work perfectly, we can refine the hook later.
    // However, `TestPage` logic previously used `useRealAI` prop. 
    // The hook exposes `useRealAI` as a return value.

    // Mapping RPG State to UI Props
    const stats = {
        health: rpgState.combatState.playerHp,
        maxHealth: 100,
        energy: 100,
        maxEnergy: 100,
        level: 1,
        xp: 0,
        maxXp: 100
    };

    return (
        <div className="flex h-screen bg-slate-950 relative overflow-hidden font-mono text-slate-200">
            <BackgroundLayer />
            <ParticleLayer />

            {/* Sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                stats={stats}
                inventory={rpgState.inventory}
                playerName={initialData?.name || "TEST_OPERATOR"}
                handleAction={rpgState.handleAction}
            />

            {/* Main Content Layout */}
            <div className="flex-1 flex min-w-0 relative z-10">

                {/* Right Column (Full Width of remaining space) */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-900/40 backdrop-blur-md">

                    {/* Row 1: Header */}
                    <Header
                        isSidebarOpen={isSidebarOpen}
                        setIsSidebarOpen={setIsSidebarOpen}
                        quest={`TEST_LAB // ${rpgState.currentRoom?.name?.toUpperCase() || "UNKNOWN"}`}
                        uiText={{ UI: { HEADER: { MISSION_LABEL: "CURRENT SIMULATION" } } }}
                        rightContent={
                            <button
                                onClick={onBack}
                                className="px-3 py-1 bg-red-900/30 border border-red-500/50 text-red-400 text-xs rounded hover:bg-red-900/60 transition-colors"
                            >
                                EXIT LAB
                            </button>
                        }
                    />

                    {/* Row 2: Map & Feed */}
                    <div className="flex-1 min-h-0 flex relative">

                        {/* Col 1: Tactical Map (Left, 2/3) */}
                        <div className="w-2/3 relative border-r border-slate-700/50 bg-slate-900/20 backdrop-blur-sm">
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
                                uiText={{ UI: { FEED: { TYPING: "Analyzing..." } } }}
                                suspenseOutcome={null}
                            />
                        </div>
                    </div>

                    {/* Row 3: Input Area */}
                    <InputArea
                        inputValue={rpgState.inputValue}
                        setInputValue={rpgState.setInputValue}
                        handleSend={rpgState.handleSend}
                        choices={rpgState.choices}
                        inventory={rpgState.inventory}
                        handleAction={rpgState.handleAction}
                        disabled={false}
                    />
                </div>
            </div>
        </div>
    );
}
