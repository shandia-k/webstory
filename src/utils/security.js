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
 * Validates and sanitizes user input strings.
 * Enforces length limits and removes control characters.
 * @param {string} input - The input string
 * @param {number} maxLength - Maximum allowed length (default 1000)
 * @returns {string} - The sanitized string
 */
export const validateInput = (input, maxLength = 1000) => {
    if (typeof input !== 'string') return '';

    // 1. Trim whitespace
    let clean = input.trim();

    // 2. Enforce max length
    if (clean.length > maxLength) {
        clean = clean.substring(0, maxLength);
    }

    // 3. Strip non-printable control characters (ASCII 0-31), except:
    // - \t (9)
    // - \n (10)
    // - \r (13)
    // Also strip DEL (127)
    clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return clean;
};
