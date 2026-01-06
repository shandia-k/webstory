## 2024-05-23 - DoS via Circular Object Logging
**Vulnerability:** `sanitizeData` utility lacked cycle detection, causing a Stack Overflow (DoS) when attempting to log/sanitize circular objects (like DOM elements or complex state).
**Learning:** Utility functions used for logging/error handling must be robust against *all* input types, including circular references, otherwise the error handling itself crashes the app.
**Prevention:** Always implement cycle detection (e.g. using `WeakSet`) in recursive object traversal functions.
