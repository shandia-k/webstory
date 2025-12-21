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

/**
 * Calculates rewards for winning a combat.
 * Dynamic XP based on Enemy Level and Difficulty.
 */
export const calculateCombatRewards = (enemyLevel, difficultyMultiplier = 1) => {
    // Base XP for an "even" fight (Player Level = Enemy Level)
    // We want ~5 fights per level.
    // Level 1->2 needs 100XP. So ~20XP base.
    // Scaling formula: Base * (Multiplier ^ (Level - 1))
    // This matches the XP requirement curve, ensuring constant "fights per level".

    const { MULTIPLIER } = GAME_CONFIG.EXP_CURVES;
    // Base XP Reward constant. If Base Requirement is 100, Reward Base is 20 (1/5th).
    const REWARD_BASE = 20;

    // XP = 20 * (1.5 ^ (EnemyLevel - 1)) * Difficulty
    let rawXp = REWARD_BASE * Math.pow(MULTIPLIER, enemyLevel - 1);

    // Apply Difficulty
    rawXp = rawXp * difficultyMultiplier;

    // Apply random variance (+/- 10%)
    const variance = 0.9 + (Math.random() * 0.2);
    rawXp = rawXp * variance;

    return {
        xp: Math.floor(Math.max(1, rawXp))
    };
};
