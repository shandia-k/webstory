## 2025-02-18 - Standardized Safe Logging
**Vulnerability:** Raw `console.error(error)` usage in `llmService.js` could potentially leak sensitive information (like API keys in request URLs or stack traces) if the underlying SDK or network stack includes them in the error object.
**Learning:** Even with a dedicated `safeLog` utility, developers often default to `console.error`. Inconsistencies create gaps where secrets can leak.
**Prevention:** Enforce usage of `safeLog` (or a similar wrapper) for ALL external service calls that involve credentials. The wrapper must explicitly handle secret redaction before printing to any output stream.
