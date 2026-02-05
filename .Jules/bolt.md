## 2024-05-24 - Chat Input Lag Prevention
**Learning:** The ChatOverlay component was re-rendering the entire message list on every keystroke. In an AI RPG where chat logs grow indefinitely, this O(n) rendering cost on O(1) input events creates significant input lag.
**Action:** Extracted `MessageList` into a `React.memo` component. Always isolate high-frequency state updates (like text input) from expensive list renderings using component composition and memoization.
