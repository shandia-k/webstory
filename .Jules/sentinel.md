## 2025-05-25 - Recursive Sanitization Risk
**Vulnerability:** `sanitizeData` utility lacked circular reference protection, posing a Denial of Service (DoS) risk via stack overflow if passed cyclic objects.
**Learning:** Utility functions intended for deep traversal must explicitly handle circular references, especially when processing user-controlled or complex state objects. `WeakSet` is an efficient mechanism for this.
**Prevention:** Always implement cycle detection in recursive object traversal functions.
