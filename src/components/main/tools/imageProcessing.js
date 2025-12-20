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
export const smartRemoveBackground = (imgElement, options = {}) => {
    const tolerance = options.tolerance || 100; // Increased default to 100
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // TARGET: Top-Left Pixel (Assumed Background)
    const targetR = data[0];
    const targetG = data[1];
    const targetB = data[2];

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean Distance
        const dist = Math.sqrt(
            Math.pow(r - targetR, 2) +
            Math.pow(g - targetG, 2) +
            Math.pow(b - targetB, 2)
        );

        if (dist < tolerance) {
            data[i + 3] = 0; // Transparent
        } else if (options.edgeFeather && dist < tolerance + 20) {
            // Anti-Aliasing Helper: Semi-transparent edge
            // Logic: 0 at dist=tolerance, 255 at dist=tolerance+20
            const alphaFactor = (dist - tolerance) / 20;
            data[i + 3] = Math.floor(255 * alphaFactor);
        }
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

    // Helper to check if pixel is solid
    const isSolid = (idx) => data[idx * 4 + 3] > 20; // Alpha > 20

    // Scan all pixels
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;

            if (!visited[idx] && isSolid(idx)) {
                // Found new island seed -> Start Flood Fill
                const bbox = iterativeFloodFill(data, width, height, x, y, visited);

                // Filter noise (tiny specks)
                if (bbox.w > 5 && bbox.h > 5) {
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
                if (!visited[nIdx] && data[nIdx * 4 + 3] > 20) {
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
export const processAutoRigging = (imgElement) => {
    // 1. CLEAN UP (HD)
    // Kita hapus background di resolusi asli dulu biar kualitas edge bagus
    const cleanCanvasHD = smartRemoveBackground(imgElement, { tolerance: 60, edgeFeather: true });

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
            cleanCanvasHD,
            hdX - PAD, hdY - PAD, hdW + (PAD * 2), hdH + (PAD * 2), // Source Rect
            0, 0, hdW + (PAD * 2), hdH + (PAD * 2) // Dest Rect
        );

        return {
            id: `part_${index}`,
            bbox: { x: hdX, y: hdY, w: hdW, h: hdH }, // Simpan offset asli untuk Rigging nanti
            dataUrl: spriteCanvas.toDataURL('image/png'), // Gambar Sprite bersih
            debugColor: getRandomColor() // Utk visualisasi di UI
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
