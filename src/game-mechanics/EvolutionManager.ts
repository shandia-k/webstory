import { PersonalityArchetype } from './PersonalitySystem';
import { Pal, Stats } from '../types/game';

export interface EvolutionBranch {
    id: string;
    name: string;
    description: string;
    emoji: string; // The new visual
    requirements: string; // Text description of requirements
    bonuses: Partial<Stats>;
    bgGradient: string; // Theme color change
}

// MOCK VISUALS (Since we don't have 3D models for variants yet, we use Emojis/Theme)
export const EVOLUTION_TREE: Record<PersonalityArchetype, EvolutionBranch> = {
    'SPOILED': {
        id: 'FAIRY',
        name: 'Mystic Spirit',
        description: 'A magical being powered by pure love... and laziness.',
        emoji: '🧚‍♀️', // Fairy
        requirements: 'High Bond (>10), Low Discipline',
        bonuses: {
            maxHp: 50,
            happiness: 200, // Cap increase?
            energy: -20, // Lazier
        },
        bgGradient: 'from-pink-300 to-rose-300'
    },
    'SOLDIER': {
        id: 'MECHA',
        name: 'Iron Vanguard',
        description: 'A disciplined warrior tailored for combat efficiency.',
        emoji: '🤖', // Robot/Mecha
        requirements: 'High Discipline (>10), Low Bond',
        bonuses: {
            atk: 25,
            def: 25,
            happiness: -50 // Stern
        },
        bgGradient: 'from-slate-700 to-zinc-800 text-white' // Dark & Cool
    },
    'CHAMPION': {
        id: 'LEGEND',
        name: 'Apex Legend',
        description: 'The perfect balance of heart and will. A true hero.',
        emoji: '🦁', // Lion/Apex
        requirements: 'High Bond (>10) AND High Discipline (>10)',
        bonuses: {
            maxHp: 100,
            atk: 50,
            def: 50,
            bond: 100 // Bonus bond
        },
        bgGradient: 'from-amber-200 to-yellow-400'
    },
    'WILD': {
        id: 'BEAST',
        name: 'Awakened Beast',
        description: 'A powerful creature that answers to no one.',
        emoji: '🐺', // Wolf
        requirements: 'Base Evolution (No special traits)',
        bonuses: {
            atk: 10,
            energy: 50
        },
        bgGradient: 'from-emerald-600 to-green-800 text-white'
    }
};

export const getPotentialEvolution = (personality: PersonalityArchetype): EvolutionBranch => {
    return EVOLUTION_TREE[personality] || EVOLUTION_TREE['WILD'];
};

export const evolvePal = (pal: Pal, branch: EvolutionBranch): Pal => {
    if (!pal.role || !pal.role.stats) return pal;

    // Apply stats
    const newStats = { ...pal.role.stats };
    if (branch.bonuses.maxHp) newStats.maxHp = (newStats.maxHp || 100) + branch.bonuses.maxHp;
    if (branch.bonuses.atk) newStats.atk = (newStats.atk || 10) + branch.bonuses.atk;
    if (branch.bonuses.def) newStats.def = (newStats.def || 10) + branch.bonuses.def;

    // Apply visual changes
    // Ideally we would trigger a model swap here.
    // For now, update Emoji and Name/Role Name?

    return {
        ...pal,
        role: {
            ...pal.role,
            name: branch.name, // "Mystic Spirit"
            desc: branch.description,
            emoji: branch.emoji,
            stats: newStats,

            // [NEW] Persist Theme
            theme: branch.bgGradient
        }
    };
};
