## 2025-02-18 - Circular Reference DoS in Security Utility
**Vulnerability:** `sanitizeData` utility recursively traversed objects without cycle detection, allowing stack overflow via circular references.
**Learning:** Custom sanitization logic must always handle circular references, especially when used in error logging contexts where objects might be unpredictable.
**Prevention:** Use `WeakSet` to track visited objects in recursive traversals.
