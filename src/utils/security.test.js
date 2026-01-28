import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import { validateInput, sanitizeData } from './security.js';

describe('Security Utils', () => {
    describe('validateInput', () => {
        it('should return empty string for non-string input', () => {
            assert.strictEqual(validateInput(null), '');
            assert.strictEqual(validateInput(123), '');
            assert.strictEqual(validateInput({}), '');
        });

        it('should trim whitespace', () => {
            assert.strictEqual(validateInput('  hello  '), 'hello');
        });

        it('should enforce max length', () => {
            const longString = 'a'.repeat(2000);
            const result = validateInput(longString, 10);
            assert.strictEqual(result.length, 10);
            assert.strictEqual(result, 'aaaaaaaaaa');
        });

        it('should strip control characters', () => {
            // \x00 is null, \x07 is bell
            const input = 'hello\x00world\x07';
            assert.strictEqual(validateInput(input), 'helloworld');
        });

        it('should keep newlines and tabs', () => {
            const input = 'line1\nline2\tindent';
            assert.strictEqual(validateInput(input), input);
        });

        it('should use default length limit of 1000', () => {
            const longString = 'a'.repeat(1001);
            const result = validateInput(longString);
            assert.strictEqual(result.length, 1000);
        });
    });

    describe('sanitizeData', () => {
        it('should redact secrets in string', () => {
            const secret = 'supersecret';
            const input = 'This is a supersecret message';
            const expected = 'This is a [REDACTED] message';
            assert.strictEqual(sanitizeData(input, [secret]), expected);
        });

        it('should redact secrets in object values', () => {
            const secret = '123456';
            const input = { key: 'My pass is 123456', other: 'safe' };
            const expected = { key: 'My pass is [REDACTED]', other: 'safe' };
            assert.deepStrictEqual(sanitizeData(input, [secret]), expected);
        });
    });
});
