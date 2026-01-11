# Sentinel Journal - Security Learnings

## 2024-05-22 - Infinite Recursion in Sanitization Logic
**Vulnerability:** The `sanitizeData` utility function in `src/utils/security.js` is susceptible to stack overflow attacks (DoS) when processing objects with circular references. This is critical because `safeLog` uses this function to sanitize error objects, which frequently contain circular references (e.g., DOM events, framework internals).
**Learning:** Security utilities themselves must be robust against malformed or hostile input. A crash in the security logger effectively disables visibility into the error that caused it.
**Prevention:** Always use a `WeakSet` or similar mechanism to track visited objects when traversing arbitrary data structures for sanitization or serialization.

## 2024-05-22 - Insecure ID Generation
**Vulnerability:** The application uses `Math.random()` for generating unique IDs in `src/utils/security.js`. While currently used for client-side logs, this pattern promotes insecure randomness usage.
**Learning:** `Math.random()` is predictable and not cryptographically secure.
**Prevention:** Use `crypto.randomUUID()` (available in modern browsers and Node.js) for ID generation.
