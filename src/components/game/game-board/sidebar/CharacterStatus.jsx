import React from 'react';
import { Activity, Zap, Shield } from 'lucide-react';
import { StatItem } from './StatItem';

export function CharacterStatus({ stats, uiText }) {
    return (
        <div>
            <h3 className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-4">{uiText.UI.SIDEBAR.SECTION_STATUS}</h3>
            <div className="space-y-4">
                {stats && Object.entries(stats).map(([key, value]) => {
                    // Dynamic Config based on Stat Name
                    let icon = <Activity size={14} />;
                    let color = "bg-theme-accent";
                    let label = key.charAt(0).toUpperCase() + key.slice(1);

                    // Map labels from constants
                    if (uiText.UI.STATS[key.toUpperCase()]) {
                        label = uiText.UI.STATS[key.toUpperCase()];
                    }

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
    );
}
