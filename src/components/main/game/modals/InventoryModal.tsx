import React from 'react';
import { Package, X, Trash2, Zap } from 'lucide-react';
import { ITEM_DB } from '../../../../game-mechanics/ItemRegistry';
import { Item, Pal } from '../../../../types/game';

interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: Item[];
    onUpdateInventory: (newInv: Item[]) => void;
    palData: Pal;
    onUpdatePal: (newPal: Pal) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
    isOpen, onClose, inventory, onUpdateInventory, palData, onUpdatePal
}) => {

    // Helper to find full item data
    const getDbItem = (name: string) => Object.values(ITEM_DB).find(i => i.name === name);

    const handleUseItem = (item: Item, index: number) => {
        const dbItem = getDbItem(item.name);
        if (!dbItem || !dbItem.effect) return;

        // Apply Effect
        const newPal = { ...palData };
        // Ensure stats exist
        if (!newPal.role) newPal.role = {};
        if (!newPal.role.stats) newPal.role.stats = { hp: 100, maxHp: 100, energy: 100, hunger: 50 };
        const stats = newPal.role.stats;

        // Logic
        if (dbItem.effect.type === 'HEAL_HP') {
            stats.hp = Math.min(stats.maxHp || 100, (stats.hp || 0) + dbItem.effect.value);
        } else if (dbItem.effect.type === 'HEAL_ENERGY') {
            stats.energy = Math.min(100, (stats.energy || 0) + dbItem.effect.value);
        } else if (dbItem.effect.type === 'HEAL_HUNGER') {
            stats.hunger = Math.min(100, (stats.hunger || 0) + dbItem.effect.value);
        }

        // Update Pal
        onUpdatePal(newPal);

        // Remove from Inventory
        const newInv = [...inventory];
        newInv.splice(index, 1);
        onUpdateInventory(newInv);
    };

    const handleTossItem = (index: number) => {
        if (confirm("Throw this away?")) {
            const newInv = [...inventory];
            newInv.splice(index, 1);
            onUpdateInventory(newInv);
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100 visible bg-black/50 backdrop-blur-sm' : 'opacity-0 invisible pointer-events-none'}`}>
            <div className={`bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative transform transition-all ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                        <Package size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Backpack</h2>
                        <p className="text-gray-500 text-sm">{inventory.length} Items</p>
                    </div>
                </div>

                {/* ITEMS LIST */}
                <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
                    {inventory.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            <p>Your bag is empty.</p>
                            <p className="text-xs">Visit the Shop to buy items!</p>
                        </div>
                    )}

                    {inventory.map((item, index) => {
                        const dbItem = getDbItem(item.name);
                        const isConsumable = dbItem?.type === 'CONSUMABLE';

                        return (
                            <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 group">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{item.icon}</span>
                                    <div>
                                        <div className="font-bold text-gray-800">{item.name}</div>
                                        <div className="text-xs text-gray-400">{item.desc}</div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {isConsumable && (
                                        <button
                                            onClick={() => handleUseItem(item, index)}
                                            className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors"
                                        >
                                            USE
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleTossItem(index)}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};
