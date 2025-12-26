/**
 * Advanced Image Processing Tools for Auto-Rigging
 * Includes: 
 * 1. Euclidean Green Screen Removal (Anti-Halo)
 * 2. Iterative Flood Fill Island Detection (Optimized Slicing)
 */

/**
 * Removes background color using Euclidean Distance matching.
 * More precise than simple RGB thresholds.
 * 
 * @param {HTMLImageElement} imgElement - Source image
 * @param {object} options - { tolerance: 50, edgeFeather: true }
 * @returns {HTMLCanvasElement} - Processed canvas
 */
/**
 * Removes background color using HSL Chroma Key (Better for Green Screen).
 * Handles shadows (darker green) better than Euclidean RGB.
 * 
 * @param {HTMLImageElement} imgElement - Source image
 * @param {object} options - { tolerance: 50, edgeFeather: true }
 * @returns {HTMLCanvasElement} - Processed canvas
 */
export const smartRemoveBackground = (imgElement, options = {}) => {
    // 1. Get Canvas Data first to sample Top-Left Pixel
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Helper: RGB to HSL
    const rgbToHsl = (r, g, b) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h * 360, s, l];
    };

    // 2. SAMPLE BACKGROUND COLOR (Robust Average)
    // Average the first 20 pixels to avoid noise at (0,0)
    let rSum = 0, gSum = 0, bSum = 0;
    const sampleCount = Math.min(20, canvas.width);
    for (let i = 0; i < sampleCount; i++) {
        const idx = i * 4;
        rSum += data[idx];
        gSum += data[idx + 1];
        bSum += data[idx + 2];
    }
    const bgR = Math.round(rSum / sampleCount);
    const bgG = Math.round(gSum / sampleCount);
    const bgB = Math.round(bSum / sampleCount);

    const [bgH, bgS, bgL] = rgbToHsl(bgR, bgG, bgB);

    console.log("Processed BG Sample:", { r: bgR, g: bgG, b: bgB, hsl: [bgH, bgS, bgL] });
    console.log("Options:", options);

    // User Tunables (0-100 mapped to logic)
    // FIX: properly handle 0 as a valid value
    const tolerance = (options.tolerance !== undefined) ? options.tolerance : 50;
    const sensitivity = (options.sensitivity !== undefined) ? options.sensitivity : 50;

    // Logic Mapping:
    // Tolerance determines the HUE WIDTH.
    const hueDiff = 20 + (tolerance * 0.8); // 50 -> +/- 60deg. 

    // Sensitivity determines SAT/LIGHT leniency for shadows 
    // If sensitivity is HIGH, we accept lower saturation/lightness as "Background" (Shadows)
    // Base thresholds derived from the sampled BG

    // Saturation Threshold: 
    // If BG is vibrant (S=0.8), we allow down to 0.2 if High Sensitivity.
    // If BG is dull (S=0.2), we have to be careful.
    const minSat = Math.max(0.05, bgS - (0.4 + (sensitivity / 100 * 0.4)));

    // Lightness Threshold:
    // Shadows are darker. We allow L to drop significantly if Sensitivity is High.
    // But we don't want to capture Black lines (L=0).
    const minLight = Math.max(0.02, 0.05 - (sensitivity / 200));
    // We also cap lightness to avoid capturing white highlights on objects
    const maxLight = Math.min(0.98, bgL + 0.3);

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const [h, s, l] = rgbToHsl(r, g, b);

        // --- KEYING LOGIC ---

        // 1. Hue Distance
        // Calculate shortest distance on circle (0-360)
        let dist = Math.abs(h - bgH);
        if (dist > 180) dist = 360 - dist;

        const isTargetHue = (dist < hueDiff);

        // 2. Sat/Light Checks
        const isTargetSat = (s > minSat);
        const isTargetLight = (l > minLight && l < maxLight);

        if (isTargetHue && isTargetSat && isTargetLight) {
            // It is background

            // Feathering
            const featherRange = 15;
            if (dist < (hueDiff - featherRange)) {
                data[i + 3] = 0; // Transparent
            } else {
                // Linear feather
                const feather = (dist - (hueDiff - featherRange)) / featherRange;
                data[i + 3] = Math.floor(255 * Math.min(1, feather));
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
};


/**
 * Helper: Morphological Erosion
 * Shrinks white pixels to break connected components.
 */
const erodeAlpha = (canvas, iterations = 1) => {
    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext('2d');

    // We can't easily do full morphology in 2D Context quickly without shaders or heavy loop.
    // Hack: Draw the image onto itself with 'destination-out' and a slight offset? 
    // No, standard JS loop is safest for correctness here on smallCanvas.

    let imageData = ctx.getImageData(0, 0, w, h);
    let data = imageData.data;

    // Simple 3x3 Erosion (Minimum filter)
    // If any neighbor is transparent, become transparent.
    const scratch = new Uint8Array(data.length);
    scratch.set(data);

    for (let iter = 0; iter < iterations; iter++) {
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const idx = (y * w + x) * 4;
                if (data[idx + 3] === 0) continue; // Already empty

                // Check Neighbors
                let shouldErode = false;
                // Up, Down, Left, Right
                const offsets = [
                    ((y - 1) * w + x) * 4,
                    ((y + 1) * w + x) * 4,
                    (y * w + (x - 1)) * 4,
                    (y * w + (x + 1)) * 4
                ];

                for (let off of offsets) {
                    if (data[off + 3] < 50) { // Threshold
                        shouldErode = true;
                        break;
                    }
                }

                if (shouldErode) {
                    scratch[idx + 3] = 0;
                }
            }
        }
        // Commit this pass
        data.set(scratch);
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
};

