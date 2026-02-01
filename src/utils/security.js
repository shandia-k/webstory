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
/**
 * Validates and sanitizes user input strings.
 * Enforces length limits and removes non-printable characters.
 * @param {string} input - The user input
 * @param {number} maxLength - Maximum allowed length (default 1000)
 * @returns {string} - The validated and trimmed string
 */
export const validateInput = (input, maxLength = 1000) => {
    if (typeof input !== 'string') return '';
    let trimmed = input.trim();
    if (trimmed.length > maxLength) {
        trimmed = trimmed.substring(0, maxLength);
    }
    // Remove non-printable control characters (ASCII 0-31 except 9, 10, 13) and DEL (127)
    // eslint-disable-next-line no-control-regex
    return trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};

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

    if (typeof data === 'object') {
        if (visited.has(data)) return '[CIRCULAR]';
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
 * @param {Error|string} error - The error object or string
 * @param {string[]} secrets - Secrets to redact
 */
export const safeLog = (message, error, secrets = []) => {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const sanitizedMsg = sanitizeData(errorMsg, secrets);
    console.warn(message, sanitizedMsg);
};
