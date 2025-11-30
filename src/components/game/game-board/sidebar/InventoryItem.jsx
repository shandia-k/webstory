import { X } from 'lucide-react';

export function InventoryItem({
    label = "Unknown Item",
    count = 1,
    tags = [],
    icon = "📦",
    value,
    max_value,
    desc,
    isSelected,
    onSelect,
    onClose,
    onUse
}) {
    return (
        <div className="relative group">
            <button
                onClick={onSelect}
                className={`
                    relative w-full aspect-square flex items-center justify-center rounded-lg border transition-all
                    ${isSelected
                        ? 'bg-theme-panel border-theme-accent shadow-[0_0_15px_rgba(79,70,229,0.3)] scale-105 z-20'
                        : 'bg-theme-panel border-theme-border hover:border-theme-accent hover:bg-theme-accent/10'
                    }
                `}
            >
                {/* Icon */}
                <div className={`text-2xl transition-transform filter drop-shadow-md ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {icon}
                </div>

                {/* Count Badge */}
                {count > 1 && (
                    <div className="absolute -top-1 -right-1 bg-theme-accent text-theme-bg text-[9px] font-bold px-1.5 rounded-full shadow-sm border border-theme-bg">
                        {count}
                    </div>
                )}

                {/* Durability Bar (Mini) */}
                {typeof value === 'number' && typeof max_value === 'number' && (
                    <div className="absolute bottom-1 left-1 right-1 h-0.5 bg-theme-border/50 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${(value / max_value) < 0.3 ? 'bg-red-500' : 'bg-theme-accent'}`}
                            style={{ width: `${(value / max_value) * 100}%` }}
                        />
                    </div>
                )}
            </button>

            {/* Interactive Popover */}
            {isSelected && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 z-50">
                    <div className="text-center border-b border-gray-700 pb-2">
                        <p className="font-bold text-sm text-theme-text">{label}</p>
                        {desc && <p className="text-[10px] text-theme-muted mt-1">{desc}</p>}
                    </div>

                    <div className="flex flex-wrap gap-1 justify-center">
                        {tags.map((tag, i) => (
                            <span key={i} className="text-[9px] px-1 py-0.5 rounded bg-theme-border/50 text-theme-text uppercase tracking-wider">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex gap-2 mt-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onUse();
                            }}
                            className="flex-1 bg-theme-accent hover:bg-theme-accent/80 text-white text-xs font-bold py-1.5 rounded transition-colors"
                        >
                            USE
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="px-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Arrow Indicator */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-8 border-transparent border-t-gray-900"></div>
                </div>
            )}
        </div>
    );
}
