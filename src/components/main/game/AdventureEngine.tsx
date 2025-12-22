import React, { useState, useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { generateAdventure } from '../../../services/llmService';
import { GAME_CONTENT } from '../../../constants/gameContent';
import AdventureUI from './adventure/AdventureUI';
import CombatArena from './combat/CombatArena'; // [NEW] Integrated Combat
// @ts-ignore - LevelingSystem is now .ts, this ignore can be removed soon
import { calculateXpGain, getLevelUpBonuses } from '../../../game-mechanics/LevelingSystem.ts';
import { Pal } from '../../../types/game';
import { AdventureScene } from '../../../types/api';
// [NEW] Dynamic Scaling
import { scaleEnemyStats, calculateDynamicXp } from '../../../game-mechanics/CombatScaling';

interface Enemy {
    name: string;
    emoji: string;
    element?: string;
    hp: number;
    maxHp: number;
    atk?: number;
    level?: number;
    xpReward?: number;
    stats?: {
        def: number;
        atk: number;
    };
    isBoss?: boolean;
}

// [NEW] Imports
import { Item } from '../../../types/game';

interface AdventureEngineProps {
    palData: Pal;
    onReturn: (results: { stats: any; loot: number }) => void;
    genre: string;
    intent: string;
    inventory?: Item[];
    onUpdateInventory?: (newInv: Item[]) => void;
}

const AdventureEngine: React.FC<AdventureEngineProps> = ({ palData, onReturn, genre, intent = 'scavenge', inventory = [], onUpdateInventory }) => {
    const { apiKey, uiText, language, campaign, setCampaign } = useGame(); // Removed genre from context
    const activeGenre = genre || "sci-fi";

    // --- 1. STATE MANAGEMENT ---
    // [NEW] Tracking full stats locally during adventure
    // [NEW] Tracking full stats locally during adventure
    // @ts-ignore
    const [currentStats, setCurrentStats] = useState<any>({
        ...palData?.role?.stats, // Spread ALL stats (maxHp, atk, def, level)
        // Ensure defaults if missing
        happiness: palData?.role?.stats?.happiness || 50,
        energy: palData?.role?.stats?.energy || 80,
        hunger: palData?.role?.stats?.hunger || 50,
        xp: palData?.role?.stats?.xp || 0,
        level: palData?.role?.stats?.level || 1,
        maxHp: palData?.role?.stats?.maxHp || 100,
        hp: palData?.role?.stats?.hp || palData?.role?.stats?.maxHp || 100,
        atk: palData?.role?.stats?.atk || (15 + (palData?.role?.stats?.level || 1) * 2),
        def: palData?.role?.stats?.def || (10 + (palData?.role?.stats?.level || 1) * 1)
    });

    const [maxHp] = useState(palData?.role?.stats?.maxHp || 100); // Visual max for UI bars
    const [loot, setLoot] = useState(0);

    // PROGRESSION STATE
    const sectorNameSet = React.useRef(false);
    const [sectorName, setSectorName] = useState("Unknown Sector");
    const [showChapterTitle, setShowChapterTitle] = useState(false);
    const [bgGradient, setBgGradient] = useState("from-indigo-900 to-purple-900");

    // STORY ENGINE
    const [storyBuffer, setStoryBuffer] = useState<AdventureScene[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // --- COMBAT STATE ---
    const [combatMode, setCombatMode] = useState(false);
    const [activeEnemy, setActiveEnemy] = useState<Enemy | null>(null); // Full enemy object for CombatArena

    // @ts-ignore -- converting set/array to string
    const activeEmoji: string = palData?.role?.emoji ? (Array.from(palData.role.emoji)[0] as string) : "🤖";

    // --- REAL AI GENERATOR ---
    const initialized = React.useRef(false);
    const campaignUpdateRef = React.useRef<{ advanceChapter: boolean; historyEntry: string } | null>(null);

    const initAdventure = async () => {
        setIsLoading(true);
        setStoryBuffer([]);
        setCurrentStep(0);

        try {
            // Call AI
            let data;
            // [NEW] PERSISTENCE CHECK: If we have a pending story mission and intent is 'story', load it.
            if (intent === 'story' && campaign.pendingMission) {
                console.log("Loading Pending Mission...");
                data = campaign.pendingMission;
            } else {
                data = await generateAdventure(apiKey, palData, activeGenre, language, campaign, intent);
            }

            if (data && data.scenes) {
                setSectorName(data.sector || "Mystery Zone");
                setBgGradient(data.theme_color || "from-indigo-900 to-purple-900");
                campaignUpdateRef.current = data.campaignUpdate || null;

                // --- SYSTEM RNG COMBAT INJECTION ---
                let rawScenes = data.scenes || [];
                const enemy = data.enemy;

                if (enemy && rawScenes.length > 0) {
                    const roll = Math.random();
                    // 80% chance to add fight option (Increased from 50%)
                    if (roll < 0.8) {
                        const conflictIndex = rawScenes.findIndex((s: AdventureScene) => s.type === 'conflict');
                        const targetIndex = conflictIndex !== -1 ? conflictIndex : Math.floor(rawScenes.length / 2);

                        // Ensure we don't accidentally target the very last scene or out of bounds
                        const safeIndex = Math.min(targetIndex, rawScenes.length - 2);
                        const actualIndex = safeIndex >= 0 ? safeIndex : 0;

                        if (rawScenes[actualIndex]) {
                            rawScenes[actualIndex].choices.push({
                                label: `Fight ${enemy.name}!`,
                                isCombat: true,
                                combatDetails: enemy
                            });
                            rawScenes[actualIndex].visual = enemy.emoji || "⚔️";
                        }
                    }
                }

                // [NEW] Save Major Missions immediately so they persist until beaten
                if (data.campaignUpdate && setCampaign) {
                    setCampaign(prev => ({
                        ...prev,
                        pendingMission: data
                    }));
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
    const handleChoice = (choice: any) => {
        // [NEW] Update full stats based on choice effect
        if (choice.effect) {
            const fx = choice.effect;
            setCurrentStats((prev: any) => ({
                ...prev,
                energy: Math.min(100, Math.max(0, prev.energy + (fx.hp || 0))), // Mapping "hp" effect to energy
                happiness: Math.min(100, Math.max(0, prev.happiness + (fx.happiness || fx.happy || 0))),
            }));
            if (fx.loot) setLoot(p => p + fx.loot);
        }

        if (choice.isReturn) {
            finishAdventure();
        } else if (choice.isCombat) {
            startCombat(choice.combatDetails);
        } else {
            if (currentStep < storyBuffer.length - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                finishAdventure();
            }
        }
    };

    const finishAdventure = () => {
        // [NEW] Update Campaign Progress
        if (setCampaign && campaign.isActive) {
            const lastScene = storyBuffer[storyBuffer.length - 1];
            // Only advance if explicitly requested by AI or fallback to minor update logic?
            // BETTER: Use the AI's campaignUpdate if present.

            if (campaignUpdateRef.current && campaignUpdateRef.current.advanceChapter) {
                setCampaign(prev => ({
                    ...prev,
                    currentChapter: prev.currentChapter + 1,
                    historySummary: [...prev.historySummary, `Chapter ${prev.currentChapter}: ${campaignUpdateRef.current?.historyEntry || "Completed a crucial mission."}`],
                    pendingMission: null // [NEW] Clear pending mission on success
                }));
            }
        }
        onReturn({ stats: currentStats, loot });
    };

    const startCombat = (enemyData: any) => {
        // Validate Emoji
        let validEmoji = enemyData?.emoji;
        if (!validEmoji || validEmoji.length > 5) {
            validEmoji = GAME_CONTENT.COMBAT.DEFAULT_ENEMY.EMOJI;
        }

        // [MODIFIED] Dynamic Scaling
        const playerLevel = currentStats.level || 1;
        // Determine isBoss based on intent or name? For now, simplistic check or passed flag.
        // Assuming intent='story' might be boss? Or just randomness.
        const isBoss = enemyData.isBoss || enemyData.name.toUpperCase().includes("BOSS");

        const scaled = scaleEnemyStats(playerLevel, isBoss);

        setActiveEnemy({
            name: enemyData?.name || GAME_CONTENT.COMBAT.DEFAULT_ENEMY.NAME,
            emoji: validEmoji,
            element: enemyData?.element || GAME_CONTENT.COMBAT.DEFAULT_ENEMY.ELEMENT,
            // [NEW] SCALED STATS
            hp: scaled.maxHp,
            maxHp: scaled.maxHp,
            atk: scaled.atk,
            stats: {
                def: scaled.def,
                atk: scaled.atk
            },
            level: scaled.level, // Store level for XP calc
            xpReward: scaled.xpReward
        });
        setCombatMode(true);
    };

    const handleCombatEnd = (victory: boolean, finalStats: any) => {
        setCombatMode(false);
        // Don't clear activeEnemy yet if we need stats? 
        // Actually, we can clear it at the end of function or let it be.
        // But the previous code cleared it first.
        // Let's grab the reward BEFORE clearing.
        const reward = activeEnemy ? { ...activeEnemy } : null;
        setActiveEnemy(null);

        // finalStats is the object { happiness, energy, hunger } from simple combat
        let statsAfterCombat = {
            ...currentStats,
            ...finalStats
        };

        if (victory) {
            // [NEW] XP GAIN SYSTEM (DYNAMIC)
            // Use activeEnemy state (which might be null now? No, we need to capture it before clearing or use closure)
            // Wait, setActiveEnemy(null) happens at start of this function.
            // But we can pass the enemy object/stats into this function? 
            // Better: use `activeEnemy` state directly BEFORE clearing it?
            // React state update is async/batched. `activeEnemy` here is strictly the state from render.
            // Actually, handleCombatEnd is closure over render scope. `activeEnemy` is stale if we don't be careful?
            // No, functions close over the value at creation.
            // But activeEnemy is set to null in line 187.
            // So we should capture xpReward before clearing.

            // Actually: we can read from `activeEnemy` stored in state because `handleCombatEnd` is called from child `CombatArena` 
            // while `AdventureEngine` is mounted. The `activeEnemy` variable in scope is correct?
            // Wait, `handleCombatEnd` is defined in render. If it's called, `activeEnemy` should be the enemy we fought.

            const earnedXp = reward
                ? calculateDynamicXp(statsAfterCombat.level || 1, reward.level || 1, reward.xpReward || 50)
                : 50;

            const { level, xp, didLevelUp } = calculateXpGain(
                statsAfterCombat.level || 1,
                statsAfterCombat.xp || 0,
                earnedXp
            );

            statsAfterCombat.level = level;
            statsAfterCombat.xp = xp;

            if (didLevelUp) {
                const bonuses = getLevelUpBonuses(level);
                statsAfterCombat = { ...statsAfterCombat, ...bonuses };
                // hp is now part of bonuses? No, bonuses has maxHp, energy, happiness. 
                // Let's ensure hp is also healed to full.
                statsAfterCombat.hp = bonuses.maxHp;
            }

            // [NEW] Sync Pal stats from battle result
            setCurrentStats(statsAfterCombat);

            // Allow player to continue story
            if (currentStep < storyBuffer.length - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                finishAdventure();
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
                {/* COMBAT ARENA */}
                {combatMode && activeEnemy && (
                    <CombatArena
                        palData={{ ...palData, role: { ...palData.role, stats: currentStats } }} // Pass current session stats
                        enemyData={activeEnemy}
                        onCombatEnd={handleCombatEnd}
                        // [NEW] ITEMS
                        inventory={inventory}
                        onUpdateInventory={onUpdateInventory}
                    />
                )}</div>
        );
    }

    return (
        <AdventureUI
            isLoading={isLoading}
            genre={activeGenre}
            activeEmoji={activeEmoji}
            bgGradient={bgGradient}
            showChapterTitle={showChapterTitle}
            chapter={campaign.currentChapter}
            sectorName={sectorName}
            uiText={uiText}
            // Passing Actual HP
            hp={currentStats.hp}
            maxHp={maxHp}
            loot={loot}
            currentScene={currentScene}
            onChoice={handleChoice}
            onReturn={() => onReturn({ stats: currentStats, loot })}
            // Default props for legacy/unused internal combat mode
            combatMode={false}
            shake={false}
            enemy={null}
            combatLog=""
            playerTurn={false}
            onCombatAction={() => { }}
            // @ts-ignore
            playerElement={palData?.role?.element || palData?.element || "api"}
        />
    );
};

export default AdventureEngine;
