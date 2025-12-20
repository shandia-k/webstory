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

export const useCombat = (initialPal, initialEnemy, onCombatEnd) => {
    const [phase, setPhase] = useState(COMBAT_PHASES.INIT);
    const [turn, setTurn] = useState(1);
    const [logs, setLogs] = useState([]);
    const [activeCommand, setActiveCommand] = useState(null); // [NEW] Track command for formula

    // --- COMBATANTS STATE ---
    // We clone initial stats to avoid mutating global state directly during fight
    const [pal, setPal] = useState({
        ...initialPal,
        currentHp: initialPal.role.stats.energy || 100, // Using Energy as HP for now, or need explicit HP? 
        // Let's assume passed palData has HP or we use Energy. 
        // Plan said: HP is HP. Energy is "Stamina".
        // Let's use 'hp' if exists, else 100.
        hp: 100,
        maxHp: 100,
        stats: { ...initialPal.role.stats } // live updates for morale
    });

    const [enemy, setEnemy] = useState({
        ...initialEnemy,
        hp: 150,
        maxHp: 150,
        stats: { def: 15 } // [NEW] Enemy Def for formula (Buffed 10->15)
    });

    // --- DERIVED STATS (Memoized mostly, but re-calc each turn) ---
    const getPalStats = () => calculateStats(null, pal.stats, pal.role.trait);

    const addLog = (text) => setLogs(prev => [...prev, text]);

    // --- TURN MANAGER ---
    useEffect(() => {
        if (phase === COMBAT_PHASES.INIT) {
            addLog(`Encounter started! ${pal.name} vs ${enemy.name}`);
            setPhase(COMBAT_PHASES.PLAYER_DECISION);
        }
    }, [phase]);

    // --- ACTIONS ---

    const handlePlayerCommand = (command) => {
        if (phase !== COMBAT_PHASES.PLAYER_DECISION) return;

        setActiveCommand(command); // Store for damage formula

        // Apply Coaching Effect immediately
        if (command === 'CHEER') {
            addLog("📣 You cheered loudly! Pal's ATK UP, but ACC DOWN.");
            setPal(p => ({ ...p, stats: { ...p.stats, happiness: Math.min(100, p.stats.happiness + 10) } }));
            // Start Pal Turn
            setPhase(COMBAT_PHASES.PAL_ACTION);
        }
        else if (command === 'SCOLD') {
            addLog("💢 You scolded sternly! Pal's ACC UP, MOOD DOWN.");
            setPal(p => ({ ...p, stats: { ...p.stats, happiness: Math.max(0, p.stats.happiness - 15) } }));
            setPhase(COMBAT_PHASES.PAL_ACTION);
        }
        else if (command === 'TREAT') {
            addLog("🍖 You threw a treat! Pal healed, but Enemy attacks!");
            setPal(p => ({
                ...p,
                hp: Math.min(p.maxHp, p.hp + 20),
                stats: {
                    ...p.stats,
                    happiness: Math.min(100, p.stats.happiness + 5),
                    energy: Math.min(100, p.stats.energy + 10) // Snack gives energy
                }
            }));
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
                const action = decidePalAction({ stats: pal.stats, trait: pal.role.trait }, { enemyHp: enemy.hp });

                addLog(`${pal.name} ${action.narration}`);

                if (action.type === 'ATTACK') {
                    // MASTER FORMULA IN ACTION
                    const { damage, isCrit } = calculateMasterDamage(
                        derived,
                        enemy.stats,
                        activeCommand,
                        20 // Base Power
                    );

                    const elLabel = getElementLabel(pal.role.element, enemy.element);

                    setEnemy(prev => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));

                    // COST: 5 Energy per attack
                    setPal(prev => ({ ...prev, stats: { ...prev.stats, energy: Math.max(0, prev.stats.energy - 5) } }));

                    const critText = isCrit ? " (CRITICAL!)" : "";
                    addLog(`💥 HIT! Dealt ${damage} damage.${critText} ${elLabel}`);
                } else if (action.type === 'SLEEP') {
                    setPal(prev => ({ ...prev, stats: { ...prev.stats, energy: Math.min(100, prev.stats.energy + 20) } }));
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
                // Base 10-25 + Element Check
                // Now we use calculateDamage for enemy too!
                const baseEnemyDmg = Math.floor(Math.random() * 15) + 15; // 15 to 30 raw
                const { damage, label } = calculateDamage(enemy.element, pal.role.element, baseEnemyDmg);

                // Check Player Dodge (from Energy)
                const derivedPlayer = getPalStats();
                const hitRoll = Math.random();

                if (hitRoll < derivedPlayer.dodge) {
                    addLog(`💨 DODGED! ${pal.name} avoided the attack.`);
                } else {
                    // Check Vulnerability (Tired Player)
                    const dmgTaken = derivedPlayer.dmgTakenMult ? Math.floor(damage * derivedPlayer.dmgTakenMult) : damage;

                    setPal(prev => ({ ...prev, hp: Math.max(0, prev.hp - dmgTaken) }));
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

    return {
        phase,
        turn,
        logs,
        pal,
        enemy,
        handlePlayerCommand
    };
};
