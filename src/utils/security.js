/**
 * Security utilities for sanitizing sensitive data.
 */

const REDACTED_LABEL = '[REDACTED]';

/**
 * Recursively sanitizes data to remove sensitive information.
 * @param {any} data - The data to sanitize (object, array, string, etc.)
 * @param {string[]} secrets - Array of sensitive strings to redact (e.g. API keys)
 * @param {WeakSet} visited - Internal use to detect circular references
 * @returns {any} - The sanitized data
 */
export const sanitizeData = (data, secrets = [], visited = new WeakSet()) => {
    if (!data) return data;

    // Handle circular references
    if (typeof data === 'object' && data !== null) {
        if (visited.has(data)) {
            return '[CIRCULAR]';
        }
        visited.add(data);
    }

    if (secrets.length === 0 && typeof data !== 'object') return data;

    // Filter out empty secrets and short strings that might cause false positives
    // Note: If called recursively, secrets might already be filtered, but filtering again is safe.
    const activeSecrets = secrets.filter(s => s && typeof s === 'string' && s.length > 5);

    // If no active secrets and simple type, return as is.
    // For objects/arrays, we still need to traverse to check nested strings even if no secrets (Wait, if no secrets, do we need to traverse?
    // Only if we want to copy/clone or if we assume secrets might be hidden deeper?
    // The original code returned data if secrets.length === 0.
    // But now we are also doing circular ref protection.
    // If we return raw data, we expose circular refs to the caller if they JSON.stringify it later?
    // But sanitizeData purpose is redaction. If no secrets, we can probably return data.
    // However, if the caller expects a COPY (sanitizedObj), returning original reference might be unexpected?
    // The original code: if (secrets.length === 0) return data;
    // So it returned the original object.

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
