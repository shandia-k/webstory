## 2025-02-18 - SanitizeData Circular Reference DoS
**Vulnerability:** The `sanitizeData` utility lacked circular reference detection, causing stack overflows when processing circular objects (e.g., from API responses or logging).
**Learning:** Utility functions used for logging/sanitization must be robust against malformed or circular input to prevent crashing the application they are meant to protect. Recursion without cycle detection is dangerous in shared utilities.
**Prevention:** Implement cycle detection (e.g., using `WeakSet`) in all recursive traversal functions used on untrusted or complex data structures.
