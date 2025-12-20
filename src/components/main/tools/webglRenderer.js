export class WebGLDeformer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
        if (!this.gl) {
            console.error("WebGL not supported");
            return;
        }

        this.program = null;
        this.positionBuffer = null;
        this.texCoordBuffer = null;
        this.indexBuffer = null;
        this.texture = null;

        this.gridSize = 20; // 20x20 grid
        this.vertices = []; // [x, y, ...]
        this.texCoords = []; // [u, v, ...]
        this.indices = [];

        this.skinIndices = []; // Vertex Index -> Bone Index
        this.skinOffsets = []; // Vertex Index -> {dx, dy} (Normalized)

        // --- BLENDING CONFIG ---
        // Crucial for transparent PNGs to show correctly on top of CSS backgrounds
        const gl = this.gl;
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // Premultiplied Alpha Blend Func

        this.initShaders();
    }

    initShaders() {
        const gl = this.gl;

        const vsSource = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            varying vec2 v_texCoord;
            void main() {
                // Convert 0.0->1.0 space to -1.0->1.0 clip space
                // Y is flipped in WebGL usually, but here our coords are top-down 0-1
                // Clip Space: -1,-1 (bottom left) to 1,1 (top right)
                // Input: 0,0 (top left) to 1,1 (bottom right)
                
                vec2 zeroToOne = a_position;
                vec2 zeroToTwo = zeroToOne * 2.0;
                vec2 clipSpace = zeroToTwo - 1.0;
                
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
                v_texCoord = a_texCoord;
            }
        `;

        const fsSource = `
            precision mediump float;
            uniform sampler2D u_image;
            varying vec2 v_texCoord;
            void main() {
                gl_FragColor = texture2D(u_image, v_texCoord);
            }
        `;

        const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fsSource);

        this.program = this.createProgram(gl, vertexShader, fragmentShader);

        this.positionLocation = gl.getAttribLocation(this.program, "a_position");
        this.texCoordLocation = gl.getAttribLocation(this.program, "a_texCoord");
    }

    createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    createProgram(gl, vs, fs) {
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    initMesh(image, bones) {
        const gl = this.gl;

        // 1. Create Texture
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        // Handle Premultiplied Alpha for proper blending with page background
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // 2. Build High-Res Grid Mesh (0.0 to 1.0)
        // Denser grid = smoother deformation
        this.gridSize = 40;

        this.vertices = [];
        this.texCoords = [];
        this.indices = [];
        this.skinData = []; // Store Objects: { bones: [idx1, idx2, idx3], weights: [w1, w2, w3], offsets: [{dx,dy}, ...] }

        const cols = this.gridSize;
        const rows = this.gridSize;

        for (let y = 0; y <= rows; y++) {
            for (let x = 0; x <= cols; x++) {
                const u = x / cols;
                const v = y / rows;

                this.vertices.push(u, v);
                this.texCoords.push(u, v);

                // SKINNING: "Smart Weighting"
                // 1. Rigid Pass: Check if vertex is inside a Rigid Zone (e.g. Head)
                let rigidMatch = null;

                // Sort bones so we check specific ones first if needed, or just iterate.
                // We check if vertex is within 'rigidRadius' of a rigid bone.
                for (let i = 0; i < bones.length; i++) {
                    const b = bones[i];
                    if (b.rigid) {
                        // Standard rigid radius defaults to 0.15 (world space) if not set
                        const radius = b.rigidRadius || 0.15;
                        const dist = Math.sqrt((b.x - u) ** 2 + (b.y - v) ** 2);
                        if (dist < radius) {
                            // Found a rigid match!
                            rigidMatch = { index: i, weight: 1.0, bone: b };
                            break; // First rigid bone wins (usually Head)
                        }
                    }
                }

                let influences = [];

                if (rigidMatch) {
                    // If Rigid, only this bone influences this vertex
                    influences = [rigidMatch];
                } else {
                    // 2. Soft Pass: Inverse Distance Weighting (Standard)
                    influences = bones.map((b, i) => {
                        const distSq = (b.x - u) ** 2 + (b.y - v) ** 2;
                        const dist = Math.sqrt(distSq) + 0.0001;
                        // Sharper falloff (power 3) makes joints bend cleaner
                        const weight = 1.0 / (dist * dist * dist);
                        return { index: i, weight: weight, bone: b };
                    });

                    // Sort by weight desc and take top 3
                    influences.sort((a, b) => b.weight - a.weight);
                    influences = influences.slice(0, 3);
                }

                // Normalize weights
                const totalWeight = influences.reduce((sum, inf) => sum + inf.weight, 0);

                const vertexSkinData = {
                    indices: [],
                    weights: [],
                    restOffsets: []
                };

                influences.forEach(inf => {
                    const normWeight = inf.weight / totalWeight;
                    vertexSkinData.indices.push(inf.index);
                    vertexSkinData.weights.push(normWeight);
                    vertexSkinData.restOffsets.push({
                        dx: u - inf.bone.x,
                        dy: v - inf.bone.y
                    });
                });

                this.skinData.push(vertexSkinData);
            }
        }

        // Triangulate
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const i = (y * (cols + 1)) + x;
                const nextRow = ((y + 1) * (cols + 1)) + x;

                // Grid Triangulation
                this.indices.push(i, nextRow, i + 1);
                this.indices.push(nextRow, nextRow + 1, i + 1);
            }
        }

        // Buffers
        this.positionBuffer = gl.createBuffer();
        this.texCoordBuffer = gl.createBuffer();

        // Static TexCoords
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoords), gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }

    draw(bones) {
        const gl = this.gl;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0, 0, 0, 0); // Transparent clear
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this.program);

        // Update Vertices based on Weighted Skinning (CPU Side)
        // ideally this is a Vertex Shader job, but for < 2000 verts CPU is fine and easier to debug

        const newVertices = [];
        let vertIdx = 0;

        for (let k = 0; k < this.skinData.length; k++) {
            const skin = this.skinData[k];

            let finalX = 0;
            let finalY = 0;

            // Blended Position = Sum(Weight * (BonePos + RestOffset))
            for (let i = 0; i < skin.indices.length; i++) {
                const boneIdx = skin.indices[i];
                const weight = skin.weights[i];
                const offset = skin.restOffsets[i];

                if (bones[boneIdx]) {
                    const b = bones[boneIdx];
                    finalX += (b.x + offset.dx) * weight;
                    finalY += (b.y + offset.dy) * weight;
                }
            }

            newVertices.push(finalX, finalY);
            vertIdx++;
        }

        // Upload new positions
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newVertices), gl.DYNAMIC_DRAW);

        // Attributes
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.enableVertexAttribArray(this.texCoordLocation);
        gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        // Draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}
