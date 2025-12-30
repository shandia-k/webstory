## 2024-05-24 - DoS Protection in Sanitization
**Vulnerability:** Infinite Recursion in Recursive Sanitization
**Learning:** Security utilities that traverse objects recursively must protect against circular references (cycles) to avoid stack overflow DoS attacks. A simple `WeakSet` can track visited objects effectively.
**Prevention:** Always implement cycle detection in deep-traversal functions (cloning, sanitizing, serializing). Use `WeakSet` for tracking to avoid memory leaks.
