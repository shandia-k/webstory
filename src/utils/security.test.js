import { describe, it, expect } from 'vitest';
import { sanitizeData } from './security';

describe('sanitizeData', () => {
    it('should redact secrets in strings', () => {
        const input = "This is a secret: sk-12345";
        const secrets = ["sk-12345"];
        const output = sanitizeData(input, secrets);
        expect(output).toBe("This is a secret: [REDACTED]");
    });

    it('should handle circular references without crashing', () => {
        const obj = { name: "test" };
        obj.self = obj; // Circular reference

        // This should not crash
        const output = sanitizeData(obj, ["secret"]);

        // Expect the circular reference to be handled (implementation detail: usually returns object or specific marker)
        // With current implementation, it will crash.
        // With fix, it should return something like { name: "test", self: "[CIRCULAR]" } or similar, or at least not crash.
    });
});
