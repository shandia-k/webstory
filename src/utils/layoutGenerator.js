/**
 * Calculates global coordinates for rooms based on an 8x8 Sector Grid system.
 * 
 * @param {Object} sector - The current sector coordinates { x: 0, y: 0 }.
 * @param {Array} rooms - List of rooms with local 8x8 grid coordinates (x: 0-7, y: 0-7).
 * @returns {Array} - Rooms with updated global 'x' and 'y' for rendering.
 */
export const applyGridCoordinates = (sector, rooms) => {
    if (!rooms || !Array.isArray(rooms)) {
        console.warn("applyGridCoordinates: 'rooms' is invalid", rooms);
        return [];
    }
    if (!sector) {
        console.warn("applyGridCoordinates: 'sector' is missing, defaulting to {x:0, y:0}");
        sector = { x: 0, y: 0 };
    }

    const GRID_SIZE = 15; // Distance between nodes
    const SECTOR_SIZE = 8; // 8x8 Grid

    // Global Offset for this Sector
    // Sector (0,0) starts at Global (0,0)
    // Sector (1,0) starts at Global (8 * GRID_SIZE, 0)
    const sectorOffsetX = (sector.x || 0) * SECTOR_SIZE * GRID_SIZE;
    const sectorOffsetY = (sector.y || 0) * SECTOR_SIZE * GRID_SIZE;

    return rooms.map(room => {
        // Default to 0,0 if missing (shouldn't happen with strict prompt)
        const localX = room.coordinates?.x || 0;
        const localY = room.coordinates?.y || 0;

        return {
            ...room,
            x: sectorOffsetX + (localX * GRID_SIZE),
            y: sectorOffsetY + (localY * GRID_SIZE),
            // Keep local coords for reference if needed
            localCoordinates: { x: localX, y: localY }
        };
    });
};

/**
 * Calculates the Next Sector's coordinates based on the Exit Direction.
 * @param {Object} currentSector - { x, y }
 * @param {string} direction - 'north', 'south', 'east', 'west'
 * @returns {Object} - New Sector { x, y }
 */
export const getNextSectorCoordinates = (currentSector, direction) => {
    const next = { ...currentSector };
    const dir = direction.toLowerCase();

    if (dir === 'north') next.y -= 1;
    if (dir === 'south') next.y += 1;
    if (dir === 'east') next.x += 1;
    if (dir === 'west') next.x -= 1;

    return next;
};
