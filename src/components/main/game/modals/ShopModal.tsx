import React from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { SHOP_ITEMS, GameItem } from '../../../../game-mechanics/ItemRegistry';
import { Wallet, Item } from '../../../../types/game';

interface ShopModalProps {
    isOpen: boolean;
    onClose: () => void;
    wallet: Wallet;
    onUpdateWallet: (newWallet: Wallet) => void;
    inventory: Item[];
    onUpdateInventory: (newInv: Item[]) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
    isOpen, onClose, wallet, onUpdateWallet, inventory, onUpdateInventory
}) => {

    const handleBuy = (item: GameItem) => {
        if (wallet.gold >= item.price) {
            // Pay
            onUpdateWallet({ ...wallet, gold: wallet.gold - item.price });

            // Add to Inventory
            // We need to map GameItem to Item interface, or use GameItem in the future.
            // Current Item interface: { name, icon, desc }
            // GameItem has all that + id, type, effect.
            // Let's store the whole GameItem as Item (it's compatible-ish)

            // Actually, let's keep it simple and just push the object.
            // Ideally we check for duplicates/stacking but for now: separate entry per item.
            // Or better: Stack them?
            // "inventory" is Item[]. Let's just append.
            const newItem: any = { ...item };
            onUpdateInventory([...inventory, newItem]);
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
                    <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Item Shop</h2>
                        <p className="text-gray-500 text-sm">Spend your gold wisely!</p>
                    </div>
                </div>

                {/* GOLD DISPLAY */}
                <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-xl font-bold flex justify-between items-center mb-6 border border-yellow-100">
                    <span>Your Gold:</span>
                    <span>{wallet.gold} G</span>
                </div>

                {/* ITEMS GRID */}
                <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2">
                    {SHOP_ITEMS.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-gray-100 group">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">{item.icon}</span>
                                <div>
                                    <div className="font-bold text-gray-800">{item.name}</div>
                                    <div className="text-xs text-gray-400">{item.desc}</div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleBuy(item)}
                                disabled={wallet.gold < item.price}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${wallet.gold >= item.price
                                    ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm hover:shadow-indigo-200'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {item.price} G
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};
