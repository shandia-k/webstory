/**
 * Security utilities for sanitizing sensitive data.
 */

const REDACTED_LABEL = '[REDACTED]';
const CIRCULAR_LABEL = '[CIRCULAR]';

/**
 * Recursively sanitizes data to remove sensitive information.
 * Handles circular references to prevent stack overflow.
 *
 * @param {any} data - The data to sanitize (object, array, string, etc.)
 * @param {string[]} secrets - Array of sensitive strings to redact (e.g. API keys)
 * @param {WeakSet} stack - Internal tracking for current traversal path (to detect cycles)
 * @returns {any} - The sanitized data
 */
export const sanitizeData = (data, secrets = [], stack = new WeakSet()) => {
    if (!data) return data;

    // Circular reference check for Objects and Arrays
    // We use a 'stack' approach: track objects currently being visited in the current branch.
    if (typeof data === 'object' && data !== null) {
        if (stack.has(data)) {
            return CIRCULAR_LABEL;
        }
        // Add to current path
        stack.add(data);
    }

    // Filter out empty secrets and short strings that might cause false positives
    const activeSecrets = secrets.filter(s => s && typeof s === 'string' && s.length > 5);

    // Note: We traverse even if no secrets to ensure cycle safety

    let result = data;

    if (typeof data === 'string') {
        if (activeSecrets.length > 0) {
            let sanitized = data;
            activeSecrets.forEach(secret => {
                sanitized = sanitized.split(secret).join(REDACTED_LABEL);
            });
            result = sanitized;
        }
    } else if (Array.isArray(data)) {
        // We must pass a NEW stack (clone) to children if we were using a Set/Array for path.
        // BUT, WeakSet is mutable and passed by reference.
        // If we use a single WeakSet for the whole traversal but "remove" on exit, it works as a path tracker.

        result = data.map(item => sanitizeData(item, activeSecrets, stack));

    } else if (typeof data === 'object') {
        const sanitizedObj = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                sanitizedObj[key] = sanitizeData(data[key], activeSecrets, stack);
            }
        }
        result = sanitizedObj;
    }

    // Backtracking: Remove from stack when leaving this node
    if (typeof data === 'object' && data !== null) {
        stack.delete(data);
    }

    return result;
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
