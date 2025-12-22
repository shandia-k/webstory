import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ShoppingBag, Package, Bookmark, Settings, ChevronRight } from 'lucide-react';

interface MainMenuProps {
    onOpenInventory: () => void;
    onOpenShop: () => void;
    onOpenLog: () => void;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onOpenInventory, onOpenShop, onOpenLog, isOpen, onToggle, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleItemClick = (action: () => void) => {
        action();
        onClose();
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={onToggle}
                className={`p-3 rounded-full transition-all shadow-sm active:scale-95 ${isOpen ? 'bg-indigo-500 text-white rotate-90' : 'bg-white text-gray-500 hover:text-indigo-500'}`}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50 p-2 flex flex-col gap-1">

                    <button
                        onClick={() => handleItemClick(onOpenInventory)}
                        className="flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-xl text-gray-600 hover:text-indigo-600 transition-colors text-left group"
                    >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-200">
                            <Package size={16} />
                        </div>
                        <span className="font-bold text-sm">Inventory</span>
                    </button>

                    <button
                        onClick={() => handleItemClick(onOpenShop)}
                        className="flex items-center gap-3 p-3 hover:bg-pink-50 rounded-xl text-gray-600 hover:text-pink-600 transition-colors text-left group"
                    >
                        <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center group-hover:bg-pink-200">
                            <ShoppingBag size={16} />
                        </div>
                        <span className="font-bold text-sm">Shop</span>
                    </button>

                    <button
                        onClick={() => handleItemClick(onOpenLog)}
                        className="flex items-center gap-3 p-3 hover:bg-amber-50 rounded-xl text-gray-600 hover:text-amber-600 transition-colors text-left group"
                    >
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center group-hover:bg-amber-200">
                            <Bookmark size={16} />
                        </div>
                        <span className="font-bold text-sm">Missions</span>
                    </button>

                </div>
            )}
        </div>
    );
};

export default MainMenu;
