/**
 * Security utilities for sanitizing sensitive data.
 */

const REDACTED_LABEL = '[REDACTED]';

/**
 * Recursively sanitizes data to remove sensitive information.
 * Handles circular references to prevent stack overflows.
 * @param {any} data - The data to sanitize (object, array, string, etc.)
 * @param {string[]} secrets - Array of sensitive strings to redact (e.g. API keys)
 * @param {WeakSet} visited - Internal use for circular reference detection
 * @returns {any} - The sanitized data
 */
export const sanitizeData = (data, secrets = [], visited = new WeakSet()) => {
    if (!data) return data;

    // Check for circular references
    if (typeof data === 'object' && data !== null) {
        if (visited.has(data)) {
            return '[CIRCULAR]';
        }
        visited.add(data);
    }

    // Filter out empty secrets and short strings that might cause false positives
    // Note: We do this even if recursion passed already filtered secrets,
    // it's a cheap operation for small arrays.
    const activeSecrets = secrets.filter(s => s && typeof s === 'string' && s.length > 5);

    if (typeof data === 'string') {
        if (activeSecrets.length === 0) return data;
        let sanitized = data;
        activeSecrets.forEach(secret => {
            // Global replace of the secret
            sanitized = sanitized.split(secret).join(REDACTED_LABEL);
        });
        return sanitized;
    }

    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item, activeSecrets, visited));
    }

    if (typeof data === 'object') {
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
    // Note: We don't pass 'error' object itself to sanitizeData here, just the message.
    // If we wanted to log the full error object safely, we would pass it directly.
    // But keeping existing behavior for now.
    const sanitizedMsg = sanitizeData(errorMsg, secrets);
    console.warn(message, sanitizedMsg);
};
