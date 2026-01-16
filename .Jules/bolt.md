## 2024-05-23 - CSS-in-JS Injection Anti-pattern
**Learning:** Components were injecting `<style>` tags with `@import` and `@keyframes` directly in their render output. This causes CSS re-parsing and layout thrashing on every render/update, and potential flickering.
**Action:** Always move static styles, fonts, and keyframes to `src/index.css` or Tailwind config. Only use inline styles for dynamic values (like coordinates).
