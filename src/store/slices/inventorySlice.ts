import { StateCreator } from 'zustand';
import { ItemInstance, ItemDefinition } from '../../types';
import { GameStore } from '../useGameStore';

// Mock Database for Items (Should be in a separate data file eventually)
const ITEM_DB: Record<string, ItemDefinition> = {
<<<<<<< HEAD
  'potion_hp': {
    id: 'potion_hp', name: 'Health Potion', type: 'consumable',
    description: 'Restores 50 HP', maxStack: 99, value: 10,
    modifiers: { hp: 50 }
  },
  'sword_basic': {
    id: 'sword_basic', name: 'Rusty Sword', type: 'weapon',
    description: 'A basic sword', maxStack: 1, value: 50,
    modifiers: { attack: 5 }
=======
  'potion_hp': {
    id: 'potion_hp', name: 'Health Potion', type: 'consumable',
    description: 'Restores 50 HP', maxStack: 99, value: 10,
    modifiers: { hp: 50 }
  },
  'sword_basic': {
    id: 'sword_basic', name: 'Rusty Sword', type: 'weapon',
    description: 'A basic sword', maxStack: 1, value: 50,
    modifiers: { attack: 5 }
>>>>>>> origin/main
  }
};

export interface InventorySlice {
  items: ItemInstance[];
<<<<<<< HEAD

=======

>>>>>>> origin/main
  // Actions
  addItem: (defId: string, qty: number) => boolean;
  removeItem: (instanceId: string, qty?: number) => void;
  equipItem: (instanceId: string) => void;
  useItem: (instanceId: string) => void; // Uses item logic
}

export const createInventorySlice: StateCreator<GameStore, [["zustand/immer", never]], [], InventorySlice> = (set, get) => ({
  items: [],

  addItem: (defId, qty) => {
    let success = false;
    const def = ITEM_DB[defId];
    if (!def) {
      console.error(`Item Definition not found: ${defId}`);
      return false;
    }

    set((state) => {
      // 1. Check if stackable and exists
      if (def.maxStack > 1) {
        const existing = state.items.find(i => i.defId === defId && i.qty < def.maxStack);
        if (existing) {
          const space = def.maxStack - existing.qty;
          const toAdd = Math.min(space, qty);
          existing.qty += toAdd;
          qty -= toAdd;
          success = true;
        }
      }

      // 2. If still have qty, create new instances
      while (qty > 0) {
        // For equipment, always new instance. For stackables, new stack.
        const newInstance: ItemInstance = {
          instanceId: crypto.randomUUID(),
          defId: defId,
          qty: Math.min(qty, def.maxStack),
          durability: def.type === 'weapon' ? 100 : undefined
        };
<<<<<<< HEAD

=======

>>>>>>> origin/main
        state.items.push(newInstance);
        qty -= newInstance.qty;
        success = true;
      }
    });
<<<<<<< HEAD

=======

>>>>>>> origin/main
    return success;
  },

  removeItem: (instanceId, qty = 1) =>
    set((state) => {
      const idx = state.items.findIndex(i => i.instanceId === instanceId);
      if (idx === -1) return;

      const item = state.items[idx];
      item.qty -= qty;
<<<<<<< HEAD

=======

>>>>>>> origin/main
      if (item.qty <= 0) {
        state.items.splice(idx, 1);
      }
    }),

<<<<<<< HEAD
  equipItem: (instanceId) =>
=======
  equipItem: (instanceId) =>
>>>>>>> origin/main
    set((state) => {
      const item = state.items.find(i => i.instanceId === instanceId);
      if (!item) return;

      // Logic for equipment slots would go here (simplified for now)
      // Toggle equip status
      item.isEquipped = !item.isEquipped;
    }),

  useItem: (instanceId) => {
    // This action handles reducing qty. Effect logic should be handled by caller or separate effect system.
    get().removeItem(instanceId, 1);
  }
});
