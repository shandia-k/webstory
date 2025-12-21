import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { createPlayerSlice, PlayerSlice } from './slices/playerSlice';
import { createInventorySlice, InventorySlice } from './slices/inventorySlice';
import { createGameSlice, GameSlice } from './slices/gameSlice';
import { createCombatSlice, CombatSlice } from './slices/combatSlice';
import { createSettingsSlice, SettingsSlice } from './slices/settingsSlice';

// Combine all slices
export interface GameStore extends PlayerSlice, InventorySlice, GameSlice, CombatSlice, SettingsSlice {}

export const useGameStore = create<GameStore>()(
  persist(
    immer((...a) => ({
      ...createPlayerSlice(...a),
      ...createInventorySlice(...a),
      ...createGameSlice(...a),
      ...createCombatSlice(...a),
      ...createSettingsSlice(...a),
    })),
    {
      name: 'rpg-game-storage', // Key in LocalStorage
      partialize: (state) => ({
        // Select what to persist
        player: state.player,
        items: state.items,
        phase: state.phase, // Optionally save phase?
        world: state.world
      }),
    }
  )
);