/**
 * Iterative Island Detection (Flood Fill)
 * Prevents Stack Overflow on large images by using a manual Stack.
 * 
 * @param {HTMLCanvasElement} canvas - The source canvas (preferably downsampled)
 * @returns {Array} - Array of BoundingBoxes {x, y, w, h}
 */
export const detectIslands = (canvas) => {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const visited = new Uint8Array(width * height); // 0 = unvisited
    const islands = [];

    // Helper to check if pixel is solid (Threshold raised to ignore feathering)
    const isSolid = (idx) => data[idx * 4 + 3] > 100;

    // Scan all pixels
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;

            if (!visited[idx] && isSolid(idx)) {
                // Found new island seed -> Start Flood Fill
                const bbox = iterativeFloodFill(data, width, height, x, y, visited);

                // Filter noise (tiny specks)
                if (bbox.w > 10 && bbox.h > 10) { // Increased noise threshold
                    islands.push(bbox);
                }
            }
        }
    }

    return islands;
};

/**
 * SAFE Iterative Flood Fill (Stack-Based)
 * Mark-on-Push 
 */
const iterativeFloodFill = (data, w, h, startX, startY, visited) => {
    const stack = [[startX, startY]];
    visited[startY * w + startX] = 1; // Mark start immediately

    let minX = startX, maxX = startX, minY = startY, maxY = startY;

    while (stack.length > 0) {
        const [cx, cy] = stack.pop();

        // Update Bounds
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        // Check Neighbors (4-Way)
        const neighbors = [
            [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
        ];

        for (const [nx, ny] of neighbors) {
            // Check bounds
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                const nIdx = ny * w + nx;
                // Check if solid AND not visited
                // NOTE: We match the same threshold as the Scanner (100)
                if (!visited[nIdx] && data[nIdx * 4 + 3] > 100) {
                    visited[nIdx] = 1; // Mark BEFORE push to prevent duplicates
                    stack.push([nx, ny]);
                }
            }
        }
    }

    return {
        x: minX,
        y: minY,
        w: maxX - minX + 1,
        h: maxY - minY + 1
    };
};


