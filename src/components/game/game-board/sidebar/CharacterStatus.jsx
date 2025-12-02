import React from 'react';
import { Activity, Zap, Shield } from 'lucide-react';
import { StatItem } from './StatItem';

export function CharacterStatus({ stats, statDefinitions, uiText }) {

    // Helper to render a single stat bar
    const renderStatBar = (key, value, def, isCompact = false) => {
        // Default / Fallback Logic
        let colorClass = "bg-gray-500";
        let iconDisplay = <Activity size={14} />;
        let description = "";

        if (def) {
            // Use AI Definition
            if (def.color === 'red') colorClass = "bg-red-500";
            else if (def.color === 'blue') colorClass = "bg-blue-500";
            else if (def.color === 'green') colorClass = "bg-emerald-500";
            else if (def.color === 'yellow') colorClass = "bg-yellow-500";
            else if (def.color === 'purple') colorClass = "bg-purple-500";
            else colorClass = "bg-theme-accent"; // Default theme color

            iconDisplay = <span className="text-sm leading-none">{def.icon}</span>;
            description = def.description;
        } else {
            // Legacy Hardcoded Logic
            if (key.toLowerCase().includes('health') || key.toLowerCase().includes('hp')) {
                colorClass = "bg-emerald-500";
                iconDisplay = <Activity size={14} />;
            } else if (key.toLowerCase().includes('energy') || key.toLowerCase().includes('mana') || key.toLowerCase().includes('stamina')) {
                colorClass = "bg-amber-500";
                iconDisplay = <Zap size={14} />;
            } else if (key.toLowerCase().includes('shield') || key.toLowerCase().includes('armor')) {
                colorClass = "bg-blue-500";
                iconDisplay = <Shield size={14} />;
            }
        }

        return (
            <StatItem
                key={key}
                icon={iconDisplay}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={value}
                color={colorClass}
                isCompact={isCompact}
            />
        );
    };

    return (
        <div>
            <h3 className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-4">{uiText.UI.SIDEBAR.SECTION_STATUS}</h3>

            {/* VITALS SECTION */}
            <div className="space-y-2 mb-4">
                {stats && Object.entries(stats)
                    .filter(([key]) => statDefinitions?.[key]?.category === 'vital' || !statDefinitions?.[key]) // Default to vital
                    .map(([key, value]) => renderStatBar(key, value, statDefinitions?.[key]))}
            </div>

            {/* SKILLS SECTION */}
            {stats && Object.entries(stats).some(([key]) => statDefinitions?.[key]?.category === 'skill') && (
                <div>
                    <div className="h-px bg-theme-border/50 my-3"></div>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(stats)
                            .filter(([key]) => statDefinitions?.[key]?.category === 'skill')
                            .map(([key, value]) => renderStatBar(key, value, statDefinitions?.[key], true))}
                    </div>
                </div>
            )}
        </div>
    );
}
