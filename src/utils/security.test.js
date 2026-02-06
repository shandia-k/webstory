import { test } from 'node:test';
import assert from 'node:assert';
import { generateSecureId } from './security.js';

test('Security Utilities Test Suite', async (t) => {
    await t.test('generateSecureId returns a string', () => {
        const id = generateSecureId();
        assert.strictEqual(typeof id, 'string');
    });

    await t.test('generateSecureId returns a valid UUID v4 format', () => {
        const id = generateSecureId();
        // Regex for UUID v4: 8-4-4-4-12 hex digits, version 4, variant 8,9,a,b
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        assert.match(id, uuidRegex, `ID ${id} does not match UUID v4 format`);
    });

    await t.test('generateSecureId returns unique values', () => {
        const id1 = generateSecureId();
        const id2 = generateSecureId();
        assert.notStrictEqual(id1, id2);
    });

    await t.test('Environment check', () => {
        // Log if we are using native crypto or fallback
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            console.log('Test running with native crypto.randomUUID');
        } else {
            console.log('Test running with fallback generator');
        }
    });
});
