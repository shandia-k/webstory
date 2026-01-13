
import { sanitizeData } from './security.js';

// Simple test runner since no test framework is configured
function runTests() {
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            failed++;
        }
    }

    function assertEqual(actual, expected, message) {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);
        if (actualStr === expectedStr) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            console.error(`   Expected: ${expectedStr}`);
            console.error(`   Actual:   ${actualStr}`);
            failed++;
        }
    }

    console.log('Running Security Utils Tests...');

    // Test 1: Basic Redaction
    const secret = 'supersecretkey';
    const text = 'This is a supersecretkey value';
    const sanitized = sanitizeData(text, [secret]);
    assert(sanitized.includes('[REDACTED]'), 'Should redact secret in string');
    assert(!sanitized.includes(secret), 'Should not contain secret');

    // Test 2: Nested Object Redaction
    const obj = {
        public: 'visible',
        private: {
            key: 'supersecretkey',
            other: 'normal'
        }
    };
    const sanitizedObj = sanitizeData(obj, [secret]);
    assert(sanitizedObj.private.key.includes('[REDACTED]'), 'Should redact nested secret');
    assertEqual(sanitizedObj.public, 'visible', 'Should preserve non-secret data');

    // Test 3: Array Redaction
    const arr = ['normal', 'supersecretkey', 'also normal'];
    const sanitizedArr = sanitizeData(arr, [secret]);
    assert(sanitizedArr[1].includes('[REDACTED]'), 'Should redact secret in array');

    // Test 4: Circular Reference
    const circular = { name: 'loop' };
    circular.self = circular;
    try {
        const result = sanitizeData(circular, [secret]);
        assertEqual(result.self, '[CIRCULAR]', 'Should handle circular reference');
        assertEqual(result.name, 'loop', 'Should preserve other properties in circular object');
    } catch (e) {
        assert(false, `Circular reference caused crash: ${e.message}`);
    }

    // Test 5: Deep Circular Reference
    const deep = { a: { b: {} } };
    deep.a.b.c = deep.a;
    try {
        const result = sanitizeData(deep, [secret]);
        assertEqual(result.a.b.c, '[CIRCULAR]', 'Should handle deep circular reference');
    } catch (e) {
        assert(false, `Deep circular reference caused crash: ${e.message}`);
    }

    // Test 6: Null and Undefined
    assertEqual(sanitizeData(null), null, 'Should handle null');
    assertEqual(sanitizeData(undefined), undefined, 'Should handle undefined');

    console.log(`\nTest Summary: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
}

runTests();
