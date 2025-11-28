import React from 'react';
import { X, User, Activity, Zap, Shield } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { UI_TEXT } from '../../constants/strings';
import { StatItem } from '../game/StatItem';
import { InventoryItem } from '../game/InventoryItem';

export function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
    const { stats, inventory, handleAction } = useGame();
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
                    <div className="w-8 h-8 bg-theme-accent rounded-lg flex items-center justify-center text-white font-bold">
                        N
                    </div>
                    <span className="font-semibold text-theme-text tracking-tight">{UI_TEXT.FIXED.APP_TITLE}</span>
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
                        <div className="text-sm font-medium text-theme-text">{UI_TEXT.UI.SIDEBAR.PROFILE_NAME}</div>
                        <div className="text-xs text-theme-accent flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-pulse" />
                            {UI_TEXT.UI.SIDEBAR.STATUS_ONLINE}
                        </div>
                    </div>
                </div>

                {/* Stats - Dynamic */}
                <div>
                    <h3 className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-4">{UI_TEXT.UI.SIDEBAR.SECTION_STATUS}</h3>
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
                    <h3 className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-4">{UI_TEXT.UI.SIDEBAR.SECTION_INVENTORY}</h3>
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
                {UI_TEXT.FIXED.APP_VERSION}
            </div>
        </aside>
    );
}
