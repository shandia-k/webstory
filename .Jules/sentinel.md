## 2024-05-24 - Recursive Sanitization Vulnerability
**Vulnerability:** `sanitizeData` utility crashed with "Maximum call stack size exceeded" when processing objects with circular references.
**Learning:** Recursive security utilities must always handle circular references, especially when logging arbitrary error objects or debug data.
**Prevention:** Use `WeakSet` to track visited objects in recursive functions.

## 2024-05-24 - Missing Input Validation
**Vulnerability:** `generatePalChat` accepted arbitrary length user input without validation, exposing the LLM to potential token exhaustion or cost inflation.
**Learning:** Even "internal" service calls triggered by user input must validate length and content type at the entry point.
**Prevention:** Implement and enforce `validateInput` (length + control char stripping) for all LLM prompt inputs.
