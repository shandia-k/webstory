# Bolt's Performance Journal

## 2024-05-22 - Inline Style Injection
**Learning:** Injecting `<style>` tags with `@import` directives inside React components causes render-blocking behavior and style recalculations on every render.
**Action:** Move static keyframes and `@import` font declarations to global CSS (`src/index.css`) and use utility classes. This prevents FOUC and improves render performance.

## 2024-05-22 - React.memo Optimization
**Learning:** High-frequency state updates (like particle effects in `CuteInterface`) can cause expensive re-renders of children (`StatsDisplay`, `StatPill`) even if their props haven't changed.
**Action:** Wrap static/slow-changing children in `React.memo` to isolate them from parent's high-frequency animations.
