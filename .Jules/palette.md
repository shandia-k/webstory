## 2024-05-22 - Modal Accessibility & Focus Management
**Learning:** Custom modals (not using `<dialog>`) require manual implementation of accessibility features like `role="dialog"`, `aria-modal="true"`, correct labeling, and focus trapping/management. A small delay (`setTimeout`) is often needed to focus elements inside a modal that is being rendered/animated in.
**Action:** When creating or modifying modals, always check for:
1. `role="dialog"` and `aria-modal="true"` on the container.
2. `aria-labelledby` linking to the modal title.
3. Explicit `aria-label`s for icon-only buttons (Close, Toggle Password).
4. `useRef` and `useEffect` to focus the primary input field on open.

## 2024-05-22 - Semantic Progress Bars
**Learning:** Visual progress bars implemented with `div`s are invisible to screen readers. Adding `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` makes them accessible.
**Action:** When implementing progress bars:
1. Use `role="progressbar"` on the container.
2. Set ARIA value attributes dynamically.
3. Provide a meaningful `aria-label`.
4. Hide redundant visual text labels using `aria-hidden="true"` to prevent duplicate announcements.
