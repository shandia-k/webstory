## 2025-05-27 - Inline Style Injection Anti-Pattern
**Learning:** Found components (e.g., `StatPill`) injecting keyframe animations via inline `<style>` tags. This forces style recalculation and DOM updates on every render, even if the style string is constant.
**Action:** Centralize keyframe animations in `src/index.css` and use utility classes. This allows the browser to handle animations more efficiently and keeps components clean.
