## 2025-05-18 - Fix Circular Reference in Security Logger
**Vulnerability:** Stack Overflow Denial of Service (DoS) in `sanitizeData` utility.
**Learning:** Recursively traversing objects for redaction without tracking visited nodes causes a crash when encountering circular references (e.g., complex error objects or DOM nodes).
**Prevention:** Always use a `WeakSet` or similar mechanism to track visited objects when writing recursive object traversal functions.
