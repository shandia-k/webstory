/**
 * Security utilities for sanitizing sensitive data.
 */

const REDACTED_LABEL = '[REDACTED]';

/**
 * Validates and sanitizes user input.
 * - Truncates to maxLength
 * - Removes control characters
 * @param {string} input
 * @param {number} maxLength
 * @returns {string}
 */
export const validateInput = (input, maxLength = 1000) => {
    if (typeof input !== 'string') return '';

    // 1. Enforce Length
    let valid = input.slice(0, maxLength);

    // 2. Strip Control Characters (keep \n \t)
    // eslint-disable-next-line no-control-regex
    valid = valid.replace(/[\x00-\x08\x0B-\x1F\x7F]/g, "");

    return valid;
};

/**
 * Recursively sanitizes data to remove sensitive information.
 * Handles circular references.
 * @param {any} data - The data to sanitize (object, array, string, etc.)
 * @param {string[]} secrets - Array of sensitive strings to redact (e.g. API keys)
 * @param {WeakSet} visited - Internal use for circular reference detection
 * @returns {any} - The sanitized data
 */
export const sanitizeData = (data, secrets = [], visited = new WeakSet()) => {
    if (!data) return data;

    // Filter out empty secrets and short strings that might cause false positives
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

    if (typeof data === 'object') {
        if (visited.has(data)) return '[CIRCULAR]';
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
            visited.delete(data);
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
