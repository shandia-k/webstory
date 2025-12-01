import React from 'react';
import { X, User } from 'lucide-react';
import { useGame } from '../../../../context/GameContext';
import { CharacterStatus } from './CharacterStatus';
import { Inventory } from './Inventory';

export function Sidebar({ isSidebarOpen, setIsSidebarOpen, stats: propStats, inventory: propInventory, playerName: propPlayerName, handleAction: propHandleAction }) {
    const gameContext = useGame();

    // Use props if available, otherwise fallback to context
    const stats = propStats || gameContext.stats;
    const inventory = propInventory || gameContext.inventory;
    const playerName = propPlayerName || gameContext.playerName;
    const handleAction = propHandleAction || gameContext.handleAction;
    const { uiText } = gameContext;
    return (
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
                    <div className="w-8 h-8 bg-theme-accent rounded-lg flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                        N
                    </div>
                    <span className="font-semibold text-theme-text tracking-tight text-lg">Nexus RPG</span>
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
                <div className="flex items-center gap-4 p-4 bg-theme-main/50 rounded-xl border border-theme-border/50">
                    <div className="w-10 h-10 rounded-full bg-theme-panel flex items-center justify-center text-theme-muted border border-theme-border">
                        <User size={20} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-theme-text">{playerName || "Operative 7"}</div>
                        <div className="text-xs text-theme-accent flex items-center gap-1.5 font-medium">
                            <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                            {uiText.UI.SIDEBAR.STATUS_ONLINE}
                        </div>
                    </div>
                </div>

                {/* Stats - Dynamic */}
                <CharacterStatus stats={stats} uiText={uiText} />

                {/* Inventory - Dynamic & Clickable */}
                <Inventory inventory={inventory} handleAction={handleAction} uiText={uiText} />

            </div>

            {/* Footer Sidebar */}
            <div className="p-4 border-t border-theme-border text-xs text-theme-muted text-center min-w-[18rem]">
                {uiText.FIXED.APP_VERSION}
            </div>
        </aside>
    );
}
