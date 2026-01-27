## 2025-02-18 - Recursive Utility Vulnerability
**Vulnerability:** `sanitizeData` utility crashed on circular references due to unchecked recursion.
**Learning:** Utility functions intended for error handling (like `safeLog`) must be more robust than the code they are logging.
**Prevention:** Always implement cycle detection (e.g., `WeakSet`) in recursive object traversal utilities.
