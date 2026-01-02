## 2024-05-23 - Circular Reference DoS Protection
**Vulnerability:** The `sanitizeData` utility in `src/utils/security.js` lacked cycle detection.
**Learning:** Recursively traversing objects without tracking visited references leads to infinite recursion and stack overflow crashes when circular structures (like DOM nodes or React events) are logged.
**Prevention:** Use a `WeakSet` to track visited objects during recursion and bail out or replace with a placeholder (`[CIRCULAR]`) when a cycle is detected.

## 2024-05-23 - Static Analysis Gap
**Vulnerability:** The project lacked an `eslint.config.js` file, meaning `pnpm lint` was failing and static analysis was not running.
**Learning:** Without active linting, security regressions (like using `any` indiscriminately or missing hook dependencies) go unnoticed.
**Prevention:** Ensure the build pipeline includes a valid ESLint configuration that matches the project's ecosystem (e.g., Flat Config for ESLint 9+).
