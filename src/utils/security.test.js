import { describe, test } from 'node:test';
import assert from 'node:assert';
import { sanitizeData } from './security.js';

describe('sanitizeData Security Utility', () => {

    test('should redact secrets in strings and objects', () => {
        const secret = 'supersecretkey';
        const data = {
            apiKey: secret,
            other: 'public',
            nested: {
                key: secret
            }
        };
        const sanitized = sanitizeData(data, [secret]);
        assert.strictEqual(sanitized.apiKey, '[REDACTED]');
        assert.strictEqual(sanitized.other, 'public');
        assert.strictEqual(sanitized.nested.key, '[REDACTED]');
    });

    test('should handle circular references in objects gracefully', () => {
        const circular = { name: 'Circular' };
        circular.self = circular;

        // Should not throw
        const result = sanitizeData(circular, ['secret']);

        assert.strictEqual(result.name, 'Circular');
        assert.strictEqual(result.self, '[CIRCULAR]');
    });

    test('should handle circular references in arrays gracefully', () => {
        const arr = [];
        arr.push(arr);

        // Should not throw
        const result = sanitizeData(arr, []);

        assert.strictEqual(result[0], '[CIRCULAR]');
    });

    test('should ensure JSON serializability even without secrets', () => {
        const circular = { name: 'Circular' };
        circular.self = circular;

        const result = sanitizeData(circular, []); // No secrets provided

        assert.strictEqual(result.self, '[CIRCULAR]');
        assert.doesNotThrow(() => JSON.stringify(result));
    });

});
