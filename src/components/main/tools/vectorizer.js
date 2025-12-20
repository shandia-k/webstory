import ImageTracer from 'imagetracerjs';

export const vectorizeImage = (imgElement) => {
    return new Promise((resolve, reject) => {
        try {
            // Options for better cartoon tracing
            const options = {
                // Tunning for cleaner edges
                ltres: 0.5,
                qtres: 0.5,
                pathomit: 10,
                rightangleenhance: false,
                colorsampling: 2,
                numberofcolors: 64, // High Fidelty (was 24)
                mincolorratio: 0,
                colorquantcycles: 5, // Slower but better colors
                layering: 0,
                strokewidth: 0,
                linefilter: true, // Enable line filter
                scale: 1,
                roundcoords: 2, // More precision
                viewbox: true,
                desc: false,
                blurradius: 2, // Slight blur to reduce noise
                blurdelta: 10
            };

            // ImageTracer needs URL or ID. If we have an Image Element with Data URL, 
            // we can pass the src.
            ImageTracer.imageToSVG(
                imgElement.src,
                (svgStr) => {
                    try {
                        // FIX: Use DOMParser for robust XML manipulation
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(svgStr, "image/svg+xml");
                        const svg = doc.documentElement;

                        // Check for parsing errors
                        if (svg.nodeName === "parsererror") {
                            throw new Error("SVG Parsing Failed");
                        }

                        // 1. Force Namespace
                        if (!svg.getAttribute("xmlns")) {
                            svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                        }

                        // --- OPTIMIZATION: TRIM VIEWBOX (CROP) ---
                        // We iterate all paths to find the TRUE content bounding box
                        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                        const paths = svg.getElementsByTagName('path');

                        // Parse path data roughly to find extents (Simple method)
                        // Note: Precise bbox of paths is hard without rendering.
                        // BUT ImageTracer usually coordinates relative to 0,0.
                        // Let's rely on ImageTracer's output or just default to crop if possible.

                        // Actually, ImageTracer usually fills the canvas.
                        // A true 'Trim' requires parsing the 'd' attributes.
                        // Implementing a basic 'd' parser for Move/Line commands to find min/max.

                        for (let p of paths) {
                            const d = p.getAttribute('d');
                            if (!d) continue;
                            const coords = d.match(/[-+]?[0-9]*\.?[0-9]+/g);
                            if (coords) {
                                for (let i = 0; i < coords.length; i += 2) {
                                    const x = parseFloat(coords[i]);
                                    const y = parseFloat(coords[i + 1]);
                                    if (!isNaN(x)) {
                                        if (x < minX) minX = x;
                                        if (x > maxX) maxX = x;
                                    }
                                    if (!isNaN(y)) {
                                        if (y < minY) minY = y;
                                        if (y > maxY) maxY = y;
                                    }
                                }
                            }
                        }

                        // Apply Crop if valid
                        if (minX !== Infinity) {
                            // Add slight padding
                            const pad = 2;
                            minX = Math.max(0, minX - pad);
                            minY = Math.max(0, minY - pad);
                            maxX += pad;
                            maxY += pad;
                            const w = maxX - minX;
                            const h = maxY - minY;

                            svg.setAttribute("viewBox", `${minX} ${minY} ${w} ${h}`);
                            svg.setAttribute("width", w);
                            svg.setAttribute("height", h);
                        } else {
                            // Fallback to image dims
                            const w = imgElement.naturalWidth || imgElement.width;
                            const h = imgElement.naturalHeight || imgElement.height;
                            svg.setAttribute("width", w);
                            svg.setAttribute("height", h);
                            svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
                        }

                        // 3. Serialize back to string
                        const serializer = new XMLSerializer();
                        const newSvgStr = serializer.serializeToString(svg);

                        // 4. Encode to Base64 (Safer than URL encoding)
                        const base64 = window.btoa(unescape(encodeURIComponent(newSvgStr)));
                        const svgDataUrl = `data:image/svg+xml;base64,${base64}`;

                        resolve(svgDataUrl);
                    } catch (e) {
                        // Fallback for very simple cases or if DOMParser fails
                        console.error("DOMParser failed, falling back to simple encode", e);
                        const simpleUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
                        resolve(simpleUrl);
                    }
                },
                options
            );
        } catch (e) {
            reject(e);
        }
    });
};
