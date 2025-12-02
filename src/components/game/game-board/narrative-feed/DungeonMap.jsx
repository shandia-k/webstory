import React from 'react';

export const DungeonMap = ({ rooms, currentRoomId, visitedIds }) => {
    return (
        <div className="w-full h-full bg-theme-panel/90 relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-4 left-4 text-[10px] text-theme-accent tracking-widest border-b border-theme-border pb-1 z-10 font-bold">TACTICAL MAP</div>
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
                                className={`${isStartVisited && isEndVisited ? "stroke-theme-border" : "stroke-theme-muted/20"}`}
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

                    // Determine classes based on state
                    let circleClasses = "transition-all duration-500 ";
                    let radius = isCurrent ? 6 : 4;

                    if (isCurrent) {
                        circleClasses += "fill-theme-accent stroke-theme-text";
                    } else if (isVisited) {
                        circleClasses += hasEnemy ? "fill-red-500 stroke-red-900" : "fill-theme-muted stroke-theme-border";
                    } else {
                        // Unvisited (Ghost)
                        circleClasses += "fill-transparent stroke-theme-muted/30 opacity-50";
                    }

                    return (
                        <g key={id}>
                            <circle
                                cx={room.x} cy={room.y}
                                r={radius}
                                strokeWidth="1"
                                className={circleClasses}
                            />
                            {isCurrent && (
                                <circle cx={room.x} cy={room.y} r="6" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-theme-accent">
                                    <animate attributeName="r" from="6" to="12" dur="1.5s" begin="0s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" from="1" to="0" dur="1.5s" begin="0s" repeatCount="indefinite" />
                                </circle>
                            )}
                            {hasEnemy && isVisited && !isCurrent && (
                                <text x={room.x} y={room.y - 6} fontSize="4" fill="currentColor" className="text-red-500" textAnchor="middle">!</text>
                            )}
                            {!isVisited && (
                                <text x={room.x} y={room.y} fontSize="3" fill="currentColor" className="text-theme-muted" textAnchor="middle" dy=".3em">?</text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div >
    );
};
