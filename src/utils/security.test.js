import { test } from 'node:test';
import assert from 'node:assert';
import { validateInput } from './security.js';

test('validateInput - name', async (t) => {
  await t.test('accepts valid name', () => {
    const result = validateInput('ValidName', 'name');
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.error, null);
    assert.strictEqual(result.sanitized, 'ValidName');
  });

  await t.test('accepts valid name with spaces and dashes', () => {
    const result = validateInput('Valid-Name 123', 'name');
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.error, null);
  });

  await t.test('sanitizes input', () => {
    const result = validateInput('  Name  ', 'name');
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.sanitized, 'Name');
  });

  await t.test('sanitizes newlines', () => {
    const result = validateInput('Name\n', 'name');
    assert.strictEqual(result.isValid, true); // It is valid because it gets trimmed
    assert.strictEqual(result.sanitized, 'Name');
  });

  await t.test('rejects empty name', () => {
    const result = validateInput('', 'name');
    assert.strictEqual(result.isValid, false);
    assert.match(result.error, /empty/);
  });

  await t.test('rejects whitespace only name', () => {
    const result = validateInput('   ', 'name');
    assert.strictEqual(result.isValid, false);
    assert.match(result.error, /empty/);
  });

  await t.test('rejects too long name', () => {
    const longName = 'a'.repeat(21);
    const result = validateInput(longName, 'name');
    assert.strictEqual(result.isValid, false);
    assert.match(result.error, /too long/);
  });

  await t.test('rejects invalid characters', () => {
    const invalidNames = ['Name!', 'Name@', '<script>'];
    invalidNames.forEach(name => {
      const result = validateInput(name, 'name');
      assert.strictEqual(result.isValid, false, `Failed for input: ${name}`);
      assert.match(result.error, /Alphanumeric/);
    });
  });
});
