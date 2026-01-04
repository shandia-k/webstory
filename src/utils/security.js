/**
 * Security Utility for OmniHub
 * Handles sanitization and sensitive data management
 */

const REDACTED_LABEL = '[REDACTED]';

/**
 * Sanitizes data by redacting sensitive strings (secrets) from it.
 * Works on strings, objects, and arrays recursively.
 * Handles circular references to prevent stack overflow.
 *
 * @param {any} data - The data to sanitize
 * @param {string[]} secrets - Array of sensitive strings to redact (e.g. API keys)
 * @param {WeakSet} visited - Internal use for recursion to detect cycles
 * @returns {any} Sanitized data
 */
export const sanitizeData = (data, secrets = [], visited = new WeakSet()) => {
    // Filter out empty secrets and short strings that might cause false positives
    const activeSecrets = secrets.filter(s => s && typeof s === 'string' && s.length > 5);

    // Base case: null or non-object
    if (data === null || typeof data !== 'object') {
        if (typeof data === 'string' && activeSecrets.length > 0) {
             let sanitized = data;
             activeSecrets.forEach(secret => {
                 sanitized = sanitized.split(secret).join(REDACTED_LABEL);
             });
             return sanitized;
        }
        return data;
    }

    // Cycle Detection
    if (visited.has(data)) {
        return '[CIRCULAR]';
    }
    visited.add(data);

    // Handle Arrays
    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item, activeSecrets, visited));
    }

    // Handle Errors (message and stack are not enumerable by default)
    if (data instanceof Error) {
        return {
            message: sanitizeData(data.message, activeSecrets, visited),
            stack: sanitizeData(data.stack, activeSecrets, visited),
            name: data.name
        };
    }

    // Handle Objects
    const sanitizedObj = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            sanitizedObj[key] = sanitizeData(data[key], activeSecrets, visited);
        }
    }
    return sanitizedObj;
};

/**
 * Helper to safely log errors that might contain secrets.
 * @param {string} message - Context message
 * @param {any} error - The error object
 * @param {string[]} secrets - Secrets to redact
 */
export const safeLog = (message, error, secrets = []) => {
    try {
        const sanitizedDetails = sanitizeData(error, secrets);
        console.error(message, sanitizedDetails);
    } catch (e) {
        // Fallback if everything explodes
        console.error(message, "Error during sanitization:", e.message);
    }
};
