import { test } from 'node:test';
import assert from 'node:assert';
import { sanitizeData } from './security.js';

test('sanitizeData should redact secrets', () => {
    const data = { key: 'secret_value_123' };
    const secrets = ['secret_value_123'];
    const result = sanitizeData(data, secrets);
    assert.deepStrictEqual(result, { key: '[REDACTED]' });
});

test('sanitizeData should handle circular references', () => {
    const circularObj = { name: 'circular' };
    circularObj.self = circularObj;

    // Pass a dummy secret to bypass the "empty secrets" optimization
    const result = sanitizeData(circularObj, ['dummy_secret']);

    assert.strictEqual(result.name, 'circular');
    assert.strictEqual(result.self, '[CIRCULAR]');
});

test('sanitizeData should handle DAGs (shared references) correctly', () => {
    const shared = { val: 'shared' };
    const dag = {
        first: shared,
        second: shared
    };

    // Pass a dummy secret to ensure we traverse
    const result = sanitizeData(dag, ['dummy_secret']);

    assert.deepStrictEqual(result.first, { val: 'shared' });
    assert.deepStrictEqual(result.second, { val: 'shared' });
    assert.notStrictEqual(result.second, '[CIRCULAR]');
});
