import { StateCreator } from 'zustand';
import { Phase, WorldType } from '../../types';
import { GameStore } from '../useGameStore';

export interface GameSlice {
  phase: Phase;
  world: WorldType;

  // Actions
  setPhase: (phase: Phase) => void;
  setWorld: (world: WorldType) => void;
  resetGame: () => void;
  loadGameData: (data: any) => void;
}

export const createGameSlice: StateCreator<GameStore, [["zustand/immer", never]], [], GameSlice> = (set) => ({
  phase: 'hub',
  world: 'scifi',

  setPhase: (phase) => set((state) => { state.phase = phase; }),
  setWorld: (world) => set((state) => { state.world = world; }),

  resetGame: () => set((state) => {
    state.phase = 'hub';
    state.player = null;
    state.items = [];
    state.combat = { isActive: false, phase: 'init', enemy: null, logs: [] };
  }),

  loadGameData: (data) => set((state) => {
    if (data.player) state.player = data.player;
    if (data.items) state.items = data.items;
    if (data.phase) state.phase = data.phase;
    if (data.world) state.world = data.world;
    // Add other slices as needed
  })
});
