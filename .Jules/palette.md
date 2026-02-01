## 2024-05-22 - Modal Accessibility & Focus Management
**Learning:** Custom modals (not using `<dialog>`) require manual implementation of accessibility features like `role="dialog"`, `aria-modal="true"`, correct labeling, and focus trapping/management. A small delay (`setTimeout`) is often needed to focus elements inside a modal that is being rendered/animated in.
**Action:** When creating or modifying modals, always check for:
1. `role="dialog"` and `aria-modal="true"` on the container.
2. `aria-labelledby` linking to the modal title.
3. Explicit `aria-label`s for icon-only buttons (Close, Toggle Password).
4. `useRef` and `useEffect` to focus the primary input field on open.

## 2024-05-23 - Accessibility of Custom Game Interactions
**Learning:** Core gameplay loops often rely on large, custom interactive elements (like the "Pet" emoji div) that default to being inaccessible. Making these keyboard-accessible requires manual implementation of `role="button"`, `tabIndex="0"`, and `onKeyDown` handlers (specifically capturing Space to prevent scrolling).
**Action:** When designing custom interactive game elements:
1. Ensure they are focusable (`tabIndex="0"`).
2. Add visible focus indicators (e.g., `focus-visible:ring`).
3. Map both Enter and Space keys to the click handler.
4. Always provide an `aria-label` describing the action, not just the visual content.
