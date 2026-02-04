## 2024-05-22 - Modal Accessibility & Focus Management
**Learning:** Custom modals (not using `<dialog>`) require manual implementation of accessibility features like `role="dialog"`, `aria-modal="true"`, correct labeling, and focus trapping/management. A small delay (`setTimeout`) is often needed to focus elements inside a modal that is being rendered/animated in.
**Action:** When creating or modifying modals, always check for:
1. `role="dialog"` and `aria-modal="true"` on the container.
2. `aria-labelledby` linking to the modal title.
3. Explicit `aria-label`s for icon-only buttons (Close, Toggle Password).
4. `useRef` and `useEffect` to focus the primary input field on open.

## 2025-02-23 - Custom Interaction Accessibility
**Learning:** Decorative elements used for core interactions (like the Pet emoji) are often implemented as `div`s, completely bypassing keyboard users.
**Action:** When identifying custom interactions, immediately wrap or attribute them with `role="button"`, `tabIndex={0}`, and `onKeyDown` handlers for Enter/Space.