/**
 * Draws a 10x10 Grid Overlay for Vision API context
 */
export const drawGridOverlay = (canvas) => {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Save current state (image is already drawn)
    ctx.save();

    ctx.strokeStyle = '#00FF00'; // Green Grid
    ctx.lineWidth = 2;
    ctx.font = '16px monospace';
    ctx.fillStyle = '#00FF00';

    const stepX = w / 10;
    const stepY = h / 10;

    // Draw Lines
    for (let i = 0; i <= 10; i++) {
        // Vertical
        ctx.beginPath();
        ctx.moveTo(i * stepX, 0);
        ctx.lineTo(i * stepX, h);
        ctx.stroke();

        // Horizontal
        ctx.beginPath();
        ctx.moveTo(0, i * stepY);
        ctx.lineTo(w, i * stepY);
        ctx.stroke();
    }

    // Draw Small Coordinates
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (x % 2 === 0 && y % 2 === 0) { // Dont clutter
                ctx.fillText(`${x},${y}`, x * stepX + 5, y * stepY + 20);
            }
        }
    }

    ctx.restore();
    return canvas;
};

/**
 * Main Orchestrator for Auto-Rigging
 * 1. Cleans HD Image (Green Screen)
 * 2. Downsamples for fast detection
 * 3. Detects Islands
 * 4. Upscales BBoxes & Crops HD Sprites
 */
/**
 * Main Orchestrator for Auto-Rigging
 * 1. Cleans HD Image (Green Screen)
 * 2. Downsamples for fast detection
 * 3. Detects Islands
 * 4. Upscales BBoxes & Crops HD Sprites
 */
export const processAutoRigging = (imgElement, options = {}) => {
    // 1. CLEAN UP (HD)
    // Kita hapus background di resolusi asli dulu biar kualitas edge bagus
    const cleanCanvasHD = smartRemoveBackground(imgElement, options);

    // 2. DOWNSAMPLING (For Speed)
    // Target max size 512px agar flood fill kilat
    const MAX_Size = 1024; // Increased to 1024 for better detail retention
    const scale = Math.min(1, MAX_Size / Math.max(cleanCanvasHD.width, cleanCanvasHD.height));

    const smallW = Math.floor(cleanCanvasHD.width * scale);
    const smallH = Math.floor(cleanCanvasHD.height * scale);

    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = smallW;
    smallCanvas.height = smallH;
    const smallCtx = smallCanvas.getContext('2d');

    // Gambar versi HD ke Canvas kecil (Browser otomatis handle resizing/sampling)
    smallCtx.drawImage(cleanCanvasHD, 0, 0, smallW, smallH);

    // [NEW] 2.5 EROSION (Separate touching assets)
    // Shrink disjoint islands slightly to break bridges
    erodeAlpha(smallCanvas, 2); // 2 passes of erosion

    // 3. DETECT ISLANDS (On Small Canvas)
    // Return array of boxes {x, y, w, h} in small coordinates
    const smallBBoxes = detectIslands(smallCanvas);

    // 4. UPSCALE & CROP (Back to HD)
    const finalParts = smallBBoxes.map((box, index) => {
        // Balikkan koordinat ke resolusi asli
        const hdX = Math.floor(box.x / scale);
        const hdY = Math.floor(box.y / scale);
        const hdW = Math.floor(box.w / scale);
        const hdH = Math.floor(box.h / scale);

        // Safety Padding (biar gak kepotong pas pixel perfect)
        const PAD = 2;

        // Buat Canvas khusus untuk potongan ini (Sprite)
        const spriteCanvas = document.createElement('canvas');
        spriteCanvas.width = hdW + (PAD * 2);
        spriteCanvas.height = hdH + (PAD * 2);
        const spriteCtx = spriteCanvas.getContext('2d');

        spriteCtx.drawImage(
            cleanCanvasHD, // Note: We use the Original Clean HD (Not Eroded)
            hdX - PAD, hdY - PAD, hdW + (PAD * 2), hdH + (PAD * 2), // Source Rect
            0, 0, hdW + (PAD * 2), hdH + (PAD * 2) // Dest Rect
        );

        // APPLY STICKER EFFECT (Paper Craft Upgrade)
        const stickerCanvas = applyStickerEffect(spriteCanvas, 4); // 4px border for parts

        return {
            id: `part_${index}`,
            bbox: { x: hdX, y: hdY, w: hdW, h: hdH },
            dataUrl: stickerCanvas.toDataURL('image/png'),
            debugColor: getRandomColor()
        };
    });

    // 5. PREPARE GEMINI CONTEXT
    // Kita butuh gambar HD yang bersih + Grid untuk dikirim ke Gemini
    const gridCanvas = drawGridOverlay(cleanCanvasHD);
    const gridDataUrl = gridCanvas.toDataURL('image/jpeg', 0.8);

    return {
        originalClean: cleanCanvasHD.toDataURL(),
        parts: finalParts, // Ini array sprite yang udah dipotong
        geminiInput: gridDataUrl // Ini yang dikirim ke API
    };
};

