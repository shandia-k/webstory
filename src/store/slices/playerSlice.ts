import { StateCreator } from 'zustand';
import { PlayerState, Stats } from '../../types';
import { GameStore } from '../useGameStore';

export interface PlayerSlice {
  player: PlayerState | null; // Null if no character created yet
<<<<<<< HEAD

=======

>>>>>>> origin/main
  // Actions
  createPlayer: (name: string, trait: string, initialStats: Stats) => void;
  updateStats: (updates: Partial<Stats>) => void;
  addXp: (amount: number) => void;
  updateWallet: (gold: number, gems: number) => void;
  fullHeal: () => void;
}

const INITIAL_STATS: Stats = {
  hp: 100, maxHp: 100,
  energy: 100, maxEnergy: 100,
  happiness: 100,
  level: 1, xp: 0, maxXp: 100,
  attack: 10, defense: 5
};

export const createPlayerSlice: StateCreator<GameStore, [["zustand/immer", never]], [], PlayerSlice> = (set) => ({
  player: null,

  createPlayer: (name, trait, initialStats = INITIAL_STATS) =>
    set((state) => {
      state.player = {
        name,
        trait,
        stats: initialStats,
        wallet: { gold: 100, gems: 0 }
      };
    }),

  updateStats: (updates) =>
    set((state) => {
      if (!state.player) return;
      // Merge updates
      Object.assign(state.player.stats, updates);
<<<<<<< HEAD

=======

>>>>>>> origin/main
      // Clamp values
      const s = state.player.stats;
      s.hp = Math.min(Math.max(s.hp, 0), s.maxHp);
      s.energy = Math.min(Math.max(s.energy, 0), s.maxEnergy);
      s.happiness = Math.min(Math.max(s.happiness, 0), 100);
    }),

  addXp: (amount) =>
    set((state) => {
      if (!state.player) return;
      const s = state.player.stats;
<<<<<<< HEAD

      s.xp += amount;

=======

      s.xp += amount;

>>>>>>> origin/main
      // Level Up Logic (Simple while loop for multi-level)
      while (s.xp >= s.maxXp) {
        s.xp -= s.maxXp;
        s.level += 1;
<<<<<<< HEAD

=======

>>>>>>> origin/main
        // Stat Growth
        s.maxHp += 10;
        s.maxEnergy += 5;
        s.attack += 2;
        s.defense += 1;
<<<<<<< HEAD

        // Full Heal on Level Up
        s.hp = s.maxHp;
        s.energy = s.maxEnergy;

=======

        // Full Heal on Level Up
        s.hp = s.maxHp;
        s.energy = s.maxEnergy;

>>>>>>> origin/main
        // Increase XP requirement
        s.maxXp = Math.floor(s.maxXp * 1.5);
      }
    }),

  updateWallet: (goldDelta, gemsDelta) =>
    set((state) => {
      if (!state.player) return;
      state.player.wallet.gold += goldDelta;
      state.player.wallet.gems += gemsDelta;
    }),

  fullHeal: () =>
    set((state) => {
      if (!state.player) return;
      state.player.stats.hp = state.player.stats.maxHp;
      state.player.stats.energy = state.player.stats.maxEnergy;
    })
});
