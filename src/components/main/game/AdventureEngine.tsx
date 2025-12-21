import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import LoadingDisplay from './adventure/LoadingDisplay';
import AdventureUI from './adventure/AdventureUI';
import CombatArena from './combat/CombatArena';

import { generateAdventure } from '../../../services/llmService';
import { useGameStore } from '../../../store/useGameStore';

interface AdventureEngineProps {
    palData: any; // Legacy format: { name, role: { stats: ... } }
    onReturn: (results: { hp: number; loot?: number; stats?: any }) => void;
    genre: string;
}

const AdventureEngine: React.FC<AdventureEngineProps> = ({ palData, onReturn, genre }) => {
    // --- STORE ---
    const { settings, player } = useGameStore();
    const { apiKey, language } = settings;

    // --- LOCAL STATE (Adventure Session) ---
    // We maintain local state for the duration of the adventure session
    const [loading, setLoading] = useState(true);
    const [adventureData, setAdventureData] = useState<any>(null);
    const [sceneIndex, setSceneIndex] = useState(0);
    const [combatActive, setCombatActive] = useState(false);
    const [currentStats, setCurrentStats] = useState(palData.role.stats); // Snapshot start stats
    const [lootBag, setLootBag] = useState(0);

    const fetchedRef = useRef(false);

    // --- 1. INITIALIZE ADVENTURE ---
    useEffect(() => {
        const initAdventure = async () => {
            if (fetchedRef.current) return;
            fetchedRef.current = true;

            try {
                setLoading(true);
                // Use player from store if available for most up-to-date stats
                const effectivePalData = player ? { name: player.name, role: { stats: player.stats } } : palData;

                // Pass null for campaignState for now (Store implementation pending)
                const data = await generateAdventure(apiKey, effectivePalData, genre, language, null);
                setAdventureData(data);
            } catch (error) {
                console.error("Adventure Init Failed", error);
                // Fallback handled inside service, but double check
                setAdventureData({
                    sector: "Error Void",
                    scenes: [{ type: 'ending', text: "Failed to load adventure.", visual: "❌", choices: [{ label: "Return", isReturn: true }] }]
                });
            } finally {
                setLoading(false);
            }
        };

        initAdventure();
    }, [apiKey, genre, language, palData, player]);

    // --- HANDLERS ---
    const handleChoice = (choice: any) => {
        // 1. Apply Effects
        if (choice.effect) {
            if (choice.effect.hp) {
                setCurrentStats((prev: any) => ({
                    ...prev,
                    hp: Math.max(0, Math.min(prev.maxHp, prev.hp + choice.effect.hp))
                }));
            }
            if (choice.effect.loot) {
                setLootBag(prev => prev + choice.effect.loot);
            }
        }

        // 2. Check for Return
        if (choice.isReturn) {
            onReturn({
                hp: currentStats.hp,
                loot: lootBag,
                stats: currentStats
            });
            return;
        }

        // 3. Check for Combat Trigger (Implicit in scene type or explicit flag)
        // For now, simple scene progression
        const nextIndex = sceneIndex + 1;
        if (adventureData && nextIndex < adventureData.scenes.length) {
            setSceneIndex(nextIndex);

            // Auto-trigger combat if next scene is conflict (Mock logic)
            if (adventureData.scenes[nextIndex].type === 'conflict') {
                 // In full implementation, we would switch to CombatArena here
                 // setCombatActive(true);
            }
        } else {
            // Fallback end
            onReturn({ hp: currentStats.hp, loot: lootBag, stats: currentStats });
        }
    };

    if (loading) return <LoadingDisplay />;

    if (!adventureData) return <div className="text-white">Failed to load.</div>;

    const currentScene = adventureData.scenes[sceneIndex];

    // --- RENDER ---
    return (
        <div className="w-full h-full relative">
            {combatActive ? (
                <CombatArena
                    playerStats={currentStats}
                    enemyData={{
                        name: "Wild Enemy",
                        hp: 50, maxHp: 50,
                        element: "api",
                        emoji: "👹"
                    }}
                    onCombatEnd={(result, loot) => {
                        setCombatActive(false);
                        if (result === 'win') {
                            // Apply loot/xp locally
                            if (loot) setLootBag(prev => prev + (loot.gold || 0));
                            // Maybe heal slightly?
                        } else {
                            // Loss logic - return empty handed?
                            onReturn({ hp: 0, loot: 0, stats: currentStats });
                        }
                    }}
                />
            ) : (
                <AdventureUI
                    scene={currentScene}
                    onChoice={handleChoice}
                    stats={currentStats}
                    loot={lootBag}
                    sectorName={adventureData.sector}
                    themeColor={adventureData.theme_color}
                />
            )}
        </div>
    );
};

export default AdventureEngine;
