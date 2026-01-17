## 2024-05-22 - Modal Accessibility & Focus Management
**Learning:** Custom modals (not using `<dialog>`) require manual implementation of accessibility features like `role="dialog"`, `aria-modal="true"`, correct labeling, and focus trapping/management. A small delay (`setTimeout`) is often needed to focus elements inside a modal that is being rendered/animated in.
**Action:** When creating or modifying modals, always check for:
1. `role="dialog"` and `aria-modal="true"` on the container.
2. `aria-labelledby` linking to the modal title.
3. Explicit `aria-label`s for icon-only buttons (Close, Toggle Password).
4. `useRef` and `useEffect` to focus the primary input field on open.

## 2024-05-23 - Component Cleanup & Usage Verification
**Learning:** UX improvements can be wasted on unused components (Ghost Components). In this codebase, `SettingsModal.jsx` exists but is unused; the active components are `SaveLoadModal.jsx` and `ApiKeyModal.jsx`.
**Action:** Before optimizing a component, verify it is actually imported and used in the main application flow (e.g., in `OmniHub.jsx`) to ensure efforts directly impact the user experience.
