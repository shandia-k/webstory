# Sentinel Security Journal

## 2025-02-19 - Circular References in Data Sanitization
**Vulnerability:** The `sanitizeData` utility in `src/utils/security.js` was vulnerable to stack overflow (DoS) when processing objects with circular references. This typically occurs when logging React synthetic events or DOM nodes.
**Learning:** Utility functions intended for logging or sanitization must be robust against *all* input types, including malformed or circular data structures, because they are often the last line of defense in error handling. A crash in the logging mechanism masks the original error and brings down the application.
**Prevention:**
1. Always use a `WeakSet` or similar mechanism to track visited objects in recursive functions traversing arbitrary data.
2. When implementing "deep clone" or "deep traverse" logic, default to handling cycles gracefully (e.g., replacing with `[CIRCULAR]`).
3. Test security utilities with circular data structures explicitly.
