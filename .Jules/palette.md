## 2024-05-22 - Modal Accessibility & Focus Management
**Learning:** Custom modals (not using `<dialog>`) require manual implementation of accessibility features like `role="dialog"`, `aria-modal="true"`, correct labeling, and focus trapping/management. A small delay (`setTimeout`) is often needed to focus elements inside a modal that is being rendered/animated in.
**Action:** When creating or modifying modals, always check for:
1. `role="dialog"` and `aria-modal="true"` on the container.
2. `aria-labelledby` linking to the modal title.
3. Explicit `aria-label`s for icon-only buttons (Close, Toggle Password).
4. `useRef` and `useEffect` to focus the primary input field on open.

## 2025-05-23 - Custom Interactive Elements Accessibility
**Learning:** Large custom interactive areas (like the "Pet" div) are often overlooked for accessibility. Without explicit `role="button"`, `tabIndex="0"`, and keyboard event handlers (`onKeyDown`), these primary interactions are completely invisible to keyboard and screen reader users.
**Action:** When implementing custom interactive elements:
1. Always add `role="button"` (or appropriate role).
2. Add `tabIndex="0"` to make it focusable.
3. Implement `onKeyDown` to handle 'Enter' and 'Space' keys, ensuring `e.preventDefault()` for Space to prevent scrolling.
4. Add visible focus styles (e.g., `focus-visible:ring`) so keyboard users know where they are.
