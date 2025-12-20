# Forward Kinematics (FK) Upgrade
*(Replacing previous Translation-based system)*

We have completely rewritten the animation engine to use **Forward Kinematics**. This mimics how real skeletons works: joints **rotate**, they don't just slide.

## Why this is better?
- **Old System (Translation):** Moving a hand right just stretched the arm sideways. No elbow bend.
- **New System (Rotation):** Rotating the shoulder swings the arm in an arc. The elbow stays relative to the shoulder.

## Architecture

### 1. Hierarchy Solver
`animator.js` now uses a recursive solver:
1.  **Root (Hips)** provides a base anchor.
2.  **Children (Spine, Legs)** calculate their position based on:
    *   Parent's final position.
    *   Parent's final angle.
    *   Their own length and local angle.

### 2. Animations
Animations now drive **Angles (Radians)**:
- `walk`: Legs rotate `Math.sin(t)` (Swing), Arms rotate opposite.
- `happy`: Head bobs (rotation) + Arms wave (rotation).

## Testing Guide
1.  **Auto Rig** a Chibi.
2.  Click **Walk**.
    *   *Check:* Do the legs swing in a circle/arc?
3.  Click **Jump**.
    *   *Check:* Do the arms flap (rotate up/down) instead of sliding up/down?

## Troubleshooting
- **No Movement?** Ensure you clicked "Auto Rig" first to initialize the skeleton. The FK solver requires a valid `parentId` chain.
- **Weird Twisting?** If you manually moved bones *after* playing, the `baseAngle` might be reset. Stop and Start animation to re-calibrated.
