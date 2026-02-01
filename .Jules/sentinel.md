## 2024-05-23 - Missing Input Validation & Circular Reference Crash
**Vulnerability:** User input was interpolated directly into LLM prompts without length validation (DoS risk). `sanitizeData` was vulnerable to stack overflow from circular references.
**Learning:** Memory/Documentation claimed these security controls existed, but they were missing from the actual code. Blind trust in documentation can leave gaps.
**Prevention:** Always verify security controls via code inspection or tests. Implemented `validateInput` and added circular reference protection to `sanitizeData`.
