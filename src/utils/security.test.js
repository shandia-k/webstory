
import { validateInput, sanitizeData } from './security.js';
import assert from 'node:assert';
import test from 'node:test';

test('validateInput limits length', () => {
    const longInput = 'a'.repeat(2000);
    const result = validateInput(longInput, 1000);
    assert.strictEqual(result.length, 1000);
});

test('validateInput strips control characters', () => {
    const dirty = 'Hello\x00World\n';
    const clean = validateInput(dirty);
    assert.strictEqual(clean, 'HelloWorld\n');
});

test('sanitizeData handles circular references', () => {
    const obj = { name: 'test' };
    obj.self = obj;
    const clean = sanitizeData(obj);
    assert.strictEqual(clean.self, '[CIRCULAR]');
    assert.strictEqual(clean.name, 'test');
});

test('sanitizeData redacts secrets', () => {
    const obj = { key: 'secret_key_12345' };
    const clean = sanitizeData(obj, ['secret_key_12345']);
    assert.strictEqual(clean.key, '[REDACTED]');
});

test('sanitizeData handles DAG (shared references) correctly', () => {
    const child = { name: 'child' };
    const parent = { a: child, b: child };

    const clean = sanitizeData(parent);

    assert.deepStrictEqual(clean.a, { name: 'child' });
    assert.deepStrictEqual(clean.b, { name: 'child' });
    assert.notStrictEqual(clean.b, '[CIRCULAR]');
});
