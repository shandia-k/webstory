# Bolt's Journal

## 2024-05-23 - CSS Animation Performance
**Learning:** Inline styles for complex animations (like `transform` updates in `CuteInterface.jsx`) cause significant layout thrashing and render blocking.
**Action:** Move complex animations to `src/index.css` using keyframes and apply via utility classes (e.g., `animate-float-vertical`). Use `will-change` sparingly and only for active elements.

## 2024-05-23 - React.memo Pitfalls
**Learning:** `React.memo` on components like `NarrativeLog.jsx` is useless if parent callbacks (passed as props) aren't stable.
**Action:** Always wrap callbacks in `useCallback` in parent components (`CombatArena.jsx`, `OmniHub.jsx`) before passing them to memoized children.

## 2024-05-23 - Text Scaling Optimization
**Learning:** Global `window.resize` listeners for text scaling (in `FitText.jsx`) trigger reflows for the entire document on every frame of a resize event.
**Action:** Use `ResizeObserver` attached to the specific container element. This isolates the event loop to just the affected component.

## 2024-05-24 - Context Value Stability
**Learning:** Passing a new object literal `{{ ... }}` to a Context Provider (like `GameContext.Provider`) forces all consumers to re-render on every parent render, regardless of whether the data changed.
**Action:** Wrap the context value object in `useMemo` to ensure referential stability.
