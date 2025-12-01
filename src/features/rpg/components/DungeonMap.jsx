import React from 'react';

export const DungeonMap = ({ rooms, currentRoomId, visitedIds }) => {
    return (
        <div className="w-full h-full bg-slate-900/90 relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-4 left-4 text-[10px] text-cyan-400 tracking-widest border-b border-cyan-900 pb-1 z-10">TACTICAL MAP</div>
            <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Connections */}
                {Object.entries(rooms).map(([id, room]) => (
                    Object.values(room.exits || {}).map(targetId => {
                        const start = rooms[id];
                        const end = rooms[targetId];
                        // Only draw if both nodes exist and have coordinates
                        if (!start?.x || !end?.x) return null;

                        // Check visibility of connection
                        const isStartVisited = visitedIds.has(id);
                        const isEndVisited = visitedIds.has(targetId);
                        const isVisible = isStartVisited || isEndVisited;

                        if (!isVisible) return null;

                        return (
                            <line
                                key={`${id}-${targetId}`}
                                x1={start.x} y1={start.y}
                                x2={end.x} y2={end.y}
                                stroke={isStartVisited && isEndVisited ? "#1e293b" : "#0f172a"}
                                strokeWidth="2"
                                strokeDasharray={isStartVisited && isEndVisited ? "0" : "4"}
                            />
                        );
                    })
                ))}

                {/* Nodes */}
                {Object.entries(rooms).map(([id, room]) => {
                    if (!room.x || !room.y) return null;
                    const isCurrent = id === currentRoomId;
                    const isVisited = visitedIds.has(id);
                    const hasEnemy = room.enemy;

                    // Fog of War Styles
                    let fill = "#334155";
                    let stroke = "#1e293b";
                    let opacity = 1;

                    if (isCurrent) {
                        fill = "#06b6d4";
                        stroke = "#cffafe";
                    } else if (isVisited) {
                        fill = hasEnemy ? "#ef4444" : "#475569";
                        stroke = hasEnemy ? "#7f1d1d" : "#334155";
                    } else {
                        // Unvisited (Ghost)
                        fill = "transparent";
                        stroke = "#1e293b";
                        opacity = 0.5;
                    }

                    return (
                        <g key={id} style={{ opacity }}>
                            <circle
                                cx={room.x} cy={room.y}
                                r={isCurrent ? 6 : 4}
                                fill={fill}
                                stroke={stroke}
                                strokeWidth="1"
                                className="transition-all duration-500"
                            />
                            {isCurrent && (
                                <circle cx={room.x} cy={room.y} r="8" fill="none" stroke="#06b6d4" strokeWidth="0.5" className="animate-ping" />
                            )}
                            {hasEnemy && isVisited && !isCurrent && (
                                <text x={room.x} y={room.y - 6} fontSize="4" fill="#ef4444" textAnchor="middle">!</text>
                            )}
                            {!isVisited && (
                                <text x={room.x} y={room.y} fontSize="3" fill="#64748b" textAnchor="middle" dy=".3em">?</text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};
