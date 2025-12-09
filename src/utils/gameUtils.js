// Utility to calculate new stats
export const calculateNewStats = (prevStats, updates) => {
    const newStats = { ...prevStats };
    Object.entries(updates).forEach(([key, val]) => {
        // Modified: Allow adding new dynamic stats if they don't exist
        if (newStats[key] !== undefined) {
            newStats[key] = Math.max(0, Math.min(100, newStats[key] + val));
        } else {
            // New stat discovered
            newStats[key] = Math.max(0, Math.min(100, val));
        }
    });
    return newStats;
};
