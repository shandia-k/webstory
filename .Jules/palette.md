## 2024-05-22 - Modal Accessibility & Focus Management
**Learning:** Custom modals (not using `<dialog>`) require manual implementation of accessibility features like `role="dialog"`, `aria-modal="true"`, correct labeling, and focus trapping/management. A small delay (`setTimeout`) is often needed to focus elements inside a modal that is being rendered/animated in.
**Action:** When creating or modifying modals, always check for:
1. `role="dialog"` and `aria-modal="true"` on the container.
2. `aria-labelledby` linking to the modal title.
3. Explicit `aria-label`s for icon-only buttons (Close, Toggle Password).
4. `useRef` and `useEffect` to focus the primary input field on open.

## 2024-05-22 - Modal Accessibility Standardization
**Learning:** Inconsistent modal implementations (e.g., SaveLoadModal vs ApiKeyModal) create accessibility gaps. Visual overlays without semantic roles (dialog) and focus management leave keyboard/screen-reader users stranded.
**Action:** Standardize all modals to include: 1. role="dialog" & aria-modal="true", 2. aria-labelledby, 3. programmatic focus on open (with transition delay awareness), 4. Escape key listener.
