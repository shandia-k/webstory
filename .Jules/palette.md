## 2024-05-22 - Modal Accessibility & Focus Management
**Learning:** Custom modals (not using `<dialog>`) require manual implementation of accessibility features like `role="dialog"`, `aria-modal="true"`, correct labeling, and focus trapping/management. A small delay (`setTimeout`) is often needed to focus elements inside a modal that is being rendered/animated in.
**Action:** When creating or modifying modals, always check for:
1. `role="dialog"` and `aria-modal="true"` on the container.
2. `aria-labelledby` linking to the modal title.
3. Explicit `aria-label`s for icon-only buttons (Close, Toggle Password).
4. `useRef` and `useEffect` to focus the primary input field on open.

## 2024-05-22 - Destructive Action Modals
**Learning:** For modals prompting destructive actions (like "New Game" overwriting a save), it is safer to default focus to the "Cancel" button rather than the "Confirm" button to prevent accidental data loss.
**Action:** Use `useRef` to target the Cancel button and focus it on mount for confirmation dialogs.
