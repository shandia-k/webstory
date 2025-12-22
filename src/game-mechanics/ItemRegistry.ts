export type ItemType = 'CONSUMABLE' | 'KEY' | 'GEAR';

export interface GameItem {
    id: string;
    name: string;
    type: ItemType;
    effect?: {
        type: 'HEAL_HP' | 'HEAL_ENERGY' | 'HEAL_HUNGER' | 'BUFF_ATK';
        value: number;
    };
    price: number;
    desc: string;
    icon: string;
}

export const ITEM_DB: Record<string, GameItem> = {
    'potion_small': {
        id: 'potion_small',
        name: 'Small Potion',
        type: 'CONSUMABLE',
        effect: { type: 'HEAL_HP', value: 50 },
        price: 50,
        desc: 'Restores 50 HP.',
        icon: '🧪'
    },
    'potion_max': {
        id: 'potion_max',
        name: 'Max Potion',
        type: 'CONSUMABLE',
        effect: { type: 'HEAL_HP', value: 999 },
        price: 200,
        desc: 'Fully restores HP.',
        icon: '⚗️'
    },
    'energy_drink': {
        id: 'energy_drink',
        name: 'Energy Drink',
        type: 'CONSUMABLE',
        effect: { type: 'HEAL_ENERGY', value: 50 },
        price: 80,
        desc: 'Restores 50 Energy.',
        icon: '⚡'
    },
    'burger': {
        id: 'burger',
        name: 'Mega Burger',
        type: 'CONSUMABLE',
        effect: { type: 'HEAL_HUNGER', value: 50 },
        price: 30,
        desc: 'A delicious meal.',
        icon: '🍔'
    }
};

export const SHOP_ITEMS = [
    ITEM_DB['potion_small'],
    ITEM_DB['energy_drink'],
    ITEM_DB['burger'],
    ITEM_DB['potion_max']
];
