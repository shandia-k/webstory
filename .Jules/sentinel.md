## 2024-05-23 - [DoS Prevention in Logger]
**Vulnerability:** `sanitizeData` utility lacked cycle detection, causing Stack Overflow crashes when logging circular objects (e.g. React components or DOM nodes) if secrets were present.
**Learning:** Documented security features (like cycle detection in memories) must be verified against actual code implementation. Recursion on arbitrary data is always a DoS risk.
**Prevention:** Use `WeakSet` to track visited objects in recursive functions. Added `[CIRCULAR]` replacement for detected cycles.
