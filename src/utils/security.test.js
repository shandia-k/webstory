import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import { sanitizeData, generateSecureId } from './security.js';

describe('Security Utils', () => {
    describe('sanitizeData', () => {
        it('should return original data if no secrets provided', () => {
            const data = { key: 'value' };
            const result = sanitizeData(data, []);
            assert.deepStrictEqual(result, data);
        });

        it('should redact secrets in strings', () => {
            const secret = 'secret_key_123';
            const data = 'This is a secret_key_123 in a string';
            const result = sanitizeData(data, [secret]);
            assert.strictEqual(result, 'This is a [REDACTED] in a string');
        });

        it('should redact secrets in objects recursively', () => {
            const secret = 'secret_key_long_enough';
            const data = {
                nested: {
                    value: 'hidden secret_key_long_enough here'
                },
                list: ['item', 'secret_key_long_enough item']
            };
            const result = sanitizeData(data, [secret]);
            assert.strictEqual(result.nested.value, 'hidden [REDACTED] here');
            assert.strictEqual(result.list[1], '[REDACTED] item');
        });

        it('should ignore short secrets', () => {
            const secret = 'short';
            const data = 'short';
            const result = sanitizeData(data, [secret]);
            assert.strictEqual(result, 'short');
        });
    });

    describe('generateSecureId', () => {
        it('should generate a string', () => {
            const id = generateSecureId();
            assert.strictEqual(typeof id, 'string');
        });

        it('should generate unique IDs', () => {
            const id1 = generateSecureId();
            const id2 = generateSecureId();
            assert.notStrictEqual(id1, id2);
        });

        it('should match UUID format', () => {
            const id = generateSecureId();
            // Check for standard UUID format: 8-4-4-4-12 hex digits
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            assert.match(id, uuidRegex);
        });
    });
});
