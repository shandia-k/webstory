import React, { useMemo, useState } from 'react';
import { TextArea } from './TextArea';
import { ActionCard } from './ActionCard';
import { Box, Heart, Zap, Shield } from 'lucide-react';

export function InputArea({
    inputValue,
    setInputValue,
    handleSend,
    choices = [],
    inventory = [],
    handleAction,
    disabled
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Helper to get icon for item
    const getItemIcon = (itemName) => {
        const lower = itemName.toLowerCase();
        if (lower.includes('medkit') || lower.includes('heal')) return <Heart size={14} className="text-emerald-400" />;
        if (lower.includes('grenade') || lower.includes('bomb')) return <Box size={14} className="text-red-400" />;
        if (lower.includes('shield') || lower.includes('armor')) return <Shield size={14} className="text-blue-400" />;
        if (lower.includes('energy') || lower.includes('battery')) return <Zap size={14} className="text-yellow-400" />;
        return <Box size={14} className="text-slate-400" />;
    };

    const cards = useMemo(() => {
        return choices.map((c, i) => {
            // Heuristic: Check if choice label/action mentions an inventory item
            const matchingItem = inventory.find(item =>
                c.label.toLowerCase().includes(item.name.toLowerCase()) ||
                (c.action && c.action.toLowerCase().includes(item.name.toLowerCase()))
            );

            return {
                ...c,
                id: c.id || `choice-${i}`,
                type: c.type || 'action',
                itemCost: matchingItem ? {
                    name: matchingItem.name,
                    icon: getItemIcon(matchingItem.name)
                } : null
            };
        });
    }, [choices, inventory]);

    return (
        <div className="w-full bg-theme-panel/90 backdrop-blur-md border-t border-theme-border z-30 transition-all duration-300">
            {/* Background Grid (Optional, from snippet) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />

            {/* Container: Flexbox Deck */}
            <div className={`
                max-w-7xl mx-auto flex items-center justify-center
                transition-all duration-500 ease-in-out
                ${isExpanded ? 'gap-0' : 'gap-2 md:gap-4'}
                h-32 md:h-48 /* Ultra compact height (approx 1/5 screen) */
                p-4
            `}>

                {/* 1. Input / Text Area (The "Manual" Card) */}
                <div className={`
                    relative h-full rounded-xl md:rounded-2xl overflow-hidden min-w-0
                    flex flex-col transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                    ${isExpanded
                        ? 'flex-[100] w-full cursor-default'
                        : 'flex-1 max-w-[100px] md:max-w-[140px] cursor-pointer hover:-translate-y-2 hover:shadow-xl'
                    }
                `}>
                    <TextArea
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                        handleSend={handleSend}
                        disabled={disabled}
                        isExpanded={isExpanded}
                        setIsExpanded={setIsExpanded}
                        className="w-full h-full"
                    />
                </div>

                {/* 2. Action Cards */}
                {cards.map((card, index) => (
                    <div
                        key={card.id}
                        className={`
                            relative h-full rounded-xl md:rounded-2xl overflow-hidden min-w-0
                            flex flex-col transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                            ${isExpanded
                                ? 'flex-[0] w-0 opacity-0 pointer-events-none p-0 m-0 border-0'
                                : 'flex-1 max-w-[100px] md:max-w-[140px] cursor-pointer hover:-translate-y-2 hover:shadow-xl'
                            }
                        `}
                    >
                        <ActionCard
                            card={card}
                            onClick={() => handleAction(card.action)}
                            disabled={disabled}
                            className="w-full h-full"
                        />
                    </div>
                ))}

                {/* Empty State / Spacer */}
                {!isExpanded && cards.length === 0 && (
                    <div className="flex-1 flex items-center justify-center h-full text-theme-muted text-xs italic border-2 border-dashed border-theme-border rounded-xl bg-theme-panel/50">
                        No Actions
                    </div>
                )}
            </div>

        </div>
    );
}
