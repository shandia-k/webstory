## 2026-01-12 - [React Re-render Optimization]
**Learning:** `React.memo` is ineffective if props (especially callbacks) are recreated on every parent render. To truly optimize, parent components must wrap callbacks in `useCallback` and ensure those callbacks have stable dependencies.
**Action:** When memoizing a component, audit its props. Use functional state updates (`setX(prev => ...)`) in parent handlers to remove state dependencies from `useCallback`, ensuring the handler reference remains stable even when state changes.

## 2026-01-12 - [Context Value Instability]
**Learning:** Providing a plain object literal to `Context.Provider` (`value={{ ... }}`) forces all consumers to re-render every time the provider renders, defeating `React.memo` optimizations in consumers.
**Action:** Always memoize the context value object with `useMemo` (e.g., `const value = useMemo(() => ({ ... }), [deps])`) to ensure referential equality when internal state hasn't changed.
