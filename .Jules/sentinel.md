## 2024-05-23 - Weak Random Number Generation in ID Creation
**Vulnerability:** Used `Math.random()` to generate unique IDs for security logs (`src/services/llmService.js`). This is cryptographically weak and can lead to collisions or predictability.
**Learning:** Developers often reach for `Math.random()` for quick ID generation without considering cryptographic requirements, even for non-critical logs.
**Prevention:** Always use `crypto.randomUUID()` for ID generation, or a dedicated library/utility that ensures uniqueness and randomness. Added `generateSecureId` to `src/utils/security.js` to standardize this.
