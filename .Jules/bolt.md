## 2024-05-24 - CombatHUD Re-render Optimization
**Learning:** Frequent parent updates (like combat logs) cause child components (`CombatHUD`) to re-render even if their props (`entity`) haven't changed reference.
**Action:** Use `React.memo` on components receiving stable objects from state to prevent unnecessary renders during high-frequency parent updates.
