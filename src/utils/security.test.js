import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as security from './security.js';

describe('Security Utils', () => {
    it('validateInput should exist and limit length', () => {
        if (typeof security.validateInput !== 'function') {
             throw new Error('validateInput is not implemented');
        }

        const longInput = 'a'.repeat(2000);
        const valid = security.validateInput(longInput, 100);
        assert.ok(valid.length <= 100, 'Should truncate input');
        assert.strictEqual(valid.length, 100);
    });

    it('sanitizeData should handle circular references', () => {
        const circular = { name: 'test' };
        circular.self = circular;

        try {
            // Must provide a secret > 5 chars to trigger processing
            const result = security.sanitizeData(circular, ['s3cret_key']);

            assert.strictEqual(result.self, '[CIRCULAR]', 'Should replace circular ref');
            assert.strictEqual(result.name, 'test');
        } catch (e) {
            if (e.message.includes('stack')) {
                throw new Error('Stack overflow detected (Vulnerability confirmed)');
            }
            throw e;
        }
    });
});
