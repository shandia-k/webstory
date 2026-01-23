## 2024-05-22 - Modal Accessibility & Focus Management
**Learning:** Custom modals (not using `<dialog>`) require manual implementation of accessibility features like `role="dialog"`, `aria-modal="true"`, correct labeling, and focus trapping/management. A small delay (`setTimeout`) is often needed to focus elements inside a modal that is being rendered/animated in.
**Action:** When creating or modifying modals, always check for:
1. `role="dialog"` and `aria-modal="true"` on the container.
2. `aria-labelledby` linking to the modal title.
3. Explicit `aria-label`s for icon-only buttons (Close, Toggle Password).
4. `useRef` and `useEffect` to focus the primary input field on open.

## 2025-05-19 - Interactive Elements & Semantic Roles
**Learning:** Custom interactive elements (like the main character emoji) must explicitly handle keyboard events (`onKeyDown` for Enter/Space) and roles (`role="button"`) to be accessible. Native HTML elements like `<progress>` should be used where possible, or `role="progressbar"` with ARIA values for custom implementations.
**Action:**
1. For clickable `div`s: Add `role="button"`, `tabIndex="0"`, and `onKeyDown` handler (preventing default for Space).
2. For custom bars: Add `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-label`.
