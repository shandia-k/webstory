import { describe, it } from 'node:test';
import assert from 'node:assert';
import { sanitizeData, validateInput } from './security.js';

describe('Security Utils', () => {
    it('sanitizeData should handle circular references', () => {
        const circular = { name: 'circular' };
        circular.self = circular;

        try {
            const result = sanitizeData(circular);
            assert.strictEqual(result.name, 'circular');
            // We expect the cycle to be handled safely
            // The exact value depends on implementation, but it shouldn't crash
            // If my plan is to implement [CIRCULAR] replacement:
            assert.strictEqual(result.self, '[CIRCULAR]');
        } catch (e) {
            if (e.message.includes('Maximum call stack size exceeded')) {
                assert.fail('sanitizeData crashed with stack overflow on circular reference');
            } else {
                throw e;
            }
        }
    });

    it('validateInput should sanitize string input', () => {
        if (typeof validateInput !== 'function') {
            assert.fail('validateInput is not implemented');
        }

        // ASCII 0 (null) should be removed.
        // Trimming should happen.
        const input = "  Hello \x00 World  ";
        const result = validateInput(input, 50);
        assert.strictEqual(result, "Hello  World");
    });

    it('validateInput should truncate long input', () => {
        if (typeof validateInput !== 'function') {
            assert.fail('validateInput is not implemented');
        }

        const input = "a".repeat(100);
        const result = validateInput(input, 10);
        assert.strictEqual(result.length, 10);
        assert.strictEqual(result, "aaaaaaaaaa");
    });
});
