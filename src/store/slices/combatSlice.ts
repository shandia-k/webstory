import { StateCreator } from 'zustand';
import { Enemy } from '../../types';
import { GameStore } from '../useGameStore';

export type CombatPhase = 'init' | 'player_turn' | 'enemy_turn' | 'resolution' | 'victory' | 'defeat';

export interface CombatState {
  isActive: boolean;
  phase: CombatPhase;
  enemy: Enemy | null;
  logs: string[];
}

export interface CombatSlice {
  combat: CombatState;

  // Actions
  startCombat: (enemyId: string) => void;
  playerAttack: () => void;
  enemyTurn: () => void;
  endCombat: () => void;
}

// Mock Enemy Database
const ENEMY_DB: Record<string, Enemy> = {
  'slime': { id: 'slime', name: 'Slime', level: 1, hp: 30, maxHp: 30, attack: 4, defense: 1, xpReward: 20, lootTable: ['potion_hp'] },
  'goblin': { id: 'goblin', name: 'Goblin', level: 2, hp: 50, maxHp: 50, attack: 8, defense: 2, xpReward: 40, lootTable: ['sword_basic'] }
};

export const createCombatSlice: StateCreator<GameStore, [["zustand/immer", never]], [], CombatSlice> = (set) => ({
  combat: {
    isActive: false,
    phase: 'init',
    enemy: null,
    logs: []
  },

  startCombat: (enemyId) =>
    set((state) => {
      const enemyDef = ENEMY_DB[enemyId];
      if (!enemyDef) return;

      state.combat = {
        isActive: true,
        phase: 'player_turn',
        enemy: { ...enemyDef }, // Clone enemy data
        logs: [`Encountered a wild ${enemyDef.name}!`]
      };
    }),

  playerAttack: () =>
    set((state) => {
      // Access Player Stats via get() if needed, but here we modify state directly in immer
      // Note: Zustand slices don't easily allow cross-slice access inside `set` without `get()`.
      // For simple logic, we assume player stats are passed or handled by component.
      // ideally, we access the full store via `get()` but inside `set` we only see local slice unless combined.
      // Wait, with shared slice pattern, `set` operates on the WHOLE store.

      const { combat, player } = state as any; // Cast to access other slices
      if (!combat.enemy || !player) return;

      const damage = Math.max(1, player.stats.attack - combat.enemy.defense);
      combat.enemy.hp -= damage;
      combat.logs.push(`You hit ${combat.enemy.name} for ${damage} damage!`);

      if (combat.enemy.hp <= 0) {
        combat.phase = 'victory';
        combat.logs.push(`${combat.enemy.name} defeated!`);
        // Reward logic should be triggered here or in a separate effect
      } else {
        combat.phase = 'enemy_turn';
      }
    }),

  enemyTurn: () =>
    set((state) => {
      const { combat, player } = state as any;
      if (!combat.enemy || !player) return;

      const damage = Math.max(1, combat.enemy.attack - player.stats.defense);
      player.stats.hp -= damage;
      combat.logs.push(`${combat.enemy.name} attacks you for ${damage} damage!`);

      if (player.stats.hp <= 0) {
        combat.phase = 'defeat';
        combat.logs.push(`You were defeated...`);
      } else {
        combat.phase = 'player_turn';
      }
    }),

  endCombat: () =>
    set((state) => {
      state.combat.isActive = false;
      state.combat.logs = [];
    })
});
