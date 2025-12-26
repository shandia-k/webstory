## 2025-05-23 - Circular Reference DoS in Security Utils
**Vulnerability:** `sanitizeData` utility caused infinite recursion (Stack Overflow) when processing objects with circular references.
**Learning:** Security utilities used in error handling (`safeLog`) must be robust against *all* input types, including malformed/circular objects, otherwise they cause the crash they try to log.
**Prevention:** Always implement cycle detection (using `WeakSet` or similar) in recursive object traversal utilities.
