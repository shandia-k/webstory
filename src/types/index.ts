// --- SHARED TYPES ---

export type Phase = 'hub' | 'adoption' | 'game' | 'adventure' | 'rigging';
export type WorldType = 'scifi' | 'fantasy' | 'cyberpunk'; // Add others as needed

export interface Stats {
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  happiness: number;
  level: number;
  xp: number;
  maxXp: number;
  attack: number;
  defense: number;
}

export interface PlayerState {
  name: string;
  stats: Stats;
  trait: string; // e.g., 'brave', 'lazy'
  wallet: {
    gold: number;
    gems: number;
  };
}

// ITEM SYSTEM
export type ItemType = 'weapon' | 'armor' | 'consumable' | 'material' | 'quest';

export interface ItemDefinition {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  maxStack: number;
  icon?: string; // path or emoji
  value: number;
  // Dynamic stats modifiers
  modifiers?: {
    [key in keyof Stats]?: number;
  };
}

export interface ItemInstance {
  instanceId: string;
  defId: string;
  qty: number;
  // Unique data
  durability?: number; // 0-100
  enchantments?: string[];
  isEquipped?: boolean;
}

// COMBAT TYPES
export interface Enemy {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  xpReward: number;
  lootTable: string[]; // List of ItemDef IDs
}
