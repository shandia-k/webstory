## 2026-01-09 - Inline Style Injection Performance
**Learning:** React components (like `CuteInterface.jsx`) injecting `<style>` tags with `@import` inside the render loop cause significant performance degradation.
**Impact:**
1. Forces style recalculation on every render.
2. Triggers network requests (if not cached) or blocking behavior for fonts.
3. Bloats the DOM with duplicate style tags if multiple instances exist.
**Action:** Move all static styles, especially keyframes and font imports, to `src/index.css`. Use utility classes for animations.
