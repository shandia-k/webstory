import { GAME_CONFIG } from '../config/constants';

/**
 * THE MASTER FORMULA
 * Damage = (ATK_attacker / DEF_defender * BasePower) * CoachMod * MoodMod * RNG
 */

export const calculateStats = (baseStats, currentStats, traitId) => {
    // 1. Base Stats
    // Assuming base stats are passed, or we use defaults
    // In this system, ATK and DEF are derived from Pal's potential + Level (not fully implemented yet, so we use constants)

    const level = currentStats.level || 1;

    // ATK: 15 + (Level * 2)
    // Level 1: 17
    // Level 50: 115
    const ATK = 15 + (level * 2);

    // DEF: 10 + (Level * 1)
    // Level 1: 11
    // Level 50: 60
    const DEF = 10 + (level * 1);

    // LUCK (Crit Rate): Base 10%
    const LUCK = 0.10;

    // MOOD MODIFIER
    // Happiness > 80%: 1.2x (Semangat!)
    // Happiness < 30%: 0.6x (Depresi/Takut)
    // Else: 1.0x
    const happiness = currentStats.happiness || 50;
    let MOOD = 1.0;
    if (happiness > 80) MOOD = 1.2;
    else if (happiness < 30) MOOD = 0.6;

    // Trait effects could offset this, but let's stick to the Master Formula first.

    // Energy Vulnerability
    const energy = currentStats.energy || 50;
    const dmgTakenMult = energy < 30 ? 1.4 : 1.0;

    return {
        // Stats for Formula
        atk: ATK,
        def: DEF,
        luck: LUCK,
        mood: MOOD,

        // Other checks
        happiness,
        energy,
        hunger: currentStats.hunger || 50,
        dmgTakenMult
    };
};

export const calculateMasterDamage = (attackerStats, defenderStats, command, basePower = 10) => {
    // 1. Coach Mod (Instruksi Pemain)
    let coachMod = 0.8; // Default Idle/Wait
    if (command === 'SCOLD') coachMod = 1.2;
    if (command === 'CHEER') coachMod = 1.0; // Cheer adds to stats elsewhere (Crit/Happiness), but mod is neutral here? 

    // 2. Mood Mod
    const moodMod = attackerStats.mood || 1.0;

    // 3. RNG (0.9 to 1.1)
    const rng = 0.9 + Math.random() * 0.2;

    // 4. THE FORMULA
    // D = (ATK / DEF * Base) * Coach * Mood * RNG
    const atk = attackerStats.atk || 15;
    const def = defenderStats.def || 10; // Default enemy DEF

    const rawRatio = (atk / def) * basePower;
    const finalDamage = Math.floor(rawRatio * coachMod * moodMod * rng);

    // CRIT Check?
    // User said LUCK (Crit Rate) is separate.
    // If Crit, maybe 1.5x?
    let isCrit = false;
    let damage = finalDamage;
    if (Math.random() < (attackerStats.luck || 0.1)) {
        isCrit = true;
        damage = Math.floor(damage * 1.5);
    }

    return {
        damage,
        isCrit,
        details: {
            atk, def, basePower, coachMod, moodMod, rng: rng.toFixed(2)
        }
    };
};

/**
 * Legacy/Helper for Element text (Optional)
 */
export const getElementLabel = (atkEl, defEl) => {
    const { CYCLE } = GAME_CONFIG.ELEMENTS;
    if (CYCLE[atkEl] === defEl) return "🔥 SUPER EFFECTIVE!";
    if (CYCLE[defEl] === atkEl) return "❄️ RESISTED...";
    return "";
};

// Backward compatibility or for Enemy simple attacks if using old logic
export const calculateDamage = (atkEl, defEl, raw) => {
    // Enemy still uses simple logic in some places? 
    // We upgraded enemy in useCombat to use calculateDamage... wait.
    // Enemy logic in useCombat was:  const { damage, label } = calculateDamage(enemy.element, pal.role.element, baseEnemyDmg);
    // So we need to keep calculateDamage or update Enemy Logic to use Master Formula too?
    // Plan: Keep calculateDamage for simple enemy attacks (Element only) for now, as user requested "Master Formula" specifically for PLAYER.
    // Or update calculateDamage to just do Element mult.

    const { CYCLE, MULTIPLIERS } = GAME_CONFIG.ELEMENTS;
    let multiplier = MULTIPLIERS.NEUTRAL;
    let label = "";

    if (CYCLE[atkEl] === defEl) {
        multiplier = MULTIPLIERS.STRONG;
        label = "🔥 SUPER EFFECTIVE!";
    } else if (CYCLE[defEl] === atkEl) {
        multiplier = MULTIPLIERS.WEAK;
        label = "❄️ NOT EFFECTIVE...";
    }

    const finalDamage = Math.floor(raw * multiplier);
    return { damage: finalDamage, isCrit: false, label };
};
