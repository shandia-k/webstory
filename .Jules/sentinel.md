## 2025-05-19 - Client-Side Prompt Injection Mitigation
**Vulnerability:** User input (Character Name) is directly interpolated into LLM prompts without sanitization, allowing for potential prompt injection.
**Learning:** In client-side BYOK architectures, we cannot trust the backend to filter input. Input validation must be strict and enforced at the UI level before the prompt is constructed.
**Prevention:** Implemented strict whitelist-based input validation (Alphanumeric only) in `src/utils/security.js` and applied it to `NamingPhase.jsx`.
