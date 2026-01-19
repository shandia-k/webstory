## 2026-01-19 - Combat Log Performance
**Learning:** `NarrativeLog` in `CombatArena` was re-rendering on every phase/animation frame update because it wasn't memoized. Since the log history only changes when a new message is added, wrapping it in `React.memo` prevents expensive diffing of the growing log list during visual updates (animations, phase transitions).
**Action:** Always memoize list components that are children of high-frequency update parents (like game loops or animation containers), especially if their props (like `logs`) are append-only or stable.
