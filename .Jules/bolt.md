# Bolt's Journal ⚡

## 2024-05-22 - Chat Input Lag Optimization
**Learning:** React re-renders the entire component tree on state changes. In `ChatOverlay`, typing in the input field caused the entire message list to re-render on every keystroke because the list was defined inline within the same component that held the input state.
**Action:** Extract expensive list rendering into a separate `React.memo` component (`MessageList`) when the parent component manages high-frequency state updates (like text input). This isolates the list from the input state updates.
