/**
 * Security utilities for sanitizing sensitive data.
 */

const REDACTED_LABEL = '[REDACTED]';

/**
 * Recursively sanitizes data to remove sensitive information.
 * Handles circular references to prevent stack overflows.
 * @param {any} data - The data to sanitize (object, array, string, etc.)
 * @param {string[]} secrets - Array of sensitive strings to redact (e.g. API keys)
 * @param {WeakSet} visited - Internal set to track visited objects for cycle detection
 * @returns {any} - The sanitized data
 */
export const sanitizeData = (data, secrets = [], visited = new WeakSet()) => {
    if (!data) return data;

    // Primitive handling (no cycle check needed)
    if (typeof data !== 'object') {
        if (typeof data === 'string' && secrets.length > 0) {
            // Filter out empty secrets and short strings that might cause false positives
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

    // Cycle detection for objects/arrays
    if (visited.has(data)) {
        return '[CIRCULAR]';
    }
    visited.add(data);

    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item, secrets, visited));
    }

    // Object handling
    const sanitizedObj = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            sanitizedObj[key] = sanitizeData(data[key], secrets, visited);
        }
    }
    return sanitizedObj;
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

/**
 * Validates input against strict allowlists.
 * @param {string} input - The input string to validate
 * @param {string} type - Validation type ('alphanumeric', 'email', 'simple_text')
 * @param {number} maxLength - Maximum allowed length
 * @returns {boolean} - True if valid, False otherwise
 */
export const validateInput = (input, type = 'alphanumeric', maxLength = 50) => {
    if (typeof input !== 'string') return false;
    if (input.length > maxLength) return false;

    const patterns = {
        // Alphanumeric + spaces + dashes + underscores (Good for usernames/titles)
        alphanumeric: /^[a-zA-Z0-9\s\-_]+$/,

        // Simple text (Good for chat messages - prevents HTML tags somewhat but still permissive)
        // Allows letters, numbers, punctuation, common symbols.
        simple_text: /^[\w\s.,!?'"()\-:]+$/,

        // Basic email check
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    };

    return patterns[type]?.test(input) ?? false;
};
