import React, { useState, useEffect, useMemo } from 'react';
import { HoloCard } from './HoloCard';
import { useGame } from '../../../../context/GameContext';
import { Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

export function HoloDeck({ choices, inventory, handleAction, allowCombo, isFocusingText }) {
    const [selectedCards, setSelectedCards] = useState([]);
    const [isMobileExpanded, setIsMobileExpanded] = useState(false); // Mobile Drawer State

    // Combine Choices and Inventory into a single "Hand"
    const hand = useMemo(() => {
        const actionCards = choices.map((c, i) => ({ ...c, id: `choice-${i}`, type: c.type || 'action' }));
        const itemCards = inventory.slice(0, 3).map((item, i) => ({
            id: `item-${i}`,
            label: item.name,
            action: `use ${item.name}`,
            type: 'item',
            description: `Use ${item.name}`,
            meta: { cost: 1 }
        }));
        return [...actionCards, ...itemCards];
    }, [choices, inventory]);

    // Auto-expand on new choices (Mobile)
    useEffect(() => {
        if (choices.length > 0) {
            setIsMobileExpanded(true);
        }
    }, [choices]);

    const handleCardSelect = (card) => {
        if (allowCombo) {
            if (selectedCards.find(c => c.id === card.id)) {
                setSelectedCards(prev => prev.filter(c => c.id !== card.id));
            } else {
                if (selectedCards.length < 2) {
                    setSelectedCards(prev => [...prev, card]);
                }
            }
        } else {
            handleAction(card.action);
            setIsMobileExpanded(false); // Close drawer after action
        }
    };

    const executeCombo = () => {
        if (selectedCards.length === 0) return;
        const comboAction = `COMBO: ${selectedCards.map(c => c.action).join(' + ')}`;
        handleAction(comboAction);
        setSelectedCards([]);
        setIsMobileExpanded(false);
    };

    if (hand.length === 0) return null;

    // Visibility Classes
    // Desktop: Fade out if focusing text
    // Mobile: Slide down if not expanded
    const desktopClass = isFocusingText ? 'md:opacity-10 md:translate-y-20 md:scale-95' : 'md:opacity-100 md:translate-y-0 md:scale-100';
    const mobileClass = isMobileExpanded ? 'translate-y-0' : 'translate-y-[85%] md:translate-y-0'; // Ensure it resets on desktop

    return (
        <div className={`
            w-full flex flex-col items-center justify-end pb-4 z-30 
            transition-all duration-500 ease-out
            ${desktopClass} ${mobileClass}
        `}>

            {/* Mobile Toggle Handle */}
            <div className="md:hidden w-full flex justify-center -mb-6 z-40 relative pointer-events-auto">
                <button
                    onClick={() => setIsMobileExpanded(!isMobileExpanded)}
                    className="bg-black/80 border border-cyan-500/50 text-cyan-400 rounded-t-xl px-6 py-1 flex items-center gap-2 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] backdrop-blur-md"
                >
                    {isMobileExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    <span className="text-xs font-bold tracking-widest">{isMobileExpanded ? 'HIDE DECK' : 'SHOW ACTIONS'}</span>
                </button>
            </div>

            {/* Combo Button */}
            {allowCombo && selectedCards.length > 0 && (
                <div className="mb-4 pointer-events-auto animate-in zoom-in duration-300">
                    <button
                        onClick={executeCombo}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-110 transition-transform flex items-center gap-2 border border-white/20"
                    >
                        <Sparkles size={20} className="animate-spin-slow" />
                        EXECUTE COMBO ({selectedCards.length})
                    </button>
                </div>
            )}

            {/* Cards Container */}
            <div className="w-full flex items-end justify-start md:justify-center overflow-x-auto md:overflow-visible px-4 md:px-0 pb-8 pt-10 pointer-events-auto no-scrollbar snap-x snap-mandatory">
                <div className="flex items-end space-x-4 md:space-x-0 mx-auto md:mx-0 min-w-min">
                    {hand.map((card, index) => (
                        <div key={card.id} className="snap-center">
                            <HoloCard
                                card={card}
                                index={index}
                                total={hand.length}
                                onSelect={handleCardSelect}
                                isSelected={false}
                                isComboMode={allowCombo}
                                isSelectedForCombo={selectedCards.some(c => c.id === card.id)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Scroll Hint */}
            {isMobileExpanded && (
                <div className="md:hidden text-[10px] text-white/30 animate-pulse mt-2">
                    &larr; SCROLL TO VIEW CARDS &rarr;
                </div>
            )}
        </div>
    );
}
