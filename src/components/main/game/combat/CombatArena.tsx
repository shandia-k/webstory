import React, { useState } from 'react';
// [NEW] ITEM Logic
import { Item } from '../../../../types/game';
import { ITEM_DB } from '../../../../game-mechanics/ItemRegistry';
import { useCombat, COMBAT_PHASES } from '../../../../hooks/useCombat.ts';
import CombatHUD from './CombatHUD';
import CoachingMenu from './CoachingMenu';
import NarrativeLog from './NarrativeLog';
import DiceRoller from './DiceRoller';

interface CombatArenaProps {
    palData: any;
    enemyData: any;
    onCombatEnd: (victory: boolean, result: any) => void;
    // [NEW] Inventory
    inventory?: Item[];
    onUpdateInventory?: (newInv: Item[]) => void;
}

const CombatArena: React.FC<CombatArenaProps> = ({ palData, enemyData, onCombatEnd, inventory = [], onUpdateInventory }) => {
    // --- STATE ---
    // [MODIFIED] Destructure applyItemEffect
    const { phase, turn, logs, pal, enemy, handlePlayerCommand, lastEvent, applyItemEffect } = useCombat(palData, enemyData, onCombatEnd);

    // [NEW] UI State
    const [isItemMenuOpen, setIsItemMenuOpen] = useState(false);

    // [NEW] Handle Item Use
    const handleUseCombatItem = (itemObj: Item) => {
        // Find full item data from DB (since Item interface is slim)
        // Actually, our inventory object might be the full GameItem or the simplified one.
        // Let's assume we can match by name or ID if stored?
        // Let's try to match by name lowercased or ID.
        const dbItem = Object.values(ITEM_DB).find(i => i.name === itemObj.name);

        if (dbItem && dbItem.effect && applyItemEffect) {
            // Apply Effect
            applyItemEffect(dbItem.effect, dbItem.name);

            // Consume Item
            if (onUpdateInventory) {
                const idx = inventory.findIndex(i => i.name === itemObj.name);
                if (idx > -1) {
                    const newInv = [...inventory];
                    newInv.splice(idx, 1);
                    onUpdateInventory(newInv);
                }
            }
            setIsItemMenuOpen(false);
        } else {
            console.warn("Item effect not found or invalid", itemObj);
        }
    };

    // [NEW] Visual Effects State
    const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number; text: string; color: string; scale: number }[]>([]);

    // Animation States: 'idle' | 'lunge' | 'hit' | 'dodge'
    const [palAnim, setPalAnim] = useState('idle');
    const [enemyAnim, setEnemyAnim] = useState('idle');

    // [NEW] Handle Phases (Attacks)
    React.useEffect(() => {
        if (phase === COMBAT_PHASES.PAL_ACTION) {
            setPalAnim('lunge');
            setTimeout(() => setPalAnim('idle'), 600); // Reset after anim
        } else if (phase === COMBAT_PHASES.ENEMY_ACTION) {
            setEnemyAnim('lunge');
            setTimeout(() => setEnemyAnim('idle'), 600);
        }
    }, [phase]);

    // [NEW] Handle Events (Reactions)
    React.useEffect(() => {
        if (!lastEvent) return;

        const isPlayer = lastEvent.target === 'player';
        const isCrit = lastEvent.isCrit;
        const color = lastEvent.type === 'HEAL' ? 'text-green-400' : isPlayer ? 'text-red-500' : 'text-yellow-400';

        // Trigger Reaction Animations
        if (lastEvent.type === 'DAMAGE') {
            if (isPlayer) {
                setPalAnim('hit');
                setTimeout(() => setPalAnim('idle'), 500);
            } else {
                setEnemyAnim('hit');
                setTimeout(() => setEnemyAnim('idle'), 500);
            }
        } else if (lastEvent.type === 'MISS') {
            if (isPlayer) {
                setPalAnim('dodge');
                setTimeout(() => setPalAnim('idle'), 500);
            } else {
                setEnemyAnim('dodge');
                setTimeout(() => setEnemyAnim('idle'), 500);
            }
        }

        // Text Content

        // Text Content
        let text = "";
        if (lastEvent.type === 'MISS') text = "MISS";
        else if (lastEvent.text) text = lastEvent.text;
        else text = (lastEvent.value > 0 ? (lastEvent.type === 'HEAL' ? '+' : '-') : '') + lastEvent.value;

        if (isCrit) text += " 💥";

        // Position: 20% left for Player, 80% left for Enemy. Random variance.
        const baseX = isPlayer ? 25 : 75;
        const baseY = 40;

        const newPopup = {
            id: Date.now(),
            x: baseX + (Math.random() * 10 - 5),
            y: baseY + (Math.random() * 10 - 5),
            text,
            color,
            scale: isCrit ? 1.5 : 1.0
        };

        setFloatingTexts(prev => [...prev, newPopup]);

        // Remove popup after 1s
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(p => p.id !== newPopup.id));
        }, 1200);

    }, [lastEvent]);

    const animStyles = `
        @keyframes lunge-right { 0% { transform: translateX(0); } 40% { transform: translateX(150px) scale(1.1); } 100% { transform: translateX(0); } }
        @keyframes lunge-left { 0% { transform: translateX(0); } 40% { transform: translateX(-150px) scale(1.1); } 100% { transform: translateX(0); } }
        
        @keyframes hit-squish { 
            0% { transform: scale(1); } 
            20% { transform: scale(0.7, 1.3) translateX(-10px); filter: brightness(3) sepia(1) hue-rotate(-50deg) saturate(3); } 
            40% { transform: scale(1.1, 0.9) translateX(5px); }
            100% { transform: scale(1); } 
        }

        @keyframes dodge-jump {
            0% { transform: translateY(0); }
            30% { transform: translateY(-30px) translateX(-20px) rotate(-10deg); }
            60% { transform: translateY(0) translateX(-10px); }
            100% { transform: translateX(0); }
        }

        .anim-lunge-right { animation: lunge-right 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
        .anim-lunge-left { animation: lunge-left 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
        .anim-hit { animation: hit-squish 0.5s ease-out; }
        .anim-dodge { animation: dodge-jump 0.5s ease-in-out; }
    `;

    return (
        <div className="w-full h-full flex flex-col items-center justify-between p-2 md:p-4 relative overflow-y-auto md:overflow-hidden no-scrollbar">
            <style>{animStyles}</style>
            {/* --- VISUALS LAYER (Battlefield) --- */}
            {/* This div sits behind everything */}
            {/* This div sits behind everything */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-indigo-900 to-purple-900 opacity-80 z-0 pointer-events-none" />

            {/* --- FLOATING TEXT LAYER (Z-50) --- */}
            {floatingTexts.map(ft => (
                <div
                    key={ft.id}
                    className={`absolute z-50 font-black text-4xl md:text-6xl tracking-widest pointer-events-none animate-in slide-in-from-bottom-5 fade-out duration-1000 ${ft.color}`}
                    style={{
                        left: `${ft.x}%`,
                        top: `${ft.y}%`,
                        textShadow: '2px 2px 0px black',
                        transform: `scale(${ft.scale})`
                    }}
                >
                    {ft.text}
                </div>
            ))}

            {/* --- TOP HUD LAYER --- */}
            <div className="relative md:absolute top-0 left-0 right-0 p-4 flex flex-col gap-2 md:flex-row md:justify-between items-stretch md:items-start z-20 w-full max-w-6xl mx-auto pointer-events-none">
                {/* PLAYER HUD (Top / Left) */}
                <div className="pointer-events-auto animate-in slide-in-from-left duration-700 w-full md:w-auto">
                    <CombatHUD entity={pal} />
                </div>

                {/* ENEMY HUD (Bottom / Right) */}
                <div className="pointer-events-auto animate-in slide-in-from-right duration-700 w-full md:w-auto">
                    <CombatHUD entity={enemy} isEnemy={true} />
                </div>
            </div>

            {/* --- CENTER STAGE (Sprites) --- */}
            <div className="flex-1 w-full max-w-5xl flex items-center justify-between px-10 md:px-20 z-10 mt-4 md:mt-16">
                {/* PLAYER SPRITE (Left) */}
                <div className={`
                    flex flex-col items-center gap-4 transition-all duration-500
                    ${palAnim === 'lunge' ? 'anim-lunge-right' : ''}
                    ${palAnim === 'hit' ? 'anim-hit' : ''}
                    ${palAnim === 'dodge' ? 'anim-dodge' : ''}
                    ${phase === COMBAT_PHASES.DEFEAT ? 'grayscale blur-sm' : ''}
                `}>
                    <div className="text-[60px] md:text-[180px] animate-float drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]">
                        {pal.emoji || pal.role?.emoji || "🐲"}
                    </div>
                </div>

                {/* VS LOGO or TURN INDICATOR */}
                <div className="text-white/20 font-black text-6xl md:text-9xl absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    VS
                </div>

                {/* ENEMY SPRITE (Right) */}
                <div className={`
                    flex flex-col items-center gap-4 transition-all duration-500
                    ${enemyAnim === 'lunge' ? 'anim-lunge-left' : ''}
                    ${enemyAnim === 'hit' ? 'anim-hit' : ''}
                    ${enemyAnim === 'dodge' ? 'anim-dodge' : ''}
                    ${phase === COMBAT_PHASES.VICTORY ? 'opacity-0 scale-50 rotate-180' : ''}
                `}>
                    <div className="text-[60px] md:text-[180px] animate-float drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]" style={{ animationDelay: '1s' }}>
                        {enemy.emoji || "👽"}
                    </div>
                </div>
            </div>

            {/* --- BOTTOM HUD (Player Status & Controls) --- */}
            <div className="w-full max-w-2xl relative z-10 flex flex-col gap-4 animate-in slide-in-from-bottom duration-700 mb-8">

                {/* LOGS */}
                <NarrativeLog logs={logs} />

                <div className="flex gap-4 items-end justify-center">
                    {/* ACTION DECK */}
                    <div className="flex-1 max-w-lg">
                        <CoachingMenu
                            onCommand={handlePlayerCommand}
                            onItemClick={() => setIsItemMenuOpen(true)}
                            disabled={phase !== COMBAT_PHASES.PLAYER_DECISION}
                        />

                        {/* [NEW] MINI ITEM MENU OVERLAY */}
                        {isItemMenuOpen && (
                            <div className="absolute bottom-24 left-0 right-0 bg-white/95 border border-gray-200 shadow-xl rounded-2xl p-4 animate-in slide-in-from-bottom-5">
                                <div className="flex justify-between items-center mb-2 border-b pb-2">
                                    <h4 className="font-bold text-gray-700">Select Item</h4>
                                    <button onClick={() => setIsItemMenuOpen(false)} className="text-red-500 font-bold px-2">Cancel</button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                    {inventory.filter(i => Object.values(ITEM_DB).find(d => d.name === i.name)?.type === 'CONSUMABLE').length === 0 && (
                                        <p className="col-span-2 text-center text-gray-400 py-2">No Consumables</p>
                                    )}
                                    {inventory.map((item, idx) => {
                                        // Filter only consumables
                                        const dbItem = Object.values(ITEM_DB).find(d => d.name === item.name);
                                        if (dbItem?.type !== 'CONSUMABLE') return null;

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleUseCombatItem(item)}
                                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-50 border border-gray-100 text-left transition-colors"
                                            >
                                                <span>{item.icon}</span>
                                                <span className="text-sm font-bold text-gray-700 truncate">{item.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- OVERLAYS --- */}
            {/* Victory/Defeat Screens could go here, or handled by AdventureEngine switching views */}
            {phase === COMBAT_PHASES.VICTORY && (
                <div className="absolute inset-0 bg-yellow-400/20 backdrop-blur-sm z-50 flex items-center justify-center animate-in zoom-in duration-300">
                    <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-xl stroke-black">VICTORY!</h1>
                </div>
            )}
            {phase === COMBAT_PHASES.DEFEAT && (
                <div className="absolute inset-0 bg-red-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in zoom-in duration-300">
                    <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-xl">DEFEATED...</h1>
                </div>
            )}

            {/* --- DICE ROLLER --- */}
            {/* Only show if we decide to visualize RNG, currently useCombat handles RNG internally */}
            {/* <DiceRoller /> */}

        </div>
    );
};

export default CombatArena;
