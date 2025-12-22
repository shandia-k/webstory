import { useState, useRef, useEffect } from 'react';
import {
    processImageStep,
    analyzeTagsStep,
    processAutoTagging,
    assembleSkeletonStep
} from './autoRigPipeline';
import { autoRemoveBackground, magicWandRemove } from './backgroundRemoval';
import { smartRemoveBackground, detectIslands, drawGridOverlay, processAutoRigging } from './imageProcessing';
import { analyzeImagePoints } from '../../../services/llmService';
import { animator } from './animator';
import { WebGLDeformer } from './webglRenderer';
// import { vectorizeImage } from './vectorizer';
import { useGame } from '../../../context/GameContext'; // For API Key

export const useRiggingStudio = () => {
    // --- STATE ---
    const [image, setImage] = useState(null); // URL of uploaded image
    const [bones, setBones] = useState([]); // Array of { id, x, y, parentId, name }
    const [slices, setSlices] = useState([]); // Array of { x, y, w, h } for export
    const [selectedBoneId, setSelectedBoneId] = useState(null);
    const [tool, setTool] = useState('add'); // 'add', 'move', 'rotate', 'magic'
    const [scale, setScale] = useState(1);
    const [tolerance, setTolerance] = useState(50); // Color tolerance for magic wand

    // Workflow State
    const [workflowStage, setWorkflowStage] = useState('upload'); // 'upload' | 'tagging' | 'assembled'
    const [pivotData, setPivotData] = useState(null); // RAW Gemini Data

    // Assembly State
    const [isAssembled, setIsAssembled] = useState(false); // Legacy flag for UI compat

    // Drag State
    const [isDragging, setIsDragging] = useState(false);
    const [draggedBoneId, setDraggedBoneId] = useState(null);

    // Canvas Refs
    const containerRef = useRef(null);

    // --- ACTIONS ---
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const tempImg = new Image();
            tempImg.onload = () => {
                // IMMEDIATE AUTO-RIG PROCESSING
                runPipelineSteps(tempImg);
            };

            const reader = new FileReader();
            reader.onload = (e) => tempImg.src = e.target?.result as string;
            reader.readAsDataURL(file);
        }
    };

    const processMagicWand = (e) => {
        const img = e.target;
        const scaleX = img.naturalWidth / img.width; // dom vs natural
        const scaleY = img.naturalHeight / img.height;
        const clickX = e.nativeEvent.offsetX * scaleX;
        const clickY = e.nativeEvent.offsetY * scaleY;

        // Use extracted utility
        const processedDataUrl = magicWandRemove(img, clickX, clickY, tolerance);
        setImage(processedDataUrl);
        setTool('add');
    };

    const handleVectorize = () => { alert("Vectorizer is disabled"); };

    // --- SMART AUTO-RIG PIPELINE ---
    const { apiKey } = useGame(); // Get API Key from Context
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");

    const runPipelineSteps = async (inputImageElement) => {
        const sourceUrl = inputImageElement ? inputImageElement.src : image;
        if (!sourceUrl) return;
        if (!apiKey) {
            alert("API Key required for Smart Auto-Rig!");
            return;
        }

        try {
            setIsProcessing(true);
            setWorkflowStage('upload');
            setPivotData(null);

            // 1. Process Image
            setStatusMsg("Step 1: Segmentation...");
            const { originalClean, parts, geminiInput } = processImageStep(inputImageElement);
            setImage(originalClean);

            // 2. Vision Analysis
            setStatusMsg("Step 2: AI Analysis...");
            const { pivotData: rawPivots } = await analyzeTagsStep(apiKey, geminiInput);

            // 2.5 Auto Tagging (Guess)
            setStatusMsg("Step 3: Preparing Correction UI...");
            const canvasW = inputImageElement.naturalWidth;
            const canvasH = inputImageElement.naturalHeight;
            const initialTaggedParts = processAutoTagging(parts, rawPivots, canvasW, canvasH);

            // STOP HERE. Show Tagging UI.
            setSlices(initialTaggedParts); // These have 'id' fields we can edit
            setPivotData(rawPivots);
            setWorkflowStage('tagging');

            setIsProcessing(false);
            setStatusMsg("");

        } catch (error) {
            console.error("Pipeline Error:", error);
            alert("Pipeline Failed: " + error.message);
            setIsProcessing(false);
            setStatusMsg("");
        }
    };

    // User corrects tags here
    const handlePartRename = (partIndex, newId) => {
        const newSlices = [...slices];
        newSlices[partIndex].id = newId;
        setSlices(newSlices);
    };

    // User clicks "Finalize / Assemble"
    const handleFinalizeRig = () => {
        if (!pivotData || !image) return;

        setStatusMsg("Finalizing Rig...");
        const imgEl = new Image();
        imgEl.onload = () => {
            try {
                const canvasW = imgEl.naturalWidth;
                const canvasH = imgEl.naturalHeight;

                const newBones = assembleSkeletonStep(slices, pivotData, canvasW, canvasH);

                setBones(newBones);
                setIsAssembled(true);
                setWorkflowStage('assembled');
                setTool('move');
                setStatusMsg("");
            } catch (error) {
                console.error("Assembly Error:", error);
                alert("Assembly Failed: " + error.message);
                setStatusMsg("");
            }
        };
        imgEl.onerror = () => {
            console.error("Failed to load image for assembly");
            setStatusMsg("");
        };
        imgEl.src = image;
    };

    // Legacy Wrapper for button if needed, but we use handleImageUpload
    const handleAutoRig = () => {
        const img = new Image();
        img.src = image;
        img.onload = () => runPipelineSteps(img);
    };


    const handleCanvasClick = (e) => {
        if (!image) return;
        if (workflowStage !== 'assembled') return; // Only edit bones in assembly mode

        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        if (tool === 'magic') {
            if (e.target.tagName === 'IMG') processMagicWand(e);
            return;
        }

        if (tool === 'add') {
            const newBone = {
                id: Date.now(),
                name: `Bone ${bones.length + 1}`,
                x, y,
                parentId: selectedBoneId
            };
            setBones([...bones, newBone]);
            setSelectedBoneId(newBone.id);
        }
    };

    const handleDeleteBone = () => {
        if (!selectedBoneId) return;
        setBones(bones.filter(b => b.id !== selectedBoneId && b.parentId !== selectedBoneId));
        setSelectedBoneId(null);
    };

    const handleSelection = (boneId) => setSelectedBoneId(boneId);

    // --- EXPORT & COPY ---

    const generateExportData = () => {
        // ... (Same logic as before, works on bones/slices)
        // Find Root(s)
        const roots = bones.filter(b => !b.parentId);

        const buildBoneTree = (boneId) => {
            const bone = bones.find(b => b.id === boneId);
            if (!bone) return null;

            // Get Sprite Info
            const spriteId = bone.spriteId || null;
            const spriteInfo = slices.find(s => s.id === spriteId);

            let canvasW = 0, canvasH = 0;
            // Iterate slices to find max dimensions
            slices.forEach(s => {
                canvasW = Math.max(canvasW, s.bbox.x + s.bbox.w);
                canvasH = Math.max(canvasH, s.bbox.y + s.bbox.h);
            });
            if (canvasW === 0) canvasW = 1024;
            if (canvasH === 0) canvasH = 1024;

            const globalX = bone.x * canvasW;
            const globalY = bone.y * canvasH;

            let pivot = { x: 0, y: 0 };
            if (spriteInfo) {
                if (bone.pivotOffset) {
                    // Use the calculated internal pivot (Assembly Mode)
                    pivot = {
                        x: Math.round(bone.pivotOffset.x * canvasW),
                        y: Math.round(bone.pivotOffset.y * canvasH)
                    };
                } else {
                    // Fallback for Manual Bones (Static Mode)
                    pivot = {
                        x: Math.round(globalX - spriteInfo.bbox.x),
                        y: Math.round(globalY - spriteInfo.bbox.y)
                    };
                }
            }

            // Recursion
            const childrenBones = bones.filter(b => b.parentId === bone.id);
            const childrenTree = childrenBones.map(c => buildBoneTree(c.id)).filter(Boolean);

            return {
                name: bone.name,
                spriteId: spriteId,
                position: { x: Math.round(globalX), y: Math.round(globalY) },
                pivotPoint: pivot,
                rotation: 0,
                children: childrenTree
            };
        };

        const skeletonData: any = {};
        if (roots.length > 0) {
            skeletonData.rootBone = buildBoneTree(roots[0].id);
        }

        const spritesDict = {};
        slices.forEach(s => {
            spritesDict[s.id] = {
                x: s.bbox.x, y: s.bbox.y, w: s.bbox.w, h: s.bbox.h,
                // data: s.dataUrl // Optional: too heavy?
            };
        });

        return {
            meta: {
                id: `char_${Date.now()}`,
                generatedAt: new Date().toISOString(),
                version: "1.0"
            },
            dimensions: { w: 1024, h: 1024 }, // Placeholder or calculated
            sprites: spritesDict,
            skeleton: skeletonData
        };
    };

    const handleExportRig = () => {
        const exportData = generateExportData();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "auto_rig_character.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleCopyData = async () => {
        // If in Tagging mode, copy the intermediate parts list?
        // User asked: "copy, menyalin data dari sebelum dan sesudah aku koreksi"
        // Before correction: PivotData + Initial Parts
        // After correction: ExportData

        let dataToCopy = {};

        if (workflowStage === 'tagging') {
            dataToCopy = {
                stage: 'correction',
                aiAnalysis: pivotData,
                detectedParts: slices.map(s => ({ id: s.id, bbox: s.bbox }))
            };
        } else {
            dataToCopy = generateExportData();
        }

        const json = JSON.stringify(dataToCopy, null, 2);
        try {
            await navigator.clipboard.writeText(json);
            alert("JSON copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy:", err);
            setStatusMsg("Copy Failed");
        }
    };

    // --- DRAG HANDLERS ---
    const handleBoneMouseDown = (e, boneId) => {
        if (tool !== 'move' && tool !== 'anchor') return;
        e.stopPropagation(); // prevent adding bone
        setIsDragging(true);
        setDraggedBoneId(boneId);
        setSelectedBoneId(boneId);
    };

    const handleCanvasMouseMove = (e) => {
        if (!isDragging || !draggedBoneId) return;
        if (tool !== 'move' && tool !== 'anchor') return;

        const rect = containerRef.current.getBoundingClientRect();
        const newX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const newY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

        setBones(prevBones => {
            const currentBone = prevBones.find(b => b.id === draggedBoneId);
            if (!currentBone) return prevBones;

            const dx = newX - currentBone.x;
            const dy = newY - currentBone.y;

            // Find all descendants to move them together (Hierarchy)
            const getDescendants = (parentId) => {
                const children = prevBones.filter(b => b.parentId === parentId);
                let descendants = [...children];
                children.forEach(child => {
                    descendants = [...descendants, ...getDescendants(child.id)];
                });
                return descendants;
            };

            const descendants = getDescendants(draggedBoneId);
            const affectedIds = new Set([draggedBoneId, ...descendants.map(b => b.id)]);

            return prevBones.map(b => {
                if (affectedIds.has(b.id)) {
                    const newBone = { ...b, x: b.x + dx, y: b.y + dy };

                    // IF ANCHOR TOOL: Adjust PivotOffset of the DRAGGED bone only
                    // This keeps the Sprite in place while Bone moves
                    if (tool === 'anchor' && b.id === draggedBoneId && b.pivotOffset) {
                        newBone.pivotOffset = {
                            x: b.pivotOffset.x + dx,
                            y: b.pivotOffset.y + dy
                        };
                    }

                    return newBone;
                }
                return b;
            });
        });
    };

    const handleCanvasMouseUp = () => {
        setIsDragging(false);
        setDraggedBoneId(null);
    };

    // --- ANIMATION ENGINE ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAnim, setCurrentAnim] = useState(null);
    const currentAnimRef = useRef(null); // Ref for loop access

    // Animation Refs
    const requestRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const restBonesRef = useRef<any[]>([]);

    // Renderer Refs
    const deformerRef = useRef(null);
    const canvasRef = useRef(null); // Ref to the GL canvas

    const startAnimation = (animName) => {
        if (!image) return;

        // Reset Physics on new start
        animator.reset();

        // Sync Ref
        currentAnimRef.current = animName;
        setCurrentAnim(animName); // For UI

        // 1. Prepare Rest Pose
        let baseBones = bones;
        if (!isPlaying) {
            restBonesRef.current = JSON.parse(JSON.stringify(bones));
            baseBones = restBonesRef.current;
        } else if (restBonesRef.current.length > 0) {
            baseBones = restBonesRef.current;
        }

        // 2. Initialize Deformer if needed
        if (!deformerRef.current && canvasRef.current) {
            const imgEl = new Image();
            imgEl.src = image;
            imgEl.onload = () => {
                deformerRef.current = new WebGLDeformer(canvasRef.current);
                // Match resolution
                canvasRef.current.width = imgEl.naturalWidth;
                canvasRef.current.height = imgEl.naturalHeight;

                deformerRef.current.initMesh(imgEl, baseBones);

                // Start Loop only after init
                runLoop();
            };
        } else {
            // Re-init mesh if we stopped (to capture new bone positions if user moved them)
            if (!isPlaying && deformerRef.current) {
                // Hot-reload mesh binding so user changes apply
                const imgEl = new Image();
                imgEl.src = image;
                deformerRef.current.initMesh(imgEl, baseBones);
            }
            runLoop();
        }
    };

    const runLoop = () => {
        setIsPlaying(true);
        startTimeRef.current = performance.now();
        requestRef.current = requestAnimationFrame(animateLoop);
    };

    const stopAnimation = () => {
        animator.reset(); // Clear inertia
        cancelAnimationFrame(requestRef.current);
        setIsPlaying(false);
        setCurrentAnim(null);
        currentAnimRef.current = null;

        // Reset bones to Rest Pose
        if (restBonesRef.current.length > 0) {
            setBones(restBonesRef.current);
        }
    };

    const animateLoop = (time) => {
        if (!startTimeRef.current) startTimeRef.current = time;
        const elapsed = time - startTimeRef.current;

        const activeAnim = currentAnimRef.current; // Read from Ref

        if (restBonesRef.current && restBonesRef.current.length > 0 && activeAnim) {
            // Calc new bones
            const newBones = animator.calculateFrame(restBonesRef.current, activeAnim, elapsed);
            setBones(newBones);

            // Render Deformed Mesh
            if (deformerRef.current) {
                deformerRef.current.draw(newBones);
            }
        }

        requestRef.current = requestAnimationFrame(animateLoop);
    };

    return {
        state: {
            image,
            bones,
            selectedBoneId,
            tool,
            scale,
            tolerance,
            isProcessing,
            statusMsg,
            isPlaying,
            currentAnim,
            isAssembled,
            slices, // Export slices for rendering sprites
            workflowStage,
            pivotData
        },
        actions: {
            setImage,
            setBones,
            setSelectedBoneId,
            setTool,
            setScale,
            setTolerance,
            handleImageUpload,
            handleCanvasClick,
            handleDeleteBone,
            handleSelection,
            handleAutoRig, // Wrapped
            handleVectorize,
            handleExportRig,
            handleCopyData,
            handlePartRename,
            handleFinalizeRig,
            startAnimation,
            stopAnimation,

            // Drag
            handleBoneMouseDown,
            handleCanvasMouseMove,
            handleCanvasMouseUp
        },
        refs: { containerRef, canvasRef }
    };
};
