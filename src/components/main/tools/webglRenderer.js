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
        this.boneIndexBuffer = null;
        this.weightBuffer = null;
        this.indexBuffer = null;
        this.texture = null;

        this.gridSize = 20; // 20x20 grid
        this.vertices = []; // [x, y, ...]
        this.texCoords = []; // [u, v, ...]
        this.indices = [];
        this.baseBonePositions = []; // [{x, y}, ...]
        this.boneTransformsData = new Float32Array(64 * 2); // Pre-allocated for GC

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
            attribute vec4 a_boneIndices;
            attribute vec4 a_weights;

            uniform vec2 u_boneTransforms[64];

            varying vec2 v_texCoord;

            void main() {
                // Weighted Skinning in Vertex Shader
                vec2 offset = vec2(0.0);

                // Get indices as integers
                int b0 = int(a_boneIndices.x);
                int b1 = int(a_boneIndices.y);
                int b2 = int(a_boneIndices.z);
                int b3 = int(a_boneIndices.w);

                // Accumulate weighted bone transforms
                offset += u_boneTransforms[b0] * a_weights.x;
                offset += u_boneTransforms[b1] * a_weights.y;
                offset += u_boneTransforms[b2] * a_weights.z;
                offset += u_boneTransforms[b3] * a_weights.w;

                vec2 finalPosition = a_position + offset;

                // Convert 0.0->1.0 space to -1.0->1.0 clip space
                // Clip Space: -1,-1 (bottom left) to 1,1 (top right)
                // Input: 0,0 (top left) to 1,1 (bottom right)
                
                vec2 zeroToTwo = finalPosition * 2.0;
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
        this.boneIndicesLocation = gl.getAttribLocation(this.program, "a_boneIndices");
        this.weightsLocation = gl.getAttribLocation(this.program, "a_weights");

        this.boneTransformsLocation = gl.getUniformLocation(this.program, "u_boneTransforms");
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

        // Store base bone positions to calculate deltas later
        this.baseBonePositions = bones.map(b => ({ x: b.x, y: b.y }));

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

        const boneIndices = []; // Flattened vec4: [b0, b1, b2, b3, ...]
        const boneWeights = []; // Flattened vec4: [w0, w1, w2, w3, ...]

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

                    // Sort by weight desc and take top 4
                    influences.sort((a, b) => b.weight - a.weight);
                    influences = influences.slice(0, 4);
                }

                // Normalize weights
                const totalWeight = influences.reduce((sum, inf) => sum + inf.weight, 0);

                // Prepare vec4 data (up to 4 bones)
                const indicesVec = [0, 0, 0, 0];
                const weightsVec = [0, 0, 0, 0];

                influences.forEach((inf, idx) => {
                    // Re-normalize against the total of the kept influences
                    const normWeight = inf.weight / totalWeight;
                    if (idx < 4) {
                        indicesVec[idx] = inf.index;
                        weightsVec[idx] = normWeight;
                    }
                });

                boneIndices.push(...indicesVec);
                boneWeights.push(...weightsVec);
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
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoords), gl.STATIC_DRAW);

        this.boneIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.boneIndexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boneIndices), gl.STATIC_DRAW);

        this.weightBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.weightBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boneWeights), gl.STATIC_DRAW);

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

        // Calculate Bone Transforms
        // Support up to 64 bones as defined in shader
        for (let i = 0; i < 64; i++) {
             const idx = i * 2;
             if (i < bones.length && i < this.baseBonePositions.length) {
                 const current = bones[i];
                 const base = this.baseBonePositions[i];
                 // Transform = Current - Base
                 this.boneTransformsData[idx] = current.x - base.x;
                 this.boneTransformsData[idx + 1] = current.y - base.y;
             } else {
                 this.boneTransformsData[idx] = 0;
                 this.boneTransformsData[idx + 1] = 0;
             }
        }

        // Upload Uniforms
        gl.uniform2fv(this.boneTransformsLocation, this.boneTransformsData);

        // Attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.enableVertexAttribArray(this.texCoordLocation);
        gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.boneIndexBuffer);
        gl.enableVertexAttribArray(this.boneIndicesLocation);
        gl.vertexAttribPointer(this.boneIndicesLocation, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.weightBuffer);
        gl.enableVertexAttribArray(this.weightsLocation);
        gl.vertexAttribPointer(this.weightsLocation, 4, gl.FLOAT, false, 0, 0);

        // Draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}
