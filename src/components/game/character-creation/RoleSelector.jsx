import React from 'react';
import { Briefcase } from 'lucide-react';

export function RoleSelector({ uiText, setupData, selectedRoleIndex, setSelectedRoleIndex, includeItems, setIncludeItems }) {
    return (
        <div className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-4">
                <label className="block text-xs font-bold text-theme-accent tracking-widest uppercase">{uiText.UI.CHARACTER_CREATION.LABEL_ROLE}</label>
                <div className="grid grid-cols-1 gap-3">
                    {setupData.roles.map((role, idx) => (
                        <button
                            key={role.id}
                            onClick={() => setSelectedRoleIndex(idx)}
                            className={`relative p-4 rounded-xl border-2 text-left transition-all duration-300 group overflow-hidden ${selectedRoleIndex === idx
                                ? 'border-theme-accent bg-theme-accent/10 shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]'
                                : 'border-theme-border bg-theme-panel hover:border-theme-muted'
                                }`}
                        >
                            <div className="flex justify-between items-center relative z-10">
                                <div>
                                    <div className={`font-bold text-lg ${selectedRoleIndex === idx ? 'text-theme-accent' : 'text-gray-300'}`}>
                                        {role.name}
                                    </div>
                                    <div className="text-xs text-theme-muted mt-1 line-clamp-1">
                                        {role.description}
                                    </div>
                                </div>
                                {selectedRoleIndex === idx && <div className="w-3 h-3 bg-theme-accent rounded-full shadow-[0_0_10px_currentColor]"></div>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Loadout Toggle */}
            <div className="bg-theme-panel border border-theme-border rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Briefcase className="text-theme-accent" size={20} />
                    <div>
                        <div className="font-bold text-sm">{uiText.UI.CHARACTER_CREATION.LOADOUT_TITLE}</div>
                        <div className="text-xs text-theme-muted">{uiText.UI.CHARACTER_CREATION.LOADOUT_DESC}</div>
                    </div>
                </div>
                <button
                    onClick={() => setIncludeItems(!includeItems)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${includeItems ? 'bg-theme-accent' : 'bg-gray-700'}`}
                >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${includeItems ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>
        </div>
    );
}
