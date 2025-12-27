## 2024-05-23 - Fix Circular Reference Denial of Service
**Vulnerability:** The `sanitizeData` utility was vulnerable to a Denial of Service (Stack Overflow) attack when processing objects with circular references. This could be triggered by logging complex objects (like DOM nodes or React events) via `safeLog` or `saveDebugLog`.
**Learning:** Even internal utility functions used for logging/debugging can introduce availability risks if they don't handle recursive structures safely. Documentation/Memory might claim security features (like "Cycle Detection") that are missing in the actual code.
**Prevention:** Always implement cycle detection (using `WeakSet` or similar) in recursive functions that process unknown or user-controlled object structures.
