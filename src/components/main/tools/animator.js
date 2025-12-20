export class Animator {
    constructor() {
        this.physicsState = new Map();
    }

    reset() {
        this.physicsState.clear();
    }

    calculateFrame(baseBones, type, t) {
        // 1. Compute FK Targets
        const targetBones = this.computeFKTargets(baseBones, type, t);

        // 2. Apply Physics (Subtle)
        return this.applyPhysics(targetBones);
    }

    computeFKTargets(baseBones, type, t) {
        // Map ID to Bone for safe lookup
        const boneMap = new Map(baseBones.map(b => [b.id, b]));
        const childrenMap = new Map();
        const roots = [];

        // Build Tree
        baseBones.forEach(b => {
            if (b.parentId && boneMap.has(b.parentId)) {
                if (!childrenMap.has(b.parentId)) childrenMap.set(b.parentId, []);
                childrenMap.get(b.parentId).push(b);
            } else {
                roots.push(b);
            }
        });

        const newBonesMap = new Map(); // id -> {x, y, globalAngle}

        const speed = 0.003; // Slower speed
        const cycle = (freq = 1, offset = 0) => Math.sin((t * speed * freq) + offset);

        // DFS Process
        const processBone = (boneId, parentState) => {
            const restBone = boneMap.get(boneId);
            const name = restBone.name.toLowerCase();

            // --- 1. DETERMINE LOCAL ANIMATION (Rotation/Translation) ---
            let localAngleDelta = 0; // Rotation in Radians relative to REST POSE
            let rootOffset = { x: 0, y: 0 }; // Only for Roots

            // GENTLE ANIMATIONS
            if (type === 'idle') {
                // Subtle breathing
                if (name.includes('torso')) {
                    // Very slight vertical shift
                    rootOffset.y = cycle(0.5) * 0.002;
                }
                if (name.includes('arm')) {
                    const dir = name.includes('l') ? 1 : -1;
                    localAngleDelta = cycle(0.5) * 0.05 * dir; // Very small rotation
                }
                if (name.includes('head')) {
                    localAngleDelta = cycle(0.3) * 0.02;
                }
            }
            else if (type === 'walk') {
                if (name.includes('leg')) {
                    const isLeft = name.includes('l');
                    localAngleDelta = cycle(2, isLeft ? 0 : Math.PI) * 0.3; // Reduced amplitude
                }
                if (name.includes('arm')) {
                    const isLeft = name.includes('l');
                    localAngleDelta = cycle(2, isLeft ? Math.PI : 0) * 0.2;
                }
                if (name.includes('torso') || name.includes('hips')) {
                    rootOffset.y = Math.abs(cycle(2)) * 0.01;
                }
            }
            else if (type === 'jump') {
                // Simple sine jump, less aggressive
                const jumpY = Math.abs(Math.sin(t * 0.005)) * -0.05;
                if (name.includes('torso') || name.includes('hips')) rootOffset.y = jumpY;
            }

            // --- 2. CALCULATE GLOBAL POSITION (The FK Math) ---
            let newState = { x: 0, y: 0, globalAngle: 0, cumulativeRotation: 0 };

            if (!parentState) {
                // ROOT bone (Hips/Torso)
                newState.x = restBone.x + rootOffset.x;
                newState.y = restBone.y + rootOffset.y;
                newState.globalAngle = 0;
                newState.cumulativeRotation = localAngleDelta;
            }
            else {
                // CHILD bone
                const parentRestIdx = baseBones.findIndex(b => b.id === restBone.parentId);
                const parentRest = baseBones[parentRestIdx];

                const dx = restBone.x - parentRest.x;
                const dy = restBone.y - parentRest.y;
                const restDist = Math.sqrt(dx * dx + dy * dy);
                const restAngle = Math.atan2(dy, dx);

                // Apply Parent's Cumulative Rotation
                const parentCumRot = parentState.cumulativeRotation;
                const totalRot = parentCumRot + localAngleDelta;

                // New Angle
                const newAngle = restAngle + totalRot;

                // Calc Position
                newState.x = parentState.x + Math.cos(newAngle) * restDist;
                newState.y = parentState.y + Math.sin(newAngle) * restDist;
                newState.cumulativeRotation = totalRot;
            }

            // Store
            newBonesMap.set(boneId, newState);

            // Recurse
            if (childrenMap.has(boneId)) {
                childrenMap.get(boneId).forEach(child => processBone(child.id, newState));
            }
        };

        roots.forEach(r => processBone(r.id, null));

        // Return in ORIGINAL ORDER to match WebGL Indices
        return baseBones.map(originalBone => {
            if (newBonesMap.has(originalBone.id)) {
                const calculatedState = newBonesMap.get(originalBone.id);
                return {
                    ...originalBone,
                    x: calculatedState.x,
                    y: calculatedState.y
                };
            }
            return originalBone;
        });
    }

    applyPhysics(targetBones) {
        // Very subtle delay/drag
        const stiffness = 0.3; // Higher stiffness = follows target closer (less floppy)
        const damping = 0.6; // Damping

        return targetBones.map(b => {
            if (!this.physicsState.has(b.id)) {
                this.physicsState.set(b.id, { x: b.x, y: b.y, vx: 0, vy: 0 });
            }

            const state = this.physicsState.get(b.id);
            const ax = (b.x - state.x) * stiffness;
            const ay = (b.y - state.y) * stiffness;

            state.vx += ax;
            state.vy += ay;
            state.vx *= damping;
            state.vy *= damping;
            state.x += state.vx;
            state.y += state.vy;

            return {
                ...b,
                x: state.x,
                y: state.y
            };
        });
    }
}

export const animator = new Animator();
