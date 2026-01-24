import { describe, it } from 'node:test';
import assert from 'node:assert';
import { sanitizeData, validateInput } from './security.js';

describe('Security Utils', () => {

    describe('sanitizeData', () => {
        it('should redact secrets from strings', () => {
            const secret = 'super_secret_key';
            const input = `Here is my key: ${secret}`;
            const expected = 'Here is my key: [REDACTED]';
            const result = sanitizeData(input, [secret]);
            assert.strictEqual(result, expected);
        });

        it('should redact secrets from nested objects', () => {
            const secret = 'secret123';
            const input = {
                user: 'alice',
                config: {
                    key: `key=${secret}`,
                    other: 'public'
                }
            };
            const result = sanitizeData(input, [secret]);
            assert.strictEqual(result.config.key, 'key=[REDACTED]');
            assert.strictEqual(result.user, 'alice');
        });

        it('should handle circular references gracefully', () => {
            const obj = { name: 'circular' };
            obj.self = obj;

            const result = sanitizeData(obj);
            assert.strictEqual(result.name, 'circular');
            assert.strictEqual(result.self, '[CIRCULAR]');
        });

        it('should ignore short secrets to prevent false positives', () => {
            const shortSecret = 'abc'; // Length 3
            const input = 'alphabet';
            const result = sanitizeData(input, [shortSecret]);
            assert.strictEqual(result, 'alphabet'); // Should NOT redact
        });
    });

    describe('validateInput', () => {
        it('should validate alphanumeric correctly', () => {
            assert.strictEqual(validateInput('User Name 123', 'alphanumeric'), true);
            assert.strictEqual(validateInput('User@Name', 'alphanumeric'), false); // @ not allowed
            assert.strictEqual(validateInput('<script>', 'alphanumeric'), false);
        });

        it('should validate simple_text correctly', () => {
            assert.strictEqual(validateInput('Hello, World!', 'simple_text'), true);
            assert.strictEqual(validateInput('Hello <b>World</b>', 'simple_text'), false); // HTML tags not allowed
        });

        it('should validate email correctly', () => {
            assert.strictEqual(validateInput('test@example.com', 'email'), true);
            assert.strictEqual(validateInput('invalid-email', 'email'), false);
        });

        it('should enforce max length', () => {
            const longString = 'a'.repeat(51);
            assert.strictEqual(validateInput(longString, 'alphanumeric', 50), false);
            assert.strictEqual(validateInput('short', 'alphanumeric', 50), true);
        });
    });
});
