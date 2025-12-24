/**
 * Security utilities for sanitizing sensitive data.
 */

const REDACTED_LABEL = '[REDACTED]';
const CIRCULAR_LABEL = '[CIRCULAR]';

/**
 * Recursively sanitizes data to remove sensitive information.
 * @param {any} data - The data to sanitize (object, array, string, etc.)
 * @param {string[]} secrets - Array of sensitive strings to redact (e.g. API keys)
 * @param {WeakSet} visited - Internal use: tracks visited objects to prevent circular references
 * @returns {any} - The sanitized data
 */
export const sanitizeData = (data, secrets = [], visited = new WeakSet()) => {
    if (!data) return data;

    // Primitive types that don't need recursion
    if (typeof data !== 'object' && typeof data !== 'string') {
        return data;
    }

    if (secrets.length === 0 && typeof data !== 'object') return data;

    // Filter out empty secrets and short strings that might cause false positives
    // Optimization: This filter could be done once at the top level, but for simplicity here:
    const activeSecrets = secrets.filter(s => s && typeof s === 'string' && s.length > 5);

    // If no secrets to redact, and it's a string, return as is.
    // If it's an object, we STILL need to traverse to check for circular refs if we are strictly validating,
    // but usually sanitizeData is called *to* redact secrets.
    // However, the function contract implies it returns a safe copy.
    // If we just return 'data' for object, we return the original object which might have cycles.
    // So we should probably traverse objects regardless of secrets if we want to guarantee "safe for logging" structure.

    if (typeof data === 'string') {
        if (activeSecrets.length === 0) return data;
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
