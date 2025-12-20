# Forward Kinematics (FK) Upgrade Plan

## Problem
The current engine is "stiff" because it moves bones by sliding them (Translation X/Y). Real skeletons move by rotating joints (Rotation).
- **Current:** "Pulling the hand bone to the right." (Result: Stretched arm, no elbow bending).
- **Target:** "Rotating the shoulder 45 degrees." (Result: Arm swings in an arc, looking natural).

#### [MODIFY] [RiggingStudio.jsx](file:///d:/antigravity/webstory/src/components/main/tools/RiggingStudio.jsx)
- Add "Vectorize" tool button.
- Handle SVG output (replace current image state with SVG Data URI).

## Proposed Solution
Refactor the `animator.js` and `useRiggingStudio.js` to use **Forward Kinematics**.

### 1. Data Structure Update
Bones need new properties:
- `rotation`: Current angle in radians (relative to parent).
- `baseRotation`: The initial angle when rigged.
- `length`: Distance to parent (automatically calculated).

### 2. The FK Solver (`animator.js`)
Instead of returning `x + off`, we will:
1.  **Animate Angles**: The animation functions (walk, idle) will now modify `rotation` instead of `x/y`.
    *   *Example:* `l_arm.rotation = Math.sin(t) * 0.5` (Component swings).
2.  **Solve Hierarchy**:
    *   Start at Root (Hips).
    *   For each child, calculate absolute X/Y:
        `child.x = parent.x + cos(parent.angle + child.angle) * child.length`
    *   This ensures limbs stay attached and rotate perfectly.

### 3. Rendering
 The `WebGLDeformer` treats bones as points, so as long as the FK solver outputs the correct final X/Y coordinates for the "End of the bone", the mesh deformation will work. *However*, for better results, we might treat the bone as the *start* of the segment rather than the *end*, but for now, updating the point positions via arc motion is a huge improvement.

## Tasks
- [ ] **Refactor Auto-Rig**: Calculate initial `length` and `baseRotation` for every bone relative to its parent.
- [ ] **Implement `solveFK`**: A function that takes a bone hierarchy with local rotations and outputs global X/Y positions.
- [ ] **Rewrite Animations**: Update `idle`, `walk`, `jump` to drive **Angles** instead of **Offsets**.

## Expected Result
- "Swinging" arms instead of "Sliding" arms.
- Knees and elbows that look like they are bending (because the child bone orbits the parent).
- Much smoother, organic movement.
