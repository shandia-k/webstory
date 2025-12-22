/**
 * Combat Scaling System
 * Handles dynamic difficulty and reward calculations.
 */

interface EnemyStats {
    maxHp: number;
    atk: number; // Base damage range
    def: number;
    level: number;
    xpReward: number;
}

/**
 * Generates scaled stats for an enemy based on the player's level.
 * @param playerLevel Current level of the player
 * @param isBoss Whether this entity is a boss (boosts stats significantly)
 * @param difficultyMultiplier Global difficulty scaler (default 1.0)
 */
export const scaleEnemyStats = (
    playerLevel: number,
    isBoss: boolean = false,
    difficultyMultiplier: number = 1.0
): EnemyStats => {
    // 1. Determine Enemy Level Range (Player Level -1 to +1)
    const levelVar = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
    const enemyLevel = Math.max(1, playerLevel + levelVar);

    // 2. Base Scalars (Polished for standard RPG curve)
    // HP Curve: Starts at ~100, gains ~20-30 per level
    const baseHp = 80;
    const hpGrowth = 25;

    // Dmg Curve: Starts at ~10, gains ~2-3 per level
    const baseDmg = 8;
    const dmgGrowth = 2.5;

    // 3. Calculate Raw Stats
    let maxHp = Math.floor((baseHp + (enemyLevel * hpGrowth)) * difficultyMultiplier);
    let atk = Math.floor((baseDmg + (enemyLevel * dmgGrowth)) * difficultyMultiplier);
    let def = Math.floor((5 + (enemyLevel * 1.5)) * difficultyMultiplier);

    // 4. Boss Multipliers
    if (isBoss) {
        maxHp = Math.floor(maxHp * 2.5); // Bosses are tanky!
        atk = Math.floor(atk * 1.3);     // And hit harder
        def = Math.floor(def * 1.5);
    }

    // 5. XP Calc
    // Base XP = 20 * Level using a standard curve
    // Bosses give 5x XP
    let xpReward = Math.floor(20 * Math.pow(enemyLevel, 1.1));
    if (isBoss) xpReward *= 5;

    return {
        maxHp,
        atk,
        def,
        level: enemyLevel,
        xpReward
    };
};

/**
 * Calculates final XP gain with level gap penalties.
 * @param playerLevel 
 * @param enemyLevel 
 * @param baseXp 
 */
export const calculateDynamicXp = (playerLevel: number, enemyLevel: number, baseXp: number): number => {
    const gap = playerLevel - enemyLevel;

    let multiplier = 1.0;

    // Penalty if player is overleveled
    if (gap > 2) multiplier = 0.5;
    if (gap > 5) multiplier = 0.1;

    // Bonus if player is underleveled (High Risk High Reward)
    if (gap < -2) multiplier = 1.5;

    return Math.floor(baseXp * multiplier);
};
