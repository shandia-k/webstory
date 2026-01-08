## 2025-01-08 - Dynamic Style Injection in Render Loop
**Learning:** Found a performance anti-pattern where a component (`StatsDisplay`) was creating and injecting a `<style>` tag with keyframes inside its render function. This causes browser style recalculation on every render and duplicates styles for each instance.
**Action:** Always move static keyframes and classes to global CSS (e.g., `index.css`) or use a CSS-in-JS library properly (not raw strings in render).
