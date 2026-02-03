## 2024-05-22 - Modal Accessibility & Focus Management
**Learning:** Custom modals (not using `<dialog>`) require manual implementation of accessibility features like `role="dialog"`, `aria-modal="true"`, correct labeling, and focus trapping/management. A small delay (`setTimeout`) is often needed to focus elements inside a modal that is being rendered/animated in.
**Action:** When creating or modifying modals, always check for:
1. `role="dialog"` and `aria-modal="true"` on the container.
2. `aria-labelledby` linking to the modal title.
3. Explicit `aria-label`s for icon-only buttons (Close, Toggle Password).
4. `useRef` and `useEffect` to focus the primary input field on open.

## 2025-02-03 - Modal Interaction Pattern
**Learning:** Existing custom modals (e.g. `SaveLoadModal`) rely on CSS transitions for visibility and often lack keyboard interaction handling (Escape to close, Tab to trap focus). The transition duration (~300ms) requires a matching timeout for initial focus setting to ensure reliability.
**Action:** Implement `useEffect` hooks for focus trapping (Tab/Shift+Tab) and Escape key listening on all custom modals. Use a 350ms timeout for initial focus to match the `duration-300 ease-out delay-75` transition.
