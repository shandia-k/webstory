## 2025-10-26 - Circular Reference Denial of Service
**Vulnerability:** The `sanitizeData` utility, used for redaction in logs, lacked circular reference detection. Logging a circular object (e.g., via `safeLog`) would cause a "Maximum call stack size exceeded" crash (DoS).
**Learning:** Recursive utility functions that process arbitrary objects must always protect against circular references, even if the primary use case (e.g. JSON) assumes acyclic data. Implicit assumptions about data structure are dangerous in shared utilities.
**Prevention:** Always implement cycle detection (e.g., using `WeakSet`) in recursive object traversal functions.
