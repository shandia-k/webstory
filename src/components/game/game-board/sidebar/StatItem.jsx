import React from 'react';

export function StatItem({ icon, label = "Stat", value = 0, color = "bg-gray-500" }) {
    return (
        <div className="group">
            <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2 text-theme-muted group-hover:text-theme-text transition-colors">
                    <div className={`p-1.5 rounded-md bg-theme-accent/10 text-theme-accent`}>
                        {icon}
                    </div>
                    <span className="text-xs font-medium text-theme-muted group-hover:text-theme-accent transition-colors">{label}</span>
                </div>
                <span className="text-xs font-bold text-theme-text">{value}%</span>
            </div>
            <div className="h-2 w-full bg-theme-panel border border-theme-border rounded-full overflow-hidden">
                <div
                    className={`h-full bg-theme-accent shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-all duration-500 ease-out`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}
