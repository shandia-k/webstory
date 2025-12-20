/**
 * Detects the background color from the top-left pixel (0,0) and removes similar colors.
 * Used automatically when uploading a new image.
 * 
 * @param {HTMLImageElement} imgElement - The source image
 * @param {number} tolerance - Tolerance for color matching (default 40)
 * @returns {string} - The processed image as Data URL
 */
export const autoRemoveBackground = (imgElement, tolerance = 40) => {
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // TARGET: Top-Left Pixel
    const targetR = data[0];
    const targetG = data[1];
    const targetB = data[2];

    // Only process if the corner pixel is not already transparent
    if (data[3] === 0) return canvas.toDataURL();

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const dist = Math.sqrt((r - targetR) ** 2 + (g - targetG) ** 2 + (b - targetB) ** 2);
        if (dist < tolerance) data[i + 3] = 0; // Set Alpha to 0
    }

    ctx.putImageData(imageData, 0, 0);

    // Remove Gemini Trademark (Bottom-Right)
    removeWatermark(ctx, canvas.width, canvas.height);

    // Auto-Crop to remove excess empty space
    return autoCropImage(canvas);
};

/**
 * Removes a specific color clicked by the user (Magic Wand).
 * 
 * @param {HTMLImageElement} imgElement - The source image
 * @param {number} clickX - X coordinate of the click (relative to natural size)
 * @param {number} clickY - Y coordinate of the click (relative to natural size)
 * @param {number} tolerance - Tolerance for color matching
 * @returns {string} - The processed image as Data URL
 */
export const magicWandRemove = (imgElement, clickX, clickY, tolerance = 50) => {
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // TARGET: Clicked Pixel
    const pixelIdx = (Math.floor(clickY) * canvas.width + Math.floor(clickX)) * 4;
    const targetR = data[pixelIdx];
    const targetG = data[pixelIdx + 1];
    const targetB = data[pixelIdx + 2];

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const diff = Math.sqrt((r - targetR) ** 2 + (g - targetG) ** 2 + (b - targetB) ** 2);
        if (diff < tolerance) data[i + 3] = 0; // Set Alpha to 0
    }

    ctx.putImageData(imageData, 0, 0);
    return autoCropImage(canvas);
};

/**
 * Crops the image to the bounding box of non-transparent pixels.
 * 
 * @param {HTMLCanvasElement} canvas - The canvas to crop
 * @returns {string} - The cropped image as Data URL
 */
export const autoCropImage = (canvas) => {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    let minX = w, minY = h, maxX = 0, maxY = 0;
    let found = false;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const alpha = data[(y * w + x) * 4 + 3];
            if (alpha > 20) { // Ignore faint noise/antialiasing ghosts
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                found = true;
            }
        }
    }

    if (!found) return canvas.toDataURL(); // Return original if empty

    // Add small padding (e.g. 10px) to avoid cutting off anti-aliased edges
    const padding = 20; // Increased padding for safety
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(w, maxX + padding);
    maxY = Math.min(h, maxY + padding);

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // CENTER IN SQUARE
    // To ensure rigs (0.5 center) align correctly, we should frame the content 
    // in a square canvas, or at least one where the content is centered.
    // Let's go with a Square for best versatility.
    const size = Math.max(contentWidth, contentHeight);

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = size;
    cropCanvas.height = size;
    const cropCtx = cropCanvas.getContext('2d');

    // Draw centered
    const destX = (size - contentWidth) / 2;
    const destY = (size - contentHeight) / 2;

    cropCtx.drawImage(canvas, minX, minY, contentWidth, contentHeight, destX, destY, contentWidth, contentHeight);
    return cropCanvas.toDataURL();
};

/**
 * Removes the Gemini/AI trademark watermark from the bottom-right corner.
 * Clears a small rectangular area.
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} width 
 * @param {number} height 
 */
const removeWatermark = (ctx, width, height) => {
    // Gemini/Imagen watermarks are usually bottom-right.
    // Approximate size is small. Let's clear a safe zone.

    // Dynamic size relative to image, but capped for large images.
    // User requested +50px more to the left to catch longer trademarks.
    const wmWidth = Math.min(width * 0.3, 220); // Increased from 0.2/160
    const wmHeight = Math.min(height * 0.15, 80); // Increased slightly too

    const x = width - wmWidth;
    const y = height - wmHeight;

    // Clear Rect (Set to transparent)
    ctx.clearRect(x, y, wmWidth, wmHeight);
};
