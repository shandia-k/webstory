import { describe, it } from 'node:test';
import assert from 'node:assert';
import { sanitizeData, validateInput } from './security.js';

describe('Security Utils', () => {
  it('should handle circular references in sanitizeData', () => {
    const circular = { name: 'Circular' };
    circular.self = circular;
    const secrets = ['secret'];

    // Should not throw stack overflow
    const result = sanitizeData(circular, secrets);
    assert.ok(result);
    // Circular ref should be replaced by '[CIRCULAR]' or similar, or just not recurse
    assert.strictEqual(result.name, 'Circular');
  });

  it('should validate input limits and content', () => {
      const limit = 10;
      const input = 'This is a very long string';
      const result = validateInput(input, limit);
      assert.strictEqual(result.length, limit);
      assert.strictEqual(result, 'This is a ');

      const dirty = 'Hello\x00World'; // Null byte
      const clean = validateInput(dirty);
      assert.strictEqual(clean, 'HelloWorld');
  });
});
