import { processAutoRigging } from './imageProcessing';
import { analyzeImagePoints } from '../../../services/llmService';

// --- STEP 1: PROCESSING ---
export const processImageStep = (imgElement) => {
    const { originalClean, parts, geminiInput } = processAutoRigging(imgElement);
    if (parts.length < 2) {
        console.warn("Single Mesh / A-Pose detected. Running in mesh mode.");
    }
    return { originalClean, parts, geminiInput };
};

// --- STEP 2: VISION ANALYSIS ---
export const analyzeTagsStep = async (apiKey, geminiInput) => {
    const visionResult = await analyzeImagePoints(apiKey, geminiInput);
    return { pivotData: visionResult.parts };
};

// --- STEP 2.5: AUTO-TAGGING LOGIC ---
// Matches parts to Gemini keys and applies IDs (without creating bones yet)
export const processAutoTagging = (parts, pivotData, canvasW, canvasH) => {
    const allPoints = Object.values(pivotData).flat();
    const cleanPoints = allPoints.map(p => parseFloat(p));
    const isNormalized = cleanPoints.every(v => v <= 1.0);
    const coordScale = isNormalized ? 1.0 : (1.0 / 1000.0);

    // Deep copy parts to avoid mutation if needed, or modify in place
    // We modify meaningful IDs.
    const taggedParts = parts.map(p => ({ ...p })); // Clone

    const findMatchingPart = (x, y) => {
        // 1. Exact Match inside Box
        const exact = taggedParts.find(p =>
            x >= p.bbox.x && x <= (p.bbox.x + p.bbox.w) &&
            y >= p.bbox.y && y <= (p.bbox.y + p.bbox.h)
        );
        if (exact) return exact;

        // 2. Nearest Neighbor
        let closest = null;
        let minDst = Infinity;

        taggedParts.forEach(p => {
            const centerX = p.bbox.x + (p.bbox.w / 2);
            const centerY = p.bbox.y + (p.bbox.h / 2);
            const dst = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            if (dst < minDst) {
                minDst = dst;
                closest = p;
            }
        });

        if (closest) return closest;
        return null;
    };

    // Iterate known keys to tag parts
    const keysToTag = [
        'head', 'torso',
        'arm_L_upper', 'arm_R_upper',
        'leg_L', 'leg_R' // Gemini prompt uses leg_L, not upper
    ];

    keysToTag.forEach(geminiKey => {
        const rawPoint = pivotData[geminiKey];
        if (!rawPoint) return;
        const gx = parseFloat(rawPoint[0]);
        const gy = parseFloat(rawPoint[1]);
        const searchPixelX = gx * coordScale * canvasW;
        const searchPixelY = gy * coordScale * canvasH;

        const matchPart = findMatchingPart(searchPixelX, searchPixelY);
        if (matchPart) {
            const tag = geminiKey.replace('_upper', '').replace('_lower', '');

            // Allow overwriting "part_*" but preserve if already tagged by priority?
            // Simple logic: If it looks generic, overwrite.
            const isGeneric = matchPart.id.startsWith('part_');
            if (isGeneric || !['head', 'torso'].includes(matchPart.id)) {
                matchPart.id = tag;
            }
        }
    });

    return taggedParts;
};

