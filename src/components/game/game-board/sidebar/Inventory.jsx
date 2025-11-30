import React from 'react';
import { InventoryItem } from './InventoryItem';

export function Inventory({ inventory, handleAction, uiText }) {
    const [selectedIndex, setSelectedIndex] = React.useState(null);

    const handleUse = (itemName) => {
        handleAction(`use ${itemName}`);
        setSelectedIndex(null);
    };

    return (
        <div>
            <h3 className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-4">{uiText.UI.SIDEBAR.SECTION_INVENTORY}</h3>
            <div className="grid grid-cols-4 gap-2 relative">
                {inventory && inventory.map((item, idx) => (
                    <InventoryItem
                        key={idx}
                        label={item.name}
                        count={item.count}
                        tags={item.tags}
                        icon={item.icon}
                        value={item.value}
                        max_value={item.max_value}
                        desc={item.desc || item.type} // Fallback description
                        isSelected={selectedIndex === idx}
                        onSelect={() => setSelectedIndex(idx)}
                        onClose={() => setSelectedIndex(null)}
                        onUse={() => handleUse(item.name)}
                    />
                ))}
            </div>
        </div>
    );
}
