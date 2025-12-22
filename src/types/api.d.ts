import { Pal } from './game';

export interface SetupResponse {
    intro_narrative: string;
    candidates: Pal[];
}

export interface ChatResponse {
    text: string;
    emoji: string;
}

export interface CampaignUpdate {
    advanceChapter: boolean;
    historyEntry: string;
}

export interface AdventureChoice {
    label: string;
    isReturn?: boolean;
    isCombat?: boolean;
    combatDetails?: any;
    effect?: {
        hp?: number;
        loot?: number;
        happy?: number;
        happiness?: number;
    };
}

export interface AdventureScene {
    type?: 'normal' | 'conflict' | 'ending';
    text: string;
    visual: string;
    choices: AdventureChoice[];
}

export interface AdventureResponse {
    sector: string;
    theme_color: string;
    enemy?: {
        name: string;
        emoji: string;
        element: string;
        intro: string;
    };
    scenes: AdventureScene[];
    campaignUpdate?: CampaignUpdate;
}

export interface VisionPart {
    [key: string]: [number, number];
}

export interface VisionResponse {
    parts: VisionPart;
}
