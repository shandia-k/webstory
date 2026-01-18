import { describe, it, expect, vi } from 'vitest';
import { sanitizeData, safeLog } from './security';

describe('Security Utils', () => {
    describe('sanitizeData', () => {
        it('should redact secrets from string', () => {
            const secret = 'supersecret';
            const input = 'This is a supersecret message';
            const output = sanitizeData(input, [secret]);
            expect(output).toContain('[REDACTED]');
            expect(output).not.toContain(secret);
        });

        it('should handle nested objects', () => {
            const secret = 'secret123';
            const input = {
                a: 'public',
                b: { c: 'secret123 value' }
            };
            const output = sanitizeData(input, [secret]);
            expect(output.b.c).toContain('[REDACTED]');
        });

        it('should handle circular references gracefully', () => {
            const circular = { name: 'circular' };
            circular.self = circular;

            // This should not throw "Maximum call stack size exceeded"
            // Must use a secret > 5 chars to trigger recursion
            const output = sanitizeData(circular, ['secret_very_long']);
            expect(output.name).toBe('circular');
            expect(output.self).toBe('[CIRCULAR]');
        });
    });

    describe('safeLog', () => {
        it('should not throw when logging circular objects', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const circular = { name: 'circular' };
            circular.self = circular;

            expect(() => safeLog('Test error', circular)).not.toThrow();
            consoleSpy.mockRestore();
        });
    });
});
