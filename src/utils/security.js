/**
 * Security utilities for sanitizing sensitive data.
 */

const REDACTED_LABEL = '[REDACTED]';
const CIRCULAR_LABEL = '[CIRCULAR]';

/**
 * Recursively sanitizes data to remove sensitive information.
 * Handles circular references to prevent stack overflow.
 * @param {any} data - The data to sanitize (object, array, string, etc.)
 * @param {string[]} secrets - Array of sensitive strings to redact (e.g. API keys)
 * @param {WeakSet} visited - Internal use for cycle detection
 * @returns {any} - The sanitized data
 */
export const sanitizeData = (data, secrets = [], visited = new WeakSet()) => {
    if (!data) return data;
    if (typeof data !== 'object' && secrets.length === 0) return data;

    // Filter out empty secrets and short strings that might cause false positives
    const activeSecrets = secrets.filter(s => s && typeof s === 'string' && s.length > 5);

    // If no secrets and no object (and not null), return as is
    // But if it IS an object, we still need to clone/traverse to handle potential cycles if we were doing deep clone,
    // but here we are sanitizing.
    // If there are no secrets, do we need to traverse?
    // If the goal is JUST redaction, we could return data.
    // BUT `sanitizeData` might also be relied upon to produce a JSON-safe object (removing cycles) for logging?
    // The previous implementation returned `data` if `secrets.length === 0`.
    // "if (activeSecrets.length === 0) return data;"
    // If we return raw data with cycles, JSON.stringify (used in logs) will throw.
    // So we SHOULD handle cycles regardless of secrets.

    // However, to minimize changes and side effects, I will keep the "no secrets = no change" optimization
    // UNLESS the caller *expects* cycle removal.
    // The `saveDebugLog` uses `JSON.stringify`. If `sanitizeData` returns a cyclic object, `JSON.stringify` will throw.
    // So `sanitizeData` MUST remove cycles to be safe for logging.
    // So I should remove the `if (activeSecrets.length === 0) return data;` check?
    // Or only if it's an object?

    // Let's compromise: If we encounter an object, we traverse it to check for cycles,
    // even if no secrets are provided.

    if (typeof data === 'string') {
        if (activeSecrets.length === 0) return data;
        let sanitized = data;
        activeSecrets.forEach(secret => {
            // Global replace of the secret
            sanitized = sanitized.split(secret).join(REDACTED_LABEL);
        });
        return sanitized;
    }

    if (typeof data === 'object') {
        if (visited.has(data)) return CIRCULAR_LABEL;
        visited.add(data);

        if (Array.isArray(data)) {
            return data.map(item => sanitizeData(item, activeSecrets, visited));
        }

        const sanitizedObj = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                sanitizedObj[key] = sanitizeData(data[key], activeSecrets, visited);
            }
        }
        return sanitizedObj;
    }

    return data;
};

/**
 * Helper to safely log errors that might contain secrets.
 * @param {string} message - The prefix message
 * @param {Error|string} error - The error object or string
 * @param {string[]} secrets - Secrets to redact
 */
export const safeLog = (message, error, secrets = []) => {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const sanitizedMsg = sanitizeData(errorMsg, secrets);
    console.warn(message, sanitizedMsg);
};
