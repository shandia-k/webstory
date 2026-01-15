## 2026-01-15 - Inline Style Injection Anti-Pattern
**Learning:** Several components (`CuteInterface.jsx`, `StatsDisplay.jsx`) were injecting dynamic `<style>` tags with `@import` and `@keyframes` directly into the render output. This causes expensive style recalculations and layout thrashing on every render, and potentially redundant network requests for fonts.
**Action:** Move all keyframes, fonts, and static animations to `src/index.css`. Use utility classes in components. Avoid `<style>` tags in JSX unless absolutely necessary for dynamic values that cannot be handled via CSS variables.
