## 2024-05-23 - Chat Overlay Input Performance
**Learning:** In React components managing both a list (e.g., chat history) and a high-frequency input (e.g., text box), keeping them in the same component causes the entire list to re-render on every keystroke. This is an anti-pattern for long lists.
**Action:** Extract the list into a separate, memoized component (`React.memo`) that only accepts stable props (messages), isolating it from the volatile input state.
