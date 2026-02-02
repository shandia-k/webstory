## 2025-05-22 - Recursive Data Sanitization
**Vulnerability:** Stack overflow DoS risk in `sanitizeData` when handling circular references.
**Learning:** Recursive algorithms on user or external data MUST handle cycles, even if the data is expected to be clean (e.g. from debug logs or external APIs).
**Prevention:** Use `WeakSet` to track visited objects in recursive functions to safely detect and handle cycles without memory leaks.
