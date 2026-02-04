import { describe, it } from 'node:test';
import assert from 'node:assert';
import { sanitizeData, generateSecureId } from './security.js';

describe('Security Utils', () => {
    it('sanitizeData should redact secrets', () => {
        const data = { key: 'secret123', public: 'hello' };
        const secrets = ['secret123'];
        const sanitized = sanitizeData(data, secrets);
        assert.strictEqual(sanitized.key, '[REDACTED]');
        assert.strictEqual(sanitized.public, 'hello');
    });

    it('generateSecureId should return a valid UUID', () => {
        if (typeof generateSecureId !== 'function') {
            assert.fail('generateSecureId is not implemented yet');
        }
        const id = generateSecureId();
        assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('generateSecureId should generate unique IDs', () => {
        if (typeof generateSecureId !== 'function') {
           return; // Skip if not implemented
        }
        const id1 = generateSecureId();
        const id2 = generateSecureId();
        assert.notStrictEqual(id1, id2);
    });
});
