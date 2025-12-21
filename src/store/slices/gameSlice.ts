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
}

export const createGameSlice: StateCreator<GameStore, [["zustand/immer", never]], [], GameSlice> = (set) => ({
  phase: 'hub',
  world: 'scifi',

  setPhase: (phase) => set((state) => { state.phase = phase; }),
  setWorld: (world) => set((state) => { state.world = world; }),

  resetGame: () => set((state) => {
    state.phase = 'hub';
    // Logic to reset other slices could be triggered via a root action
  })
});
