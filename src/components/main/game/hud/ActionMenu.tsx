import React from 'react';
import { Utensils, Zap, Moon, Compass } from 'lucide-react';

interface ActionMenuProps {
    onAction: (type: string, e: any) => void;
    onExplore: () => void;
    uiText: any;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ onAction, onExplore, uiText }) => {
    return (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl p-2 md:p-3 border border-white/60 shadow-lg flex flex-col gap-1 md:gap-2">

            {/* LABEL */}
            <div className="flex items-center justify-between px-2 md:px-2">
                <span className="text-[9px] md:text-[10px] font-bold text-gray-400 md:text-gray-500 uppercase tracking-widest md:tracking-[0.2em]">Care</span>
                <div className="h-0.5 md:h-1 w-8 md:w-12 bg-gray-300/50 rounded-full" />
            </div>

            {/* ACTION GRID (4 Cols) */}
            <div className="grid grid-cols-4 gap-2 md:gap-2">

                {/* FEED */}
                <button
                    onClick={(e) => onAction('feed', e)}
                    className="aspect-square bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-0.5 md:gap-1 shadow-sm border border-white hover:scale-105 active:scale-95 transition-all group lg:p-1"
                >
                    <div className="bg-white/80 p-1.5 md:p-2 rounded-full text-orange-500 group-hover:text-orange-600 transition-colors">
                        <Utensils size={16} className="md:size-[20px]" />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold text-orange-700/70">{uiText?.CUTE_UI?.ACTIONS?.FEED || "Feed"}</span>
                </button>

                {/* PLAY */}
                <button
                    onClick={(e) => onAction('play', e)}
                    className="aspect-square bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-0.5 md:gap-1 shadow-sm border border-white hover:scale-105 active:scale-95 transition-all group"
                >
                    <div className="bg-white/80 p-1.5 md:p-2 rounded-full text-blue-500 group-hover:text-blue-600 transition-colors">
                        <Zap size={16} className="md:size-[20px]" />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold text-blue-700/70">{uiText?.CUTE_UI?.ACTIONS?.PLAY || "Play"}</span>
                </button>

                {/* SLEEP */}
                <button
                    onClick={(e) => onAction('sleep', e)}
                    className="aspect-square bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-0.5 md:gap-1 shadow-sm border border-white hover:scale-105 active:scale-95 transition-all group"
                >
                    <div className="bg-white/80 p-1.5 md:p-2 rounded-full text-indigo-500 group-hover:text-indigo-600 transition-colors">
                        <Moon size={16} className="md:size-[20px]" />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold text-indigo-700/70">{uiText?.CUTE_UI?.ACTIONS?.SLEEP || "Sleep"}</span>
                </button>

                {/* EXPLORE (Replaces Pet) */}
                <button
                    onClick={onExplore}
                    className="aspect-square bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-0.5 md:gap-1 shadow-lg shadow-emerald-200/50 border border-white/50 hover:scale-[1.05] active:scale-95 transition-all group outline-none focus:ring-0"
                >
                    <div className="bg-white/20 backdrop-blur-sm p-1.5 md:p-2 rounded-full text-white group-hover:bg-white/30 transition-colors">
                        <Compass size={16} className="md:size-[20px]" />
                    </div>
                    <span className="text-[9px] md:text-[11px] font-bold text-white tracking-tight uppercase md:tracking-wide">{uiText?.CUTE_UI?.EXPLORE || "Explore"}</span>
                </button>

            </div>
        </div>
    );
};

export default ActionMenu;
