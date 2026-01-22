## 2025-05-18 - Safe Data Sanitization & Input Validation
**Vulnerability:** `sanitizeData` utility was vulnerable to Stack Overflow DoS via circular references, and User Input was unvalidated.
**Learning:** Security utilities must be robust against malformed data (circular refs) as they are often used in error handlers. Missing input validation in UI allowed potential prompt injection.
**Prevention:**
1. Use `WeakSet` in recursive traversal to detect cycles.
2. Implement and enforce `validateInput` with allowlists (RegEx) at the UI entry point before passing data to LLM.
