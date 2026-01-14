## 2025-01-14 - Circular Reference Protection in sanitizeData
**Vulnerability:** The `sanitizeData` function was vulnerable to stack overflow when processing objects with circular references (common in React error objects and complex state).
**Learning:** Security utility functions that traverse objects must always guard against infinite recursion.
**Prevention:** Implemented `WeakSet` based cycle detection to return `'[CIRCULAR]'` instead of crashing.
