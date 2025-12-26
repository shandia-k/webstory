export interface Stats {
    happiness?: number;
    energy?: number;
    hunger?: number;
    belly?: number; // Legacy alias for hunger?
    maxHp?: number; // Visual max
    hp?: number; // Current HP
    xp?: number;
    level?: number;
    atk?: number;
    def?: number;
    evolutionStage?: number; // 0 = base, 1 = evolved once, etc.
    bond?: number; // [NEW] Long-term affection (Trust/Heart)
    discipline?: number; // [NEW] Obedience/Will (War/Obey)
}

export interface Item {
    name: string;
    icon: string;
    desc: string;
}

export interface Role {
    name?: string;
    desc?: string;
    stats?: Stats;
    element?: string;
    emoji?: string;
    theme?: string; // [NEW] visual theme/gradient
}

export interface Pal {
    id: string;
    name: string;
    emoji: string;
    element: 'api' | 'air' | 'tumbuhan' | 'electric' | 'dark' | 'light' | 'ice' | 'wind' | string;
    trait?: 'brave' | 'coward' | 'lazy' | 'glutton' | 'proud' | 'playful' | string;
    desc?: string;
    role?: Role;
    inventory?: Item[];
    stats?: Stats; // Sometimes stats are direct, sometimes in role.stats
    suggested_names?: string[];
}

export interface Wallet {
    gold: number;
    gems: number;
}

export interface Campaign {
    isActive: boolean;
    title: string;
    mainGoal: string;
    antagonist: string;
    currentChapter: number;
    historySummary: string[];
    pendingMission?: any; // Stores AdventureResponse for active plot missions (Boss/Story)
}

export interface GameState {
    phase: string;
    selectedWorld: string;
    adoptedPal: Pal | null;
    wallet: Wallet;
    stats: Stats;
    inventory: Item[];
    quest: string;
    history: { role: 'user' | 'model'; text: string }[];
    campaign: Campaign;
}
