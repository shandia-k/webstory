/**
 * Security utilities for sanitizing sensitive data.
 */

const REDACTED_LABEL = '[REDACTED]';
const CIRCULAR_LABEL = '[CIRCULAR]';

/**
 * Validates user input against an allowlist.
 * @param {string} input - The input string to validate
 * @param {object} options - Validation options
 * @param {number} options.maxLength - Maximum allowed length
 * @param {RegExp} options.pattern - Regex pattern to match
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateInput = (input, options = {}) => {
    const { maxLength = 50, pattern = /^[a-zA-Z0-9\s\-_]+$/ } = options;

    if (typeof input !== 'string') return false;
    if (input.length > maxLength) return false;
    if (!pattern.test(input)) return false;

    return true;
};

/**
 * Recursively sanitizes data to remove sensitive information.
 * @param {any} data - The data to sanitize (object, array, string, etc.)
 * @param {string[]} secrets - Array of sensitive strings to redact (e.g. API keys)
 * @param {WeakSet} seen - Internal use only: tracks visited objects to prevent cycles
 * @returns {any} - The sanitized data
 */
export const sanitizeData = (data, secrets = [], seen = new WeakSet()) => {
    if (!data) return data;
    // Note: We cannot optimize by returning early if secrets is empty
    // because we still need to traverse objects to strip circular references.

    // Filter out empty secrets and short strings that might cause false positives
    const activeSecrets = secrets.filter(s => s && typeof s === 'string' && s.length > 5);

    if (typeof data === 'string') {
        let sanitized = data;
        if (activeSecrets.length > 0) {
            activeSecrets.forEach(secret => {
                // Global replace of the secret
                sanitized = sanitized.split(secret).join(REDACTED_LABEL);
            });
        }
        return sanitized;
    }

    if (typeof data === 'object') {
        if (seen.has(data)) {
            return CIRCULAR_LABEL;
        }
        seen.add(data);

        if (Array.isArray(data)) {
            return data.map(item => sanitizeData(item, activeSecrets, seen));
        }

        const sanitizedObj = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                sanitizedObj[key] = sanitizeData(data[key], activeSecrets, seen);
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
