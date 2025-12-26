import { useState, useEffect, useCallback } from 'react';
import { decidePalAction } from '../game-mechanics/CombatAI';
import { calculateStats, calculateMasterDamage, getElementLabel, calculateDamage } from '../game-mechanics/CombatFormulas';
import { GAME_CONTENT } from '../constants/gameContent';

export const COMBAT_PHASES = {
    INIT: 'INIT',
    PLAYER_DECISION: 'PLAYER_DECISION', // Wait for Cheer/Scold/Treat
    PAL_ACTION: 'PAL_ACTION',           // AI Logic runs
    ENEMY_ACTION: 'ENEMY_ACTION',       // Enemy Logic
    VICTORY: 'VICTORY',
    DEFEAT: 'DEFEAT'
};

export const useCombat = (initialPal: any, initialEnemy: any, onCombatEnd: (win: boolean, stats: any) => void) => {
    const [phase, setPhase] = useState(COMBAT_PHASES.INIT);
    const [turn, setTurn] = useState(1);
    const [logs, setLogs] = useState<string[]>([]);
    const [activeCommand, setActiveCommand] = useState<string | null>(null); // [NEW] Track command for formula
    // [NEW] Event stream for UI effects (Popups, shakes)
    const [lastEvent, setLastEvent] = useState<{ id: number; type: 'DAMAGE' | 'HEAL' | 'MISS'; target: 'player' | 'enemy'; value: number; isCrit?: boolean; text?: string } | null>(null);

    // --- COMBATANTS STATE ---
    // We clone initial stats to avoid mutating global state directly during fight
    const [pal, setPal] = useState<any>({
        ...initialPal,
        currentHp: initialPal.role.stats.hp || 100,
        hp: initialPal.role.stats.hp || 100,
        maxHp: initialPal.role.stats.maxHp || 100,
        stats: { ...initialPal.role.stats } // live updates for morale
    });

    const [enemy, setEnemy] = useState<any>({
        ...initialEnemy,
        // [MODIFIED] Use passed stats or fallback to defaults (only if missing)
        hp: initialEnemy.hp || 100,
        maxHp: initialEnemy.maxHp || 100,
        stats: { def: 5, ...initialEnemy.stats }
    });

    // --- DERIVED STATS (Memoized mostly, but re-calc each turn) ---
    const getPalStats = () => calculateStats(null, pal.stats, pal.role.trait);

    const addLog = (text: string) => setLogs(prev => [...prev, text]);

    // --- TURN MANAGER ---
    useEffect(() => {
        if (phase === COMBAT_PHASES.INIT) {
            addLog(`Encounter started! ${pal.name} vs ${enemy.name}`);
            setPhase(COMBAT_PHASES.PLAYER_DECISION);
        }
    }, [phase]);

    // --- ACTIONS ---

    const handlePlayerCommand = (command: string) => {
        if (phase !== COMBAT_PHASES.PLAYER_DECISION) return;

        setActiveCommand(command); // Store for damage formula

        // Apply Coaching Effect immediately
        if (command === 'CHEER') {
            addLog("📣 You cheered loudly! Pal's ATK UP, but ACC DOWN.");
            setPal((p: any) => ({ ...p, stats: { ...p.stats, happiness: Math.min(100, p.stats.happiness + 10) } }));
            // Start Pal Turn
            setPhase(COMBAT_PHASES.PAL_ACTION);
        }
        else if (command === 'SCOLD') {
            addLog("💢 You scolded sternly! Pal's ACC UP, MOOD DOWN.");
            // [NEW] Discipline Gain (+Obedience, -Happiness)
            setPal((p: any) => ({
                ...p,
                stats: {
                    ...p.stats,
                    happiness: Math.max(0, p.stats.happiness - 15),
                    discipline: (p.stats.discipline || 0) + 5
                }
            }));
            setPhase(COMBAT_PHASES.PAL_ACTION);
        }
        else if (command === 'TREAT') {
            addLog("🍖 You threw a treat! Pal healed, but Enemy attacks!");
            setPal((p: any) => ({
                ...p,
                hp: Math.min(p.maxHp, p.hp + 20),
                stats: {
                    ...p.stats,
                    happiness: Math.min(100, p.stats.happiness + 5),
                    energy: Math.min(100, p.stats.energy + 10) // Snack gives energy
                }
            }));
            setLastEvent({ id: Date.now(), type: 'HEAL', target: 'player', value: 20, text: 'Yummy!' });
            // Skip Pal turn, go to Enemy
            setTimeout(() => setPhase(COMBAT_PHASES.ENEMY_ACTION), 1000);
        }
        else if (command === 'WAIT') {
            addLog("... You watch silently.");
            setPhase(COMBAT_PHASES.PAL_ACTION);
        }
    };

    // --- PAL AI TURN ---
    useEffect(() => {
        if (phase === COMBAT_PHASES.PAL_ACTION) {
            const runPalTurn = async () => {
                await new Promise(r => setTimeout(r, 1000)); // Suspense

                const derived = getPalStats();
                // [MODIFIED] Pass level and element for Skill System
                const action = decidePalAction({
                    stats: pal.stats,
                    trait: pal.role.trait,
                    level: pal.stats.level || 1,
                    element: pal.role.element
                }, { enemyHp: enemy.hp });

                addLog(`${pal.name} ${action.narration}`);

                if (action.type === 'SKILL') {
                    const skill = action.skill;

                    if (skill.type === 'DAMAGE') {
                        // MASTER FORMULA IN ACTION
                        const { damage, isCrit } = calculateMasterDamage(
                            derived,
                            enemy.stats,
                            activeCommand,
                            skill.power // Use Skill Power!
                        );

                        const elLabel = getElementLabel(pal.role.element, enemy.element);

                        setEnemy((prev: any) => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));
                        setLastEvent({ id: Date.now(), type: 'DAMAGE', target: 'enemy', value: damage, isCrit, text: skill.name });

                        const critText = isCrit ? " (CRITICAL!)" : "";
                        addLog(`💥 ${skill.name}! Dealt ${damage} damage.${critText} ${elLabel}`);
                    }
                    else if (skill.type === 'HEAL') {
                        const healAmount = skill.power;
                        setPal((prev: any) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmount) }));
                        setLastEvent({ id: Date.now(), type: 'HEAL', target: 'player', value: healAmount, text: skill.name });
                        addLog(`💚 ${skill.name}! Healed ${healAmount} HP.`);
                    }
                    else if (skill.type === 'BUFF') {
                        // TODO: Implement real buffs. For now, just a morale boost.
                        setPal((prev: any) => ({ ...prev, stats: { ...prev.stats, happiness: Math.min(100, prev.stats.happiness + 10) } }));
                        setLastEvent({ id: Date.now(), type: 'HEAL', target: 'player', value: 0, text: 'BUFF!' });
                        addLog(`✨ ${skill.name}! Focused power!`);
                    }

                    // COST
                    setPal((prev: any) => ({ ...prev, stats: { ...prev.stats, energy: Math.max(0, prev.stats.energy - skill.cost) } }));

                } else if (action.type === 'ATTACK') {
                    // Struggle (Fallback)
                    const { damage } = calculateMasterDamage(derived, enemy.stats, activeCommand, 10);
                    setEnemy((prev: any) => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));
                    setLastEvent({ id: Date.now(), type: 'DAMAGE', target: 'enemy', value: damage, text: 'Struggle' });
                    setPal((prev: any) => ({ ...prev, hp: Math.max(0, prev.hp - 2) })); // Recoil damage
                    addLog(`💦 Struggled... Dealt ${damage} damage.`);

                } else if (action.type === 'SLEEP') {
                    setPal((prev: any) => ({ ...prev, stats: { ...prev.stats, energy: Math.min(100, prev.stats.energy + 20) } }));
                    setLastEvent({ id: Date.now(), type: 'HEAL', target: 'player', value: 0, text: 'Zzz...' });
                }

                // Check Win
                if (enemy.hp <= 0) { // Will be caught by next effect, but we can set phase here
                    // handled by effect below
                } else {
                    setTimeout(() => setPhase(COMBAT_PHASES.ENEMY_ACTION), 1500);
                }
            };
            runPalTurn();
        }
    }, [phase]);

    // --- ENEMY AI TURN ---
    useEffect(() => {
        if (phase === COMBAT_PHASES.ENEMY_ACTION) {
            // Check if enemy dead first (race condition safeguard)
            if (enemy.hp <= 0) {
                setPhase(COMBAT_PHASES.VICTORY);
                return;
            }

            const runEnemyTurn = async () => {
                await new Promise(r => setTimeout(r, 1000));

                // Harder Enemy Logic:
                // [MODIFIED] Use enemy's stored ATK stat from scaling
                const baseAtk = enemy.atk || enemy.stats?.atk || 15;
                // High variance: 0.8 to 1.2
                const variance = (Math.random() * 0.4) + 0.8;
                const finalDmg = Math.floor(baseAtk * variance);

                const { damage, label } = calculateDamage(enemy.element, pal.role.element, finalDmg);

                // Check Player Dodge (from Energy)
                const derivedPlayer = getPalStats();
                const hitRoll = Math.random();

                if (hitRoll < derivedPlayer.dodge) {
                    addLog(`💨 DODGED! ${pal.name} avoided the attack.`);
                    setLastEvent({ id: Date.now(), type: 'MISS', target: 'player', value: 0, text: 'MISS' });
                } else {
                    // Check Vulnerability (Tired Player)
                    const dmgTaken = derivedPlayer.dmgTakenMult ? Math.floor(damage * derivedPlayer.dmgTakenMult) : damage;

                    setPal((prev: any) => ({ ...prev, hp: Math.max(0, prev.hp - dmgTaken) }));
                    setLastEvent({ id: Date.now(), type: 'DAMAGE', target: 'player', value: dmgTaken });
                    addLog(`⚔️ Enemy struck! Took ${dmgTaken} damage. ${label}`);
                }

                setTimeout(() => {
                    setPhase(COMBAT_PHASES.PLAYER_DECISION);
                    setTurn(t => t + 1);
                }, 1500);
            };
            runEnemyTurn();
        }
    }, [phase]);

    // --- CHECK WIN/LOSS ---
    useEffect(() => {
        if (enemy.hp <= 0 && phase !== COMBAT_PHASES.VICTORY) {
            setPhase(COMBAT_PHASES.VICTORY);
            addLog("🏆 VICTORY!");
            setTimeout(() => onCombatEnd(true, pal.stats), 2000);
        }
        else if (pal.hp <= 0 && phase !== COMBAT_PHASES.DEFEAT) {
            setPhase(COMBAT_PHASES.DEFEAT);
            addLog("💀 DEFEAT...");
            setTimeout(() => onCombatEnd(false, pal.stats), 2000);
        }
    }, [pal.hp, enemy.hp]);

    // [NEW] ITEM USAGE (Instant)
    const applyItemEffect = (effect: { type: string; value: number }, itemName: string) => {
        if (effect.type === 'HEAL_HP') {
            setPal((prev: any) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + effect.value) }));
            setLastEvent({ id: Date.now(), type: 'HEAL', target: 'player', value: effect.value, text: itemName });
            addLog(`🧪 Used ${itemName}. Restored ${effect.value} HP.`);
        }
        else if (effect.type === 'HEAL_ENERGY') {
            setPal((prev: any) => ({ ...prev, stats: { ...prev.stats, energy: Math.min(100, prev.stats.energy + effect.value) } }));
            setLastEvent({ id: Date.now(), type: 'HEAL', target: 'player', value: 0, text: itemName }); // 0 value for energy popup? Or text is enough.
            addLog(`⚡ Used ${itemName}. Restored ${effect.value} Energy.`);
        }
        else if (effect.type === 'HEAL_HUNGER') {
            // Not really combat relevant but okay
            addLog(`🍔 Used ${itemName}. Yummy!`);
        }
    };

    return {
        phase,
        turn,
        logs,
        pal,
        enemy,
        handlePlayerCommand,
        lastEvent,
        applyItemEffect // [NEW] Expose this
    };
};
