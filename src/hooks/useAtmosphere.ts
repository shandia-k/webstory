import { useState, useEffect } from 'react';

export type TimePhase = 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT';
export type WeatherCondition = 'CLEAR' | 'RAIN' | 'STORM';

export interface AtmosphereState {
    timePhase: TimePhase;
    weather: WeatherCondition;
    bgGradient: string;
    overlay: string | null;
    multipliers: {
        sleepEfficiency: number; // >1 = better sleep
        playHappiness: number;   // <1 = bad weather for play
        energyDrain: number;     // >1 = faster tire
        exploreRisk: number;     // >1 = more danger
    };
    flavorText: string;
}

export const useAtmosphere = (palElement: string = 'neutral'): AtmosphereState => {
    const [timePhase, setTimePhase] = useState<TimePhase>('DAY');
    const [weather, setWeather] = useState<WeatherCondition>('CLEAR');

    // 1. TIME CYCLE (Real-time rough mapping)
    useEffect(() => {
        const updateTime = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 8) setTimePhase('DAWN');
            else if (hour >= 8 && hour < 17) setTimePhase('DAY');
            else if (hour >= 17 && hour < 19) setTimePhase('DUSK');
            else setTimePhase('NIGHT');
        };

        updateTime();
        const interval = setInterval(updateTime, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    // 2. WEATHER CYCLE (Random updates)
    useEffect(() => {
        // Change weather occasionally (every 30-60m real time, or simplified for session?)
        // Let's make it change every 5 minutes for demo purposes, or purely random on load.
        // For gameplay consistency, we'll keep it simple: 20% chance of Rain.
        const rollWeather = () => {
            const rand = Math.random();
            if (rand < 0.2) setWeather('RAIN');
            else if (rand < 0.25) setWeather('STORM');
            else setWeather('CLEAR');
        };

        rollWeather();
        // Recalculate periodically? No, static for session is less annoying for now.
    }, []); // Run once on mount

    // 3. CALCULATE VISUALS & MULTIPLIERS
    const getProperties = () => {
        let bg = "from-blue-200 to-blue-100"; // Default Day
        let overlay = null;
        let flavor = "A beautiful day.";

        // Multiplier Defaults
        const mult = {
            sleepEfficiency: 1.0,
            playHappiness: 1.0,
            energyDrain: 1.0,
            exploreRisk: 1.0
        };

        // --- TIME LOGIC ---
        switch (timePhase) {
            case 'DAWN':
                bg = "from-orange-200 to-pink-200";
                flavor = "The sun is rising.";
                mult.energyDrain = 0.8; // Cool morning, easier to work?
                break;
            case 'DAY':
                bg = "from-sky-300 to-blue-100";
                flavor = "Sunlight fills the air.";
                break;
            case 'DUSK':
                bg = "from-purple-300 to-orange-300";
                flavor = "The sun is setting.";
                mult.exploreRisk = 1.2; // Getting darker
                break;
            case 'NIGHT':
                bg = "from-slate-900 to-purple-900";
                flavor = "The stars are out.";
                mult.sleepEfficiency = 1.5; // Deep sleep
                mult.playHappiness = 0.8;   // Too dark to play well
                mult.energyDrain = 1.2;     // Sleepy time
                mult.exploreRisk = 2.0;     // Dangerous!
                break;
        }

        // --- WEATHER & ELEMENTAL RESONANCE ---
        const lowerEl = palElement.toLowerCase();
        const isWaterOrPlant = ['water', 'plant', 'ice', 'tumbuhan', 'air'].includes(lowerEl);
        const isFire = ['fire', 'api', 'flame'].includes(lowerEl);
        const isElectric = ['electric', 'spark', 'lightning'].includes(lowerEl);
        const isDark = ['dark', 'ghost', 'shadow'].includes(lowerEl);
        const isLight = ['light', 'holy', 'wind', 'flying'].includes(lowerEl);

        // DEFAULT BUFFS (Time based)
        if (timePhase === 'DAY' && weather === 'CLEAR') {
            if (isFire) {
                mult.playHappiness *= 1.3; // BUFFED: High reward for sunny days
                mult.energyDrain *= 0.8;
                flavor = "Sunny & Hot! (Fire Bonus)";
            } else if (isLight) {
                mult.playHappiness *= 1.2;
                flavor = "Clear skies! (Wind Bonus)";
            } else if (isDark) {
                // NERF: Vampiric penalty during day
                mult.energyDrain *= 1.1;
                flavor = "Too bright... (Dark Weakness)";
            }
        }
        else if (timePhase === 'NIGHT') {
            if (isDark) {
                mult.playHappiness *= 1.15; // NERFED: More consistent, less OP
                mult.energyDrain *= 0.9;
                flavor = "The shadows dance... (Dark Bonus)";
            }
        }

        if (weather === 'RAIN') {
            bg = timePhase === 'NIGHT' ? "from-gray-900 to-slate-800" : "from-gray-400 to-slate-300";
            overlay = "rain"; // Handle via CSS

            if (isWaterOrPlant) {
                flavor = "They love the rain! (Bonus)";
                mult.playHappiness *= 1.3; // BIG BONUS
                mult.energyDrain *= 0.7;   // Refreshed
            } else if (isFire) {
                flavor = "Fire hates rain... (Penalty)";
                mult.playHappiness *= 0.7; // BUFFED: Less punishing (was 0.5)
                mult.energyDrain *= 1.2;   // Fizzle
            } else if (isElectric) {
                // BUFF: Conductivity check!
                flavor = "Sparks fly in the rain!";
                mult.playHappiness *= 1.1;
                mult.energyDrain *= 0.9;
            } else {
                flavor = "It's raining outside.";
                mult.playHappiness *= 0.8; // Dampener
                mult.sleepEfficiency *= 1.2; // Cozy rain sounds
            }

        } else if (weather === 'STORM') {
            bg = "from-gray-800 to-slate-900";
            overlay = "storm";

            if (isElectric) {
                flavor = "Unlimited Power! (Storm Bonus)";
                mult.playHappiness *= 2.0; // MANIAC (Was 1.5)
                mult.energyDrain *= 0.1;   // Almost infinite energy
            } else {
                flavor = "A Scary Storm!";
                mult.playHappiness *= 0.2; // SCARED
                mult.exploreRisk *= 1.5;
            }
        }

        return { bgGradient: bg, overlay, multipliers: mult, flavorText: flavor };
    };

    const props = getProperties();

    return {
        timePhase,
        weather,
        ...props
    };
};
