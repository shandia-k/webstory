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
 * Validates user input to prevent injection and enforce constraints.
 * @param {string} input - The input string to validate.
 * @param {string} type - 'name' | 'chat' | 'text'
 * @returns {object} - { isValid: boolean, error: string|null }
 */
export const validateInput = (input, type = 'text') => {
    if (!input || typeof input !== 'string') return { isValid: false, error: 'Input is empty' };
    const trimmed = input.trim();
    if (trimmed.length === 0) return { isValid: false, error: 'Input is empty' };

    if (type === 'name') {
        if (trimmed.length > 20) return { isValid: false, error: 'Name too long (max 20)' };
        // Allow alphanumeric, space, dash, underscore
        const regex = /^[a-zA-Z0-9 _-]+$/;
        if (!regex.test(trimmed)) return { isValid: false, error: 'Alphanumeric characters only' };
    }

    return { isValid: true, error: null, sanitized: trimmed };
};
