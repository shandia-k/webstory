import React from 'react';

export function StatItem({ icon, label = "Stat", value = 0, color = "bg-gray-500" }) {
    return (
        <div className="group">
            <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2 text-theme-muted group-hover:text-theme-text transition-colors">
                    <div className={`p-1 rounded-md ${color} bg-opacity-20 ${color.includes('-') ? `text-${color.split('-')[1]}-500` : 'text-white'}`}>
                        {icon}
                    </div>
                    <span className="text-xs font-medium">{label}</span>
                </div>
                <span className="text-xs font-bold text-theme-text">{value}%</span>
            </div>
            <div className="h-1.5 w-full bg-theme-border rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-500 ease-out`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}
