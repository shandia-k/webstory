## 2025-05-20 - Circular Reference Denial of Service
**Vulnerability:** `sanitizeData` utility was susceptible to infinite recursion (Stack Overflow) when processing objects with circular references, despite documentation/memory claiming protection existed.
**Learning:** Documentation and Memory can be stale or incorrect. Always verify security mechanisms with code inspection and reproduction scripts.
**Prevention:** Implemented `WeakSet` based cycle detection in `src/utils/security.js`. Future recursive utilities must include cycle detection tests.
