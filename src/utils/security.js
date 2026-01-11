/**
 * Security utilities for sanitizing sensitive data.
 */

const REDACTED_LABEL = '[REDACTED]';
const CIRCULAR_LABEL = '[CIRCULAR]';

/**
 * Recursively sanitizes data to remove sensitive information.
 * Handles circular references to prevent stack overflow.
 *
 * @param {any} data - The data to sanitize (object, array, string, etc.)
 * @param {string[]} secrets - Array of sensitive strings to redact (e.g. API keys)
 * @param {Set} visited - Internal use: Track visited objects to prevent cycles
 * @returns {any} - The sanitized data
 */
export const sanitizeData = (data, secrets = [], visited = new Set()) => {
    if (!data) return data;

    // If no secrets to redact, we might still want to return data,
    // but if the goal is strictly "remove secrets", and we assume the caller handles serialization...
    // The original code returned early. We'll keep that behavior for perf,
    // UNLESS the user explicitly relies on this for safe stringification (which safeLog does via console.warn).
    // However, console.warn handles circular refs fine usually.
    // But if we are traversing to find strings, we MUST handle cycles.

    if (secrets.length === 0) return data;

    // Filter out empty secrets and short strings that might cause false positives
    const activeSecrets = secrets.filter(s => s && typeof s === 'string' && s.length > 5);
    if (activeSecrets.length === 0) return data;

    if (typeof data === 'string') {
        let sanitized = data;
        activeSecrets.forEach(secret => {
            // Global replace of the secret
            sanitized = sanitized.split(secret).join(REDACTED_LABEL);
        });
        return sanitized;
    }

    // Handle Objects and Arrays
    if (typeof data === 'object') {
        if (visited.has(data)) {
            return CIRCULAR_LABEL;
        }
        visited.add(data);

        try {
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
        } finally {
            // We don't remove from visited to treat shared references as circular/duplicate
            // in the context of a serialized log. This is safer for logging.
        }
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
