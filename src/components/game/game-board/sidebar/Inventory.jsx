import React from 'react';
import { InventoryItem } from './InventoryItem';

export function Inventory({ inventory, handleAction, uiText }) {
    return (
        <div>
            <h3 className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-4">{uiText.UI.SIDEBAR.SECTION_INVENTORY}</h3>
            <div className="space-y-2">
                {inventory && inventory.map((item, idx) => (
                    <InventoryItem
                        key={idx}
                        label={item.name}
                        count={item.count}
                        tags={item.tags}
                        icon={item.icon}
                        value={item.value}
                        max_value={item.max_value}
                        onClick={() => handleAction(`inspect:${item.name}`)}
                    />
                ))}
            </div>
        </div>
    );
}
