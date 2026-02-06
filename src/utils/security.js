/**
 * Security utilities for sanitizing sensitive data.
 */

const REDACTED_LABEL = '[REDACTED]';

/**
 * Recursively sanitizes data to remove sensitive information.
 * @param {any} data - The data to sanitize (object, array, string, etc.)
 * @param {string[]} secrets - Array of sensitive strings to redact (e.g. API keys)
 * @returns {any} - The sanitized data
 */
export const sanitizeData = (data, secrets = []) => {
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

    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item, activeSecrets));
    }

    if (typeof data === 'object') {
        const sanitizedObj = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                sanitizedObj[key] = sanitizeData(data[key], activeSecrets);
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

/**
 * Generates a cryptographically secure unique identifier (UUID v4).
 * Falls back to a random string if crypto is not available.
 * @returns {string} - The unique identifier.
 */
export const generateSecureId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID (Legacy/Test fallback)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
