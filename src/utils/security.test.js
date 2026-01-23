
import { test } from 'node:test';
import assert from 'node:assert';
import { sanitizeData } from './security.js';

test('sanitizeData redacts secrets in strings', () => {
    const data = "My secret is super_secret_key_12345";
    const secrets = ["super_secret_key_12345"];
    const result = sanitizeData(data, secrets);
    assert.strictEqual(result, "My secret is [REDACTED]");
});

test('sanitizeData redacts secrets in objects', () => {
    const data = { message: "Key: super_secret_key_12345" };
    const secrets = ["super_secret_key_12345"];
    const result = sanitizeData(data, secrets);
    assert.strictEqual(result.message, "Key: [REDACTED]");
});

test('sanitizeData handles circular references', () => {
    const circular = { name: 'circular' };
    circular.self = circular;

    // This should NOT throw RangeError (Stack Overflow)
    const result = sanitizeData(circular, ['dummy_secret']);

    assert.strictEqual(result.name, 'circular');
    assert.strictEqual(result.self, '[CIRCULAR]');
});

test('sanitizeData preserves primitives', () => {
    const data = {
        id: 123,
        active: true,
        score: 99.5,
        nullValue: null,
        undefinedValue: undefined,
        zero: 0,
        falseValue: false,
        emptyString: ""
    };
    const secrets = ['dummy_secret'];
    const result = sanitizeData(data, secrets);

    assert.strictEqual(result.id, 123);
    assert.strictEqual(result.active, true);
    assert.strictEqual(result.score, 99.5);
    assert.strictEqual(result.nullValue, null);
    assert.strictEqual(result.undefinedValue, undefined);
    assert.strictEqual(result.zero, 0);
    assert.strictEqual(result.falseValue, false);
    assert.strictEqual(result.emptyString, "");
});
