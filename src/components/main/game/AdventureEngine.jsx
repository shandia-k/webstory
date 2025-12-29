import React, { useState, useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { generateAdventure } from '../../../services/llmService';
import { GAME_CONTENT } from '../../../constants/gameContent';
import AdventureUI from './adventure/AdventureUI';
import CombatArena from './combat/CombatArena'; // [NEW] Integrated Combat
import { calculateXpGain, getLevelUpBonuses, calculateCombatRewards } from '../../../game-mechanics/LevelingSystem';

const AdventureEngine = ({ palData, onReturn, genre }) => {
    const { apiKey, genre: contextGenre, uiText, language } = useGame();
    const activeGenre = genre || contextGenre || "sci-fi";

    // --- 1. STATE MANAGEMENT ---
    // [NEW] Tracking full stats locally during adventure
    const [currentStats, setCurrentStats] = useState({
        happiness: palData?.role?.stats?.happiness || 50,
        energy: palData?.role?.stats?.energy || 80,
        hunger: palData?.role?.stats?.hunger || 50,
        xp: palData?.role?.stats?.xp || 0,
        level: palData?.role?.stats?.level || 1
    });

    const [maxHp] = useState(100); // Visual max for UI bars
    const [loot, setLoot] = useState(0);

    // PROGRESSION STATE
    const [chapter, setChapter] = useState(1);
    const [sectorName, setSectorName] = useState("Unknown Sector");
    const [showChapterTitle, setShowChapterTitle] = useState(false);
    const [bgGradient, setBgGradient] = useState("from-indigo-900 to-purple-900");

    // STORY ENGINE
    const [storyBuffer, setStoryBuffer] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // --- COMBAT STATE ---
    const [combatMode, setCombatMode] = useState(false);
    const [activeEnemy, setActiveEnemy] = useState(null); // Full enemy object for CombatArena

    const activeEmoji = palData?.role?.emoji ? Array.from(palData.role.emoji)[0] : "🤖";

    // --- REAL AI GENERATOR ---
    const initialized = React.useRef(false);

    const initAdventure = async () => {
        setIsLoading(true);
        setStoryBuffer([]);
        setCurrentStep(0);

        try {
            // Call AI
            const data = await generateAdventure(apiKey, palData, activeGenre, language);

            if (data && data.scenes) {
                setSectorName(data.sector || "Mystery Zone");
                setBgGradient(data.theme_color || "from-indigo-900 to-purple-900");

                // --- SYSTEM RNG COMBAT INJECTION ---
                let rawScenes = data.scenes || [];
                const enemy = data.enemy;

                if (enemy && rawScenes.length > 0) {
                    const roll = Math.random();
                    // 50% chance to add fight option to a "conflict" scene
                    if (roll > 0.5) {
                        const conflictIndex = rawScenes.findIndex(s => s.type === 'conflict');
                        const targetIndex = conflictIndex !== -1 ? conflictIndex : Math.floor(rawScenes.length / 2);

                        if (targetIndex >= 0 && targetIndex < rawScenes.length - 1) {
                            rawScenes[targetIndex].choices.push({
                                label: `Fight ${enemy.name}!`,
                                isCombat: true,
                                combatDetails: enemy
                            });
                            rawScenes[targetIndex].visual = enemy.emoji || "⚔️";
                        }
                    }
                }

                setStoryBuffer(rawScenes);
                setShowChapterTitle(true);
                setTimeout(() => setShowChapterTitle(false), 2500);
            }
        } catch (e) {
            console.error("Adventure Load Failed", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            initAdventure();
        }
    }, []);

    // --- LOGIC HANDLERS ---
    // ⚡ Bolt Optimization: Memoize callback passed to AdventureUI.
    // Prevents massive UI re-renders on minor engine state changes.
    const handleChoice = useCallback((choice) => {
        // [NEW] Update full stats based on choice effect
        if (choice.effect) {
            const fx = choice.effect;
            setCurrentStats(prev => ({
                ...prev,
                energy: Math.min(100, Math.max(0, prev.energy + (fx.hp || 0))), // Mapping "hp" effect to energy
                happiness: Math.min(100, Math.max(0, prev.happiness + (fx.happiness || 0))),
            }));
            if (fx.loot) setLoot(p => p + fx.loot);
        }

        if (choice.isReturn) {
            onReturn({ stats: currentStats, loot });
        } else if (choice.isCombat) {
            startCombat(choice.combatDetails);
        } else {
            if (currentStep < storyBuffer.length - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                onReturn({ stats: currentStats, loot });
            }
        }
    }, [currentStats, loot, onReturn, currentStep, storyBuffer]);

    const startCombat = (enemyData) => {
        // Validate Emoji
        let validEmoji = enemyData?.emoji;
        if (!validEmoji || validEmoji.length > 5) {
            validEmoji = GAME_CONTENT.COMBAT.DEFAULT_ENEMY.EMOJI;
        }

        // [NEW] Dynamic Enemy Stats
        const playerLevel = currentStats.level || 1;
        // Enemy Level is Player Level +/- 1
        const enemyLevel = Math.max(1, playerLevel + (Math.floor(Math.random() * 3) - 1));
        const difficulty = 1.0; // Standard for now

        const rewards = calculateCombatRewards(enemyLevel, difficulty);

        setActiveEnemy({
            name: enemyData?.name || GAME_CONTENT.COMBAT.DEFAULT_ENEMY.NAME,
            emoji: validEmoji,
            element: enemyData?.element || GAME_CONTENT.COMBAT.DEFAULT_ENEMY.ELEMENT,
            hp: 150,
            maxHp: 150,
            level: enemyLevel,
            difficulty: difficulty,
            rewards: rewards
        });
        setCombatMode(true);
    };

    const handleCombatEnd = (victory, finalStats) => {
        setCombatMode(false);
        setActiveEnemy(null);

        // finalStats is the object { happiness, energy, hunger } from simple combat
        let statsAfterCombat = {
            ...currentStats,
            ...finalStats
        };

        if (victory) {
            // [NEW] XP GAIN SYSTEM
            // Use dynamic reward if available, else fallback to 50
            const xpGained = activeEnemy?.rewards?.xp || 50;
            const { level, xp, didLevelUp } = calculateXpGain(
                statsAfterCombat.level || 1,
                statsAfterCombat.xp || 0,
                xpGained
            );

            statsAfterCombat.level = level;
            statsAfterCombat.xp = xp;

            if (didLevelUp) {
                const bonuses = getLevelUpBonuses(level);
                // Apply bonuses (MaxHP matches logic elsewhere, but ensure we update current values if full heal)
                statsAfterCombat.maxHp = bonuses.maxHp;
                statsAfterCombat.energy = bonuses.energy; // Refill on Level Up!
                statsAfterCombat.happiness = bonuses.happiness; // Full Heal!
                // We could show a toast here via a callback or local state if we wanted
            }

            // [NEW] Sync Pal stats from battle result
            setCurrentStats(statsAfterCombat);

            // Allow player to continue story
            if (currentStep < storyBuffer.length - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                onReturn({ stats: statsAfterCombat, loot: loot + 50 });
            }
        } else {
            // Defeat - Return immediately with penalty
            const penaltyStats = {
                ...statsAfterCombat,
                happiness: Math.max(0, statsAfterCombat.happiness - 20),
                energy: Math.max(0, statsAfterCombat.energy - 10)
            };
            onReturn({
                stats: penaltyStats,
                loot: Math.floor(loot / 2)
            });
        }
    };

    // --- RENDER ---
    const currentScene = storyBuffer[currentStep];

    // [NEW] Combat Arena Overlay
    if (combatMode) {
        return (
            <div className="absolute inset-0 z-50">
                <CombatArena
                    palData={{ ...palData, role: { ...palData.role, stats: currentStats } }} // Pass current session stats
                    enemyData={activeEnemy}
                    onCombatEnd={handleCombatEnd}
                />
            </div>
        );
    }

    return (
        <AdventureUI
            isLoading={isLoading}
            genre={activeGenre}
            activeEmoji={activeEmoji}
            bgGradient={bgGradient}
            showChapterTitle={showChapterTitle}
            chapter={chapter}
            sectorName={sectorName}
            uiText={uiText}
            // Passing Energy as HP for visual bar consistency
            hp={currentStats.energy}
            maxHp={maxHp}
            loot={loot}
            currentScene={currentScene}
            onChoice={handleChoice}
            onReturn={() => onReturn({ stats: currentStats, loot })}
        />
    );
};

export default AdventureEngine;
