export type PersonalityArchetype = 'WILD' | 'SPOILED' | 'SOLDIER' | 'CHAMPION';
import { PROMPTS } from '../constants/prompts';

export interface PersonalityProfile {
    archetype: PersonalityArchetype;
    label: string;
    emoji: string;
    description: string;
    systemPrompt: string;
}

// THRESHOLDS
const HIGH_THRESHOLD = 50; // Bond/Disc > 50 considered "High" for now (Scale 0-100 placeholder, or 0-1000?)
// If implementing 0-1000 scale, this should be 300-500. Let's assume 0-100 for easy testing first, or scale dynamically.
// Let's stick to the visible numbers in UI. If Bond is currently single digits, let's use low thresholds for testing: 10.
// TODO: Tuning.
const THRESHOLD = 10;

export const calculateArchetype = (bond: number, discipline: number): PersonalityProfile => {
    const isHighBond = bond >= THRESHOLD;
    const isHighDisc = discipline >= THRESHOLD;

    if (isHighBond && isHighDisc) {
        return {
            archetype: 'CHAMPION',
            label: 'True Partner',
            emoji: '👑',
            description: 'A loyal and disciplined partner. The ideal connection.',
            systemPrompt: PROMPTS.PERSONALITY.CHAMPION
        };
    }

    if (isHighBond && !isHighDisc) {
        return {
            archetype: 'SPOILED',
            label: 'Baby',
            emoji: '🍼',
            description: 'Cute but demands attention. Refuses to work hard.',
            systemPrompt: PROMPTS.PERSONALITY.SPOILED
        };
    }

    if (!isHighBond && isHighDisc) {
        return {
            archetype: 'SOLDIER',
            label: 'Soldier',
            emoji: '🛡️',
            description: 'Follows orders perfectly but lacks emotional warmth.',
            systemPrompt: PROMPTS.PERSONALITY.SOLDIER
        };
    }

    // Default
    return {
        archetype: 'WILD',
        label: 'Wild',
        emoji: '🐾',
        description: 'Independent and wary. Trust is not yet established.',
        systemPrompt: PROMPTS.PERSONALITY.WILD
    };
};

export const getArchetypeColor = (archetype: PersonalityArchetype): string => {
    switch (archetype) {
        case 'CHAMPION': return 'text-purple-600 bg-purple-100 border-purple-300';
        case 'SPOILED': return 'text-pink-500 bg-pink-100 border-pink-300';
        case 'SOLDIER': return 'text-blue-600 bg-blue-100 border-blue-300';
        case 'WILD': return 'text-amber-600 bg-amber-100 border-amber-300';
        default: return 'text-gray-500 bg-gray-100 border-gray-300';
    }
};
