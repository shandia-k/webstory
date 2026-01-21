## 2024-05-23 - CSS Performance Anti-Pattern
**Learning:** Several key components (`CuteInterface`, `AdoptionForm`, `StatsDisplay`) were injecting inline `<style>` tags with `@import` and `@keyframes` directly in the render output. This causes style recalculations on every render and duplicates font requests/style definitions.
**Action:** Always check for `const styles = ...` patterns in components. Move these to `src/index.css` using utility classes or Tailwind config.

## 2024-05-23 - Missing Lint Configuration
**Learning:** The project lists `eslint` dependencies but is missing `eslint.config.js` (or `.eslintrc`), causing `pnpm lint` to fail universally.
**Action:** Do not rely on `pnpm lint` for verification until this is fixed. Use `pnpm build` to verify syntax and compilation.
