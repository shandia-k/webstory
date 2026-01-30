import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import { validateInput } from './security.js';

describe('Security Utils', () => {
    it('validateInput should truncate input longer than maxLength', () => {
        const longInput = 'a'.repeat(2000);
        const validated = validateInput(longInput, 1000);
        assert.strictEqual(validated.length, 1000);
    });

    it('validateInput should trim whitespace', () => {
        const input = '  hello world  ';
        const validated = validateInput(input);
        assert.strictEqual(validated, 'hello world');
    });

    it('validateInput should strip control characters but keep newlines', () => {
        const input = 'hello\x00\x01\nworld\t\x07';
        const validated = validateInput(input);
        assert.strictEqual(validated, 'hello\nworld\t');
    });

    it('validateInput should return empty string for non-string input', () => {
        assert.strictEqual(validateInput(null), '');
        assert.strictEqual(validateInput(123), '');
        assert.strictEqual(validateInput({}), '');
    });
});
