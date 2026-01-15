## 2024-05-23 - Circular Reference DoS Protection
**Vulnerability:** The `sanitizeData` utility in `src/utils/security.js` recursively processed objects without tracking visited references. This allowed objects with circular references (e.g., `A -> B -> A`) to cause a stack overflow crash (Denial of Service).
**Learning:** Even simple recursive utilities must handle cyclic graphs if they process arbitrary input (like error logs or API responses) which may inadvertently contain cycles.
**Prevention:** Always implement cycle detection in recursive object traversal functions using `WeakSet` or `Set` to track visited nodes.
