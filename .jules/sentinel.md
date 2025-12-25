## 2025-05-22 - Infinite Recursion in Sanitization
**Vulnerability:** The `sanitizeData` utility was vulnerable to stack overflow Denial of Service (DoS) when processing objects with circular references.
**Learning:** Even internal utilities intended for security (redacting logs) can introduce vulnerabilities if not robust against malformed or complex input.
**Prevention:** Always implement cycle detection (e.g., using `WeakSet`) when traversing arbitrary object structures recursively.
