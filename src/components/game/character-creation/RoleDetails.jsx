import React from 'react';
import { Zap, Heart, Shield, ChevronRight } from 'lucide-react';

export function RoleDetails({ uiText, currentRole, includeItems, name, handleConfirm }) {
    return (
        <div className="bg-theme-panel border border-theme-border rounded-2xl p-6 md:p-8 flex flex-col animate-in slide-in-from-right-4 duration-700 delay-200 relative overflow-hidden">
            {/* Background Deco */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-theme-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{currentRole.name}</h2>
                <p className="text-theme-muted mb-6 leading-relaxed">{currentRole.description}</p>

                {/* Stats */}
                <div className="space-y-4 mb-8">
                    <h3 className="text-xs font-bold text-theme-accent tracking-widest uppercase border-b border-theme-border pb-2 mb-4">{uiText.UI.CHARACTER_CREATION.STATS_TITLE}</h3>

                    <div className="space-y-3">
                        {Object.entries(currentRole.stats).map(([key, value]) => {
                            // Determine color and icon based on stat name
                            let colorClass = "bg-gray-500";
                            let Icon = Zap;
                            if (key.toLowerCase().includes('health') || key.toLowerCase().includes('hp')) {
                                colorClass = "bg-red-500";
                                Icon = Heart;
                            } else if (key.toLowerCase().includes('energy') || key.toLowerCase().includes('mana') || key.toLowerCase().includes('stamina')) {
                                colorClass = "bg-yellow-500";
                                Icon = Zap;
                            } else if (key.toLowerCase().includes('shield') || key.toLowerCase().includes('armor')) {
                                colorClass = "bg-blue-500";
                                Icon = Shield;
                            }

                            return (
                                <div key={key} className="flex items-center gap-4">
                                    <Icon size={18} className={colorClass.replace('bg-', 'text-')} />
                                    <div className="w-24 text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</div>
                                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${colorClass}`}
                                            style={{ width: `${Math.min(100, (value / 150) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="w-8 text-right text-sm font-mono">{value}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Starting Items */}
                {includeItems && (
                    <div>
                        <h3 className="text-xs font-bold text-theme-accent tracking-widest uppercase border-b border-theme-border pb-2 mb-4">{uiText.UI.CHARACTER_CREATION.EQUIPMENT_TITLE}</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {currentRole.starting_items.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 bg-black/30 p-2 rounded-lg border border-white/5">
                                    <span className="text-xl">{item.icon}</span>
                                    <div>
                                        <div className="text-sm font-medium text-gray-200">{item.name}</div>
                                        <div className="text-xs text-theme-muted capitalize">{item.type} x{item.count}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Button */}
            <div className="mt-8 pt-6 border-t border-theme-border">
                <button
                    onClick={handleConfirm}
                    disabled={!name.trim()}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${name.trim()
                        ? 'bg-theme-accent hover:bg-theme-accent/90 text-white shadow-lg hover:shadow-theme-accent/25 transform hover:-translate-y-1'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    <span>{uiText.UI.CHARACTER_CREATION.BTN_INITIATE}</span>
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
