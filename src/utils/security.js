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
 * @param {WeakSet} visited - Internal use for tracking circular references
 * @returns {any} - The sanitized data
 */
export const sanitizeData = (data, secrets = [], visited = new WeakSet()) => {
    if (!data) return data;

    // Handle primitives
    if (typeof data !== 'object') {
        if (typeof data === 'string' && secrets.length > 0) {
             // Filter out empty secrets and short strings
            const activeSecrets = secrets.filter(s => s && typeof s === 'string' && s.length > 5);
            if (activeSecrets.length === 0) return data;

            let sanitized = data;
            activeSecrets.forEach(secret => {
                sanitized = sanitized.split(secret).join(REDACTED_LABEL);
            });
            return sanitized;
        }
        return data;
    }

    // Handle Objects/Arrays with Cycle Detection
    if (visited.has(data)) {
        return CIRCULAR_LABEL;
    }
    visited.add(data);

    try {
        const activeSecrets = secrets.filter(s => s && typeof s === 'string' && s.length > 5);

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
};

/**
 * Validates and sanitizes user input strings.
 * Enforces length limits and strips dangerous control characters.
 * @param {string} input - The raw user input
 * @param {number} maxLength - Maximum allowed length (default 1000)
 * @returns {string} - The validated and sanitized string
 */
export const validateInput = (input, maxLength = 1000) => {
    if (typeof input !== 'string') return '';

    // Enforce length limit
    let clean = input.slice(0, maxLength);

    // Strip non-printable control characters (ASCII 0-31, 127), keeping newline (10) and tab (9)
    // \x00-\x08 matches 0-8
    // \x0B-\x0C matches 11-12
    // \x0E-\x1F matches 14-31
    // \x7F matches 127 (DEL)
    // eslint-disable-next-line no-control-regex
    clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return clean;
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
