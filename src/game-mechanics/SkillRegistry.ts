/**
 * Skill Registry
 * Database of all available active skills for Pals.
 */

export interface Skill {
    id: string;
    name: string;
    type: 'DAMAGE' | 'HEAL' | 'BUFF' | 'DEBUFF';
    power: number; // Damage or Heal amount
    accuracy: number; // 0.0 to 1.0
    cost: number; // Energy Cost
    element: string; // 'neutral', 'api', 'water', 'leaf', etc.
    minLevel: number;
    description: string;
    emoji: string;
}

const SKILL_DB: Skill[] = [
    // --- NEUTRAL SKILLS ---
    { id: 'scratch', name: 'Scratch', type: 'DAMAGE', power: 25, accuracy: 0.95, cost: 5, element: 'neutral', minLevel: 1, description: 'Basic attack.', emoji: '💢' },
    { id: 'tackle', name: 'Tackle', type: 'DAMAGE', power: 40, accuracy: 0.85, cost: 10, element: 'neutral', minLevel: 3, description: 'A strong body slam.', emoji: '💥' },
    { id: 'focus', name: 'Focus', type: 'BUFF', power: 0, accuracy: 1.0, cost: 5, element: 'neutral', minLevel: 5, description: 'Sharpen focus for critical hits.', emoji: '👁️' },

    // --- FIRE (API) ---
    { id: 'ember', name: 'Ember', type: 'DAMAGE', power: 30, accuracy: 1.0, cost: 8, element: 'api', minLevel: 2, description: 'Small flame burst.', emoji: '🔥' },
    { id: 'flame_charge', name: 'Flame Charge', type: 'DAMAGE', power: 50, accuracy: 0.9, cost: 15, element: 'api', minLevel: 6, description: 'Body covered in flames.', emoji: '☄️' },
    { id: 'inferno', name: 'Inferno', type: 'DAMAGE', power: 90, accuracy: 0.75, cost: 30, element: 'api', minLevel: 12, description: 'Massive fire blast.', emoji: '🌋' },

    // --- WATER (AIR) ---
    { id: 'bubble', name: 'Bubble', type: 'DAMAGE', power: 20, accuracy: 1.0, cost: 5, element: 'air', minLevel: 2, description: 'Popping bubbles.', emoji: '🫧' },
    { id: 'aqua_jet', name: 'Aqua Jet', type: 'DAMAGE', power: 45, accuracy: 1.0, cost: 12, element: 'air', minLevel: 6, description: 'Strike with water speed.', emoji: '💧' },
    { id: 'tsunami', name: 'Tsunami', type: 'DAMAGE', power: 85, accuracy: 0.8, cost: 30, element: 'air', minLevel: 12, description: 'Giant wave crash.', emoji: '🌊' },

    // --- GRASS (TUMBUHAN) ---
    { id: 'vine_whip', name: 'Vine Whip', type: 'DAMAGE', power: 35, accuracy: 0.95, cost: 8, element: 'tumbuhan', minLevel: 2, description: 'Lash out with vines.', emoji: '🌿' },
    { id: 'photosynthesis', name: 'Synthesis', type: 'HEAL', power: 30, accuracy: 1.0, cost: 20, element: 'tumbuhan', minLevel: 6, description: 'Heal using sunlight.', emoji: '🌞' },
    { id: 'solar_beam', name: 'Solar Beam', type: 'DAMAGE', power: 100, accuracy: 0.7, cost: 40, element: 'tumbuhan', minLevel: 12, description: 'Charge up power.', emoji: '🎍' },
];

/**
 * Get all available skills for a Pal based on element and level.
 */
export const getPalSkills = (element: string, level: number): Skill[] => {
    return SKILL_DB.filter(skill => {
        // Match Element OR Neutral (Everyone gets neutral)
        const elementMatch = skill.element === 'neutral' || skill.element === element.toLowerCase();
        // Match Level
        const levelMatch = skill.minLevel <= level;
        return elementMatch && levelMatch;
    }).sort((a, b) => b.power - a.power); // Sort by strong moves first logic?
};

/**
 * AI Logic to pick a skill.
 */
export const pickBestSkill = (skills: Skill[], currentEnergy: number): Skill | null => {
    // 1. Filter skills we can afford
    const affordable = skills.filter(s => s.cost <= currentEnergy);

    if (affordable.length === 0) return null;

    // 2. Simple AI: 
    // - If HP low, Heal (TODO: Need HP awareness here, but let's assume we want aggressive)
    // - Otherwise, pick strongest damage
    // - Small chance to pick random for variety

    if (Math.random() < 0.3) {
        // Random affordable skill
        const idx = Math.floor(Math.random() * affordable.length);
        return affordable[idx];
    }

    // Pick strongest
    // Assuming 'power' is the metric
    return affordable.reduce((prev, current) => (prev.power > current.power) ? prev : current);
};
