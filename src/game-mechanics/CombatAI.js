import { GAME_CONFIG } from '../config/constants';

/**
 * Determines the Pal's autonomous action for the turn.
 * @param {Object} palState - { stats: {happiness, energy, hunger}, trait: 'lazy' }
 * @param {Object} combatState - { enemyHp, enemyElement, playerCommands }
 */
export const decidePalAction = (palState, combatState) => {
    const { happiness, energy, hunger } = palState.stats;
    const trait = Object.values(GAME_CONFIG.TRAITS).find(t => t.id === palState.trait) || {};
    const effects = trait.effects || {};

    const rng = Math.random();

    // 1. CHECK TRAIT OVERRIDES

    // LAZY: If tired, might sleep
    if (trait.id === 'lazy' && energy < 50) {
        if (rng < (effects.skip_turn_chance || 0.2)) {
            return { type: 'SLEEP', label: 'is napping...', narration: 'yawned and fell asleep!' };
        }
    }

    // COWARD: If scary, might flee
    if (trait.id === 'coward' && combatState.enemyHp > 50) {
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

    // 3. DEFAULT ATTACK
    return { type: 'ATTACK', label: 'Attacks!', narration: 'launches a fierce attack!' };
};
