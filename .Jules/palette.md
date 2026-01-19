## 2024-05-22 - Modal Accessibility & Focus Management
**Learning:** Custom modals (not using `<dialog>`) require manual implementation of accessibility features like `role="dialog"`, `aria-modal="true"`, correct labeling, and focus trapping/management. A small delay (`setTimeout`) is often needed to focus elements inside a modal that is being rendered/animated in.
**Action:** When creating or modifying modals, always check for:
1. `role="dialog"` and `aria-modal="true"` on the container.
2. `aria-labelledby` linking to the modal title.
3. Explicit `aria-label`s for icon-only buttons (Close, Toggle Password).
4. `useRef` and `useEffect` to focus the primary input field on open.

## 2024-05-23 - Core Interaction Accessibility
**Learning:** For apps centered around a specific interaction (like "petting" a character), that interaction MUST be accessible via keyboard (Enter/Space). Relying solely on `onClick` on a `div` excludes keyboard users from the core delight of the app.
**Action:** When creating custom interactive elements (that aren't standard buttons/links):
1. Add `role="button"`.
2. Add `tabIndex="0"`.
3. Add `onKeyDown` handler for 'Enter' and ' ' (Space).
4. Ensure `e.preventDefault()` is called for Space to prevent page scrolling.
5. Add visible focus styles (`focus-visible`).
