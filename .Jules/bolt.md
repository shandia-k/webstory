## 2025-05-20 - Broken Linting
**Learning:** `pnpm lint` fails because `eslint.config.js` is missing, despite `package.json` having a lint script and dependencies.
**Action:** Do not rely on `pnpm lint` for verification. Use manual code review and `pnpm build` instead.
