import { GAME_CONFIG } from '../config/constants';

/**
 * Calculates XP required for the NEXT level.
 * Formula: Base * (Multiplier ^ (Level - 1))
 * Level 1 -> 2: 100 * (1.5^0) = 100
 * Level 2 -> 3: 100 * (1.5^1) = 150
 * Level 3 -> 4: 100 * (1.5^2) = 225
 */
export const getXpToNextLevel = (currentLevel) => {
    const { BASE, MULTIPLIER } = GAME_CONFIG.EXP_CURVES;
    return Math.floor(BASE * Math.pow(MULTIPLIER, currentLevel - 1));
};

/**
 * Processes XP gain and returns the new state (level, xp, didLevelUp).
 * Handles multiple level ups in one go if massive XP is gained.
 */
export const calculateXpGain = (currentLevel, currentXp, xpGained) => {
    let level = currentLevel;
    let xp = currentXp + xpGained;
    let didLevelUp = false;
    let levelsGained = 0;

    let nextLevelXp = getXpToNextLevel(level);

    // Loop to handle multiple level ups
    while (xp >= nextLevelXp) {
        xp -= nextLevelXp;
        level++;
        didLevelUp = true;
        levelsGained++;
        nextLevelXp = getXpToNextLevel(level);
    }

    return {
        level,
        xp,
        didLevelUp,
        levelsGained, // For UI toast "Level Up! +2"
        nextLevelXp // For Progress Bar
    };
};

/**
 * Calculates gained stats upon level up.
 * Returns the object to merge into stats.
 */
export const getLevelUpBonuses = (newLevel) => {
    // Simple linear scaling for now, consistent with CombatFormulas
    // We don't need to store ATK/DEF permanently if they are derived in CombatFormulas,
    // BUT we definitely need to increase MaxHP.

    // MaxHP = 100 + (Level * 10)
    // We return the NEW MaxHP directly.
    const newMaxHp = 100 + (newLevel * 10);

    return {
        maxHp: newMaxHp,
        // We could strictly replenish Energy/Happiness here too?
        energy: 100, // Refill energy on level up!
        happiness: 100 // Full heal!
    };
};
