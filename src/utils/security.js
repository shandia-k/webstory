/**
 * Security utilities for sanitizing sensitive data.
 */

const REDACTED_LABEL = '[REDACTED]';

/**
 * Validates and sanitizes user input.
 * - Trims whitespace
 * - Enforces max length
 * - Removes non-printable control characters
 * @param {string} input
 * @param {number} maxLength
 * @returns {string}
 */
export const validateInput = (input, maxLength = 500) => {
    if (typeof input !== 'string') return '';

    // Trim
    let clean = input.trim();

    // Length limit
    if (clean.length > maxLength) {
        clean = clean.substring(0, maxLength);
    }

    // Remove control characters (keep newline \n, return \r, tab \t)
    // ASCII 0-8, 11-12, 14-31, 127
    clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return clean;
};

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

    // Cycle detection
    if (typeof data === 'object' && data !== null) {
        if (visited.has(data)) {
            return '[CIRCULAR]';
        }
        visited.add(data);
    }

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
    const sanitizedMsg = sanitizeData(errorMsg, secrets);
    console.warn(message, sanitizedMsg);
};