// Helper kecil
const getRandomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);

/**
 * Applies a "Sticker/Paper Cutout" effect to an image.
 * 1. Adds a white stroke/border around the opaque pixels.
 * 2. Applies a subtle paper grain texture overlay.
 * 
 * @param {HTMLImageElement|HTMLCanvasElement} source - Source image
 * @param {number} borderThickness - Width of the white border (default 6)
 * @returns {HTMLCanvasElement} - Processed canvas
 */
export const applyStickerEffect = (source, borderThickness = 6) => {
    // 1. Setup Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = source.naturalWidth || source.width;
    const h = source.naturalHeight || source.height;
    const pad = borderThickness * 3; // Extra padding to fit border

    // Limit max size to prevent memory explosion if source is huge
    // But keep it HD enough
    canvas.width = w + pad * 2;
    canvas.height = h + pad * 2;

    // 2. CREATE WHITE STROKE (The "Angle Loop" Method)
    // Draw the image multiple times in a circle to create a solid outline
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 5; // Slight blur for softer "cut"

    const steps = 16; // Higher = smoother border
    for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * 2 * Math.PI;
        const x = Math.cos(angle) * borderThickness;
        const y = Math.sin(angle) * borderThickness;

        // Draw just the shadow offset? No, we draw the image and rely on shadow.
        // To avoid drawing the colored image 16 times on top of itself (antialiasing mess),
        // we can draw this on a temp canvas first if needed, but for "White Border"
        // drawing "White Shadow" is efficient enough.

        ctx.shadowOffsetX = x;
        ctx.shadowOffsetY = y;
        ctx.drawImage(source, pad, pad);
    }

    // 3. DRAW MAIN IMAGE (On top)
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.drawImage(source, pad, pad);

    // 4. PAPER TEXTURE OVERLAY
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.15;

    // Generate simple noise pattern on the fly
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 100; pCanvas.height = 100;
    const pCtx = pCanvas.getContext('2d');

    for (let i = 0; i < 500; i++) {
        pCtx.fillStyle = `rgba(0,0,0,${Math.random() * 0.5})`;
        pCtx.fillRect(Math.random() * 100, Math.random() * 100, 2, 2);
    }

    const pattern = ctx.createPattern(pCanvas, 'repeat');
    ctx.fillStyle = pattern;

    // Only fill existing pixels (source-in) to texture ONLY the sticker?
    // Or multiply over everything? 
    // "sticker" implies the white border is also paper. 
    // So we want to fill the entire "solid" area of the canvas.
    ctx.globalCompositeOperation = 'source-atop'; // Only draw on non-transparent pixels
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Reset defaults
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';

    return canvas;
};
