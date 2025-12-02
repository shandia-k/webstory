import React from 'react';

export function StatItem({ icon, label = "Stat", value = 0, color = "bg-theme-accent", isCompact = false }) {
    return (
        <div className="group/stat relative">
            <div className={`flex items-center ${isCompact ? 'gap-2' : 'gap-4'}`}>
                {/* Icon */}
                <div className="w-6 flex justify-center text-theme-text">
                    {icon}
                </div>

                {/* Label */}
                <div className={`${isCompact ? 'w-20 text-xs' : 'w-24 text-sm'} font-medium text-theme-text capitalize truncate`}>
                    {label}
                </div>

                {/* Bar Track */}
                <div className="flex-1 h-2 bg-theme-panel border border-theme-border rounded-full overflow-hidden">
                    {/* Bar Fill */}
                    <div
                        className={`h-full rounded-full ${color} transition-all duration-500 ease-out`}
                        style={{ width: `${Math.min(100, value)}%` }}
                    />
                </div>

                {/* Value */}
                <div className="w-8 text-right text-sm font-mono text-theme-muted">{value}</div>
            </div>
        </div>
    );
}
