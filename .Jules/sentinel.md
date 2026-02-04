# Sentinel Journal

## 2025-02-18 - Weak Random Number Generation in IDs
**Vulnerability:** `Math.random()` was used to generate session/debug IDs in `llmService.js`. While these were primarily for debug logs, using `Math.random` for identifiers is insecure due to predictability and higher collision risk.
**Learning:** Even for non-critical IDs, using `Math.random` sets a bad precedent. It encourages a pattern that might inadvertently be applied to security-critical tokens (like session IDs) later.
**Prevention:** Always use `crypto.randomUUID()` for unique identifiers. It is now standard in Node.js and modern browsers. A utility `generateSecureId` was added to `src/utils/security.js` to standardize this and provide a secure fallback or warning if needed.
