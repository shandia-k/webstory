/**
 * Security utilities for sanitizing sensitive data.
 */

const REDACTED_LABEL = '[REDACTED]';
const CIRCULAR_LABEL = '[CIRCULAR]';

/**
 * Recursively sanitizes data to remove sensitive information.
 * Handles circular references to prevent stack overflows.
 * @param {any} data - The data to sanitize (object, array, string, etc.)
 * @param {string[]} secrets - Array of sensitive strings to redact (e.g. API keys)
 * @param {WeakSet} visited - Internal use only: tracks visited objects to prevent cycles
 * @returns {any} - The sanitized data
 */
export const sanitizeData = (data, secrets = [], visited = new WeakSet()) => {
    if (!data) return data;
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

    // Handle complex types (Arrays and Objects)
    if (typeof data === 'object') {
        // Check for cycles
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
 * @param {Error|string|Object} error - The error object or string
 * @param {string[]} secrets - Secrets to redact
 */
export const safeLog = (message, error, secrets = []) => {
    // Check if error is an Error object, if so, we can't iterate over it easily with JSON.stringify semantics
    // But sanitizeData iterates keys. Error objects often have non-enumerable properties (message, stack).
    // So we should probably extract them or just sanitize the message if it's a simple Error.
    // However, the original code treated it as string or object.

    let dataToSanitize;
    if (error instanceof Error) {
        dataToSanitize = {
            message: error.message,
            stack: error.stack,
            ...error // Spread any other custom properties
        };
    } else {
        dataToSanitize = error;
    }

    const sanitizedMsg = sanitizeData(dataToSanitize, secrets);
    console.warn(message, sanitizedMsg);
};
