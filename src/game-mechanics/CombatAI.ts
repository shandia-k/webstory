import { GAME_CONFIG } from '../config/constants';
import { getPalSkills, pickBestSkill } from './SkillRegistry';

/**
 * Determines the Pal's autonomous action for the turn.
 * @param {Object} palState - { stats: {happiness, energy, hunger}, trait: 'lazy' }
 * @param {Object} combatState - { enemyHp, enemyElement, playerCommands }
 */
export const decidePalAction = (palState, combatState) => {
    const { happiness, energy, hunger } = palState.stats;
    const trait: any = Object.values(GAME_CONFIG.TRAITS).find((t: any) => t.id === palState.trait) || {};
    const effects = trait.effects || {};

    const rng = Math.random();

    // 1. CHECK TRAIT OVERRIDES

    // LAZY: If tired, might sleep
    if ((trait as any).id === 'lazy' && energy < 50) {
        if (rng < (effects.skip_turn_chance || 0.2)) {
            return { type: 'SLEEP', label: 'is napping...', narration: 'yawned and fell asleep!' };
        }
    }

    // COWARD: If scary, might flee
    if ((trait as any).id === 'coward' && combatState.enemyHp > 50) {
        if (rng < (effects.flee_chance || 0.1)) {
            return { type: 'FLEE_ATTEMPT', label: 'is shaking!', narration: 'tries to run away!' };
        }
    }

    // GLUTTON: Prioritize eating if inventory has food (Mock logic for now)
    // if (trait.id === 'glutton' && hasFood) ...

    // 2. STANDARD BEHAVIOR (Morale Check)
    // If miserable, might refuse to attack
    if (happiness < 20 && rng < 0.3) {
        return { type: 'SULK', label: 'is sulking...', narration: 'refuses to look at the enemy.' };
    }

    // 3. SKILL SYSTEM
    // Passed palState should ideally have element and level. 
    // If not, we fallback or try to extract from stats if mixed.
    const level = palState.level || palState.stats?.level || 1;
    const element = palState.element || 'neutral';

    // Get Skills
    const skills = getPalSkills(element, level);

    // Pick Logic
    const chosenSkill = pickBestSkill(skills, energy);

    if (chosenSkill) {
        return {
            type: 'SKILL',
            label: chosenSkill.name,
            narration: `used ${chosenSkill.name}!`,
            skill: chosenSkill
        };
    }

    // Fallback if no energy for any skill
    return { type: 'ATTACK', label: 'Struggle', narration: 'struggles weakly!', isStruggle: true };
};
