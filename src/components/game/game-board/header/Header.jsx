import React from 'react';
import { Menu, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useGame } from '../../../../context/GameContext';

export function Header({
    isSidebarOpen,
    setIsSidebarOpen,
    isMenuOpen,
    setIsMenuOpen
}) {
    const { quest, uiText } = useGame();

    return (
        <header className={`h-16 flex items-center justify-between px-4 lg:px-8 border-b border-theme-border bg-theme-main/80 backdrop-blur sticky top-0 transition-colors duration-500 z-30`}>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 -ml-2 text-theme-muted hover:text-theme-text rounded-lg hover:bg-theme-panel transition-colors"
                >
                    <Menu size={20} />
                </button>
                <div className="flex items-center text-sm text-theme-muted gap-2">
                    <span>{uiText.UI.HEADER.MISSION_LABEL}</span>
                    <ChevronRight size={14} />
                    <span className="text-theme-text font-medium">{quest}</span>
                </div>
            </div>

            <div className="relative">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`text-theme-muted hover:text-theme-text p-2 rounded-lg hover:bg-theme-panel transition-colors ${isMenuOpen ? 'bg-theme-panel text-theme-text' : ''}`}
                >
                    <MoreHorizontal size={20} />
                </button>
            </div>
        </header>
    );
}
