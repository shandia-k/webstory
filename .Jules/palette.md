## 2024-12-23 - Accessibility in Custom Modals
**Learning:** Custom modal components (like `SaveLoadModal.jsx`) are often missing standard ARIA attributes (`role="dialog"`, `aria-modal`, `aria-labelledby`) and accessibility labels on icon-only buttons, even when sibling components (like `ApiKeyModal.jsx`) have them implemented correctly.
**Action:** Always verify `role`, `aria-modal`, `aria-labelledby`, and button labels when touching any modal component. Check sibling components for reference implementation patterns.
