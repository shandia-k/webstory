
# Juicy Tactile Interactions

## Goal
Make interaction with the Pal feel "alive" and tactile. Replace static clicks with dynamic, physics-like responses.

## 1. Cursor Tracking (Face)
- **Concept**: The Pal's emoji "container" slightly rotates or translates towards the mouse cursor.
- **Implementation**:
  - `onMouseMove` on the main container.
  - Calculate `deltaX` and `deltaY` from the center of the Pal emoji.
  - Apply `transform: translate(x, y)` limited to small range (e.g., ±15px).
  - Apply `transform: rotate(deg)` limited to small range (e.g., ±5deg).
  - Only active when `InteractionState` is IDLE or ANTICIPATE.

## 2. Rub-to-Pet (Hold Mechanic)
- **Concept**: Clicking once does nothing (or just a small poke). Holding and continuously moving the mouse ("rubbing") builds up a "Pet Meter".
- **Logic**:
  - `onMouseDown`: Set `isHolding = true`. Start particle timer.
  - `onMouseMove` (while `isHolding`):
    - Track total distance moved.
    - If distance > threshold, spawn small heart particle at cursor.
    - Accrue `rubAmount`.
  - `onMouseUp` / `onMouseLeave`:
    - Check `rubAmount`.
    - If `rubAmount` > `PET_THRESHOLD`: Trigger `handleAction('pet')`.
    - If `rubAmount` < `PET_THRESHOLD`: Just a Poke (small bounce, maybe "Huh?" emoji).
    - Reset.

## 3. Dynamic Reactions
- **Bounce Intensity**: Higher happiness = Bouncier idle.
- **Squish on Click**: Visual feedback on `onMouseDown` (scale down) and `onMouseUp` (spring back).
