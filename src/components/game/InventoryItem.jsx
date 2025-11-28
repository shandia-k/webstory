import React from 'react';

export function InventoryItem({ label, count, tags, icon, value, max_value, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left p-2.5 rounded-lg bg-theme-panel border border-theme-border hover:border-theme-accent/50 hover:bg-theme-main transition-all group relative overflow-hidden"
        >
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="text-lg group-hover:scale-110 transition-transform">{icon}</div>
                    <div>
                        <div className="text-xs font-medium text-theme-text group-hover:text-theme-accent transition-colors">
                            {label}
                        </div>
                        <div className="flex gap-1 mt-0.5">
                            {tags.map((tag, i) => (
                                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-theme-border text-theme-muted uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                {count > 1 && (
                    <span className="text-xs font-bold bg-theme-accent text-white px-2 py-0.5 rounded-full">
                        x{count}
                    </span>
                )}
            </div>

            {/* Durability Bar (Liquid Stats) */}
            {typeof value === 'number' && typeof max_value === 'number' && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-theme-border/50">
                    <div
                        className={`h-full transition-all duration-500 ${(value / max_value) < 0.3 ? 'bg-red-500' : 'bg-theme-accent'
                            }`}
                        style={{ width: `${(value / max_value) * 100}%` }}
                    />
                </div>
            )}
        </button>
    );
}
