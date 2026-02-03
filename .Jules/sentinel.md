# Sentinel's Journal

## 2026-02-03 - Weak Random Number Generation in ID Creation
**Vulnerability:** The application was using `Date.now() + Math.random().toString(36)` to generate identifiers for debug logs. While these logs are local, `Math.random()` is not cryptographically secure and yields predictable values, making it unsuitable for any security-sensitive IDs or tokens.
**Learning:** Even in non-critical components like debug logging, using insecure random number generation can normalize bad patterns. Developers might copy-paste this "ID generation" snippet to more critical parts of the application (like session IDs or API tokens) without realizing the risk.
**Prevention:** Enforce the use of `crypto.randomUUID()` (or `crypto.getRandomValues`) for all identifier generation. A centralized `generateSecureId` utility was created in `src/utils/security.js` to provide a safe, easy-to-use alternative that handles fallbacks automatically.
