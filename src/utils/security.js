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
 * Validates user input to prevent common attacks and resource exhaustion.
 * @param {string|string[]} input - The input to validate (string or array of strings)
 * @param {number} maxLength - Maximum allowed length (default 2000)
 * @throws {Error} If input is invalid
 * @returns {string|string[]} The validated and potentially sanitized input
 */
export const validateInput = (input, maxLength = 2000) => {
    if (!input) return input;

    // Helper to validate single string
    const validateString = (str) => {
        if (typeof str !== 'string') {
            throw new Error("Invalid input type: expected string.");
        }
        if (str.length > maxLength) {
            throw new Error(`Input exceeds maximum length of ${maxLength} characters.`);
        }
        // Basic sanitization: strip low-level control chars (except newline, tab)
        return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
    };

    if (Array.isArray(input)) {
        return input.map(item => {
            if (typeof item === 'string') return validateString(item);
            return item;
        });
    }

    return validateString(input);
};