// --- STEP 3: ASSEMBLY (ANATOMY ENFORCED) ---
export const assembleSkeletonStep = (parts, pivotData, canvasW, canvasH) => {
    const newBones = [];

    // SCALE logic
    const allPoints = Object.values(pivotData).flat();
    const cleanPoints = allPoints.map(p => parseFloat(p));
    const isNormalized = cleanPoints.every(v => v <= 1.0);
    const coordScale = isNormalized ? 1.0 : (1.0 / 1000.0);

    const createBone = (id, checkKeys, parentId, mountPointKey = null) => {
        // checkKeys can be array of fallbacks e.g. ['leg_L', 'leg_L_upper']
        // Gemini dict keys.
        let geminiKey = null;
        if (Array.isArray(checkKeys)) {
            geminiKey = checkKeys.find(k => pivotData[k]);
        } else {
            geminiKey = checkKeys;
        }

        if (!geminiKey || !pivotData[geminiKey]) return null;
        const rawPoint = pivotData[geminiKey];

        const gx = parseFloat(rawPoint[0]);
        const gy = parseFloat(rawPoint[1]);

        // 1. Target Position (World Space) - Mount Point
        // Kita tetap percaya AI untuk menentukan "Dimana Leher di Badan Torso" (Mount Point)
        let targetX = gx;
        let targetY = gy;

        if (mountPointKey && pivotData[mountPointKey]) {
            targetX = parseFloat(pivotData[mountPointKey][0]);
            targetY = parseFloat(pivotData[mountPointKey][1]);
        }

        const bonePixelX = targetX * coordScale * canvasW;
        const bonePixelY = targetY * coordScale * canvasH;

        // 2. Find Linked Part
        const expectedPartId = id.replace('_upper', '');
        const sprite = parts.find(p => p.id === expectedPartId);

        let spriteId = null;
        let pivotOffset = { x: 0, y: 0 };

        if (sprite) {
            spriteId = sprite.id;
            const w = sprite.bbox.w;
            const h = sprite.bbox.h;

            // --- ANATOMY ENFORCER (LOGIKA BARU) ---
            // Force anatomical pivots for standard parts

            let localPixelX, localPixelY;

            if (id.includes('head')) {
                // HEAD: Pivot always Bottom Center (Neck)
                localPixelX = w / 2;
                localPixelY = h * 0.90; // 90% down
            }
            else if (id.includes('arm') || id.includes('leg')) {
                // LIMBS: Pivot always Top Center (Shoulder/Hip)
                localPixelX = w / 2;
                localPixelY = h * 0.15; // 15% from top
            }
            else {
                // TORSO / OTHERS: Use AI Point relative to sprite
                const sourcePixelX = gx * coordScale * canvasW;
                const sourcePixelY = gy * coordScale * canvasH;
                localPixelX = sourcePixelX - sprite.bbox.x;
                localPixelY = sourcePixelY - sprite.bbox.y;
            }

            // --- SANITY CHECK (FINAL LAYER) ---
            // Kalau misal hasil hitungan di atas masih aneh (keluar kotak), reset ke tengah.
            const margin = 20;
            const isOutlier =
                localPixelX < -margin || localPixelX > (w + margin) ||
                localPixelY < -margin || localPixelY > (h + margin);

            if (isOutlier) {
                // Reset ke tengah jika kalkulasi gagal total
                localPixelX = w / 2;
                localPixelY = h / 2;
            }

            pivotOffset = {
                x: localPixelX / canvasW,
                y: localPixelY / canvasH
            };
        }

        return {
            id: id,
            name: id.replace(/_/g, ' '),
            parentId: parentId,
            spriteId: spriteId,
            x: bonePixelX / canvasW,
            y: bonePixelY / canvasH,
            pivotOffset: pivotOffset
        };
    };

    // --- DEFINE HIERARCHY ---
    // Root
    const torso = createBone('torso', 'torso', null, null);
    if (torso) newBones.push(torso);

    // Head
    const head = createBone('head', 'head', 'torso', 'torso_neck');
    if (head) newBones.push(head);

    // Limbs
    ['arm_L', 'arm_R', 'leg_L', 'leg_R'].forEach(limb => {
        let boneId = limb;
        let geminiKey = limb;

        if (limb.includes('arm')) {
            boneId = limb + '_upper';
            geminiKey = limb + '_upper';
        } else {
            geminiKey = [limb, limb + '_upper'];
        }

        const mountKey = 'torso_' + (limb.includes('arm') ? 'shoulder_' : 'hip_') + limb.slice(-1);

        const b = createBone(boneId, geminiKey, 'torso', mountKey);
        if (b) newBones.push(b);
    });

    return newBones;
};

// --- LEGACY WRAPPER (Run All) ---
export const runAutoRigProcessing = async (imgElement, apiKey, setStatusMsg) => {
    // 1. Process
    const { originalClean, parts, geminiInput } = processImageStep(imgElement);

    // 2. Vision
    const { pivotData } = await analyzeTagsStep(apiKey, geminiInput);

    // 2.5 Tagging
    const canvasW = imgElement.naturalWidth;
    const canvasH = imgElement.naturalHeight;
    const taggedParts = processAutoTagging(parts, pivotData, canvasW, canvasH);

    // 3. Assemble
    const newBones = assembleSkeletonStep(taggedParts, pivotData, canvasW, canvasH);

    return { newBones, parts: taggedParts, originalClean };
};
