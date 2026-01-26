import { test } from 'node:test';
import assert from 'node:assert';
import { validateInput, sanitizeData } from './security.js';

test('validateInput should return valid strings', () => {
    const input = 'Hello World';
    const result = validateInput(input);
    assert.strictEqual(result, 'Hello World');
});

test('validateInput should strip control characters', () => {
    // \x00 is NULL, \x07 is BEL
    const input = 'Hello\x00World\x07';
    const result = validateInput(input);
    assert.strictEqual(result, 'HelloWorld');
});

test('validateInput should preserve newlines and tabs', () => {
    const input = 'Hello\nWorld\t!';
    const result = validateInput(input);
    assert.strictEqual(result, 'Hello\nWorld\t!');
});

test('validateInput should throw on length exceeded', () => {
    const input = 'a'.repeat(101);
    assert.throws(() => validateInput(input, 100), /Input exceeds maximum length/);
});

test('validateInput should handle arrays', () => {
    const input = ['Safe', 'Bad\x00'];
    const result = validateInput(input);
    assert.deepStrictEqual(result, ['Safe', 'Bad']);
});

test('validateInput should pass through non-string array elements', () => {
    const input = ['Safe', 123];
    const result = validateInput(input);
    assert.deepStrictEqual(result, ['Safe', 123]);
});

test('sanitizeData should redact secrets', () => {
    const data = "My secret is 123456";
    const secrets = ["123456"];
    const result = sanitizeData(data, secrets);
    assert.strictEqual(result, "My secret is [REDACTED]");
});
