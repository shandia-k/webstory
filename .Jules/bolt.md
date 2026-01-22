## 2024-05-22 - Performance Anti-Pattern: Inline Style Tags
**Learning:** Found `style` tags inside a React component's render method. This forces style recalculation on every render and defeats browser caching of CSS.
**Action:** Extract static styles to a global CSS file or use a CSS-in-JS library properly.
