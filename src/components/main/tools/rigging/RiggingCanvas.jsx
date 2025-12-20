import React, { useRef } from 'react';
import { Layers, Bot } from 'lucide-react';

export const RiggingCanvas = ({ state, actions, refs, tool, scale, showDebug, imgSize, setImgSize }) => {
    const { image, bones, selectedBoneId, isAssembled, slices } = state;
    const {
        handleCanvasClick,
        handleImgLoad: originalHandleImgLoad, // handled locally for size? 
        handleSelection
    } = actions;

    const handleImgLoad = (e) => {
        setImgSize({ w: e.target.naturalWidth, h: e.target.naturalHeight });
    };

    const renderDebugOverlay = () => {
        if (!showDebug || !state.pivotData) return null;

        const points = [];
        Object.entries(state.pivotData).forEach(([key, val]) => {
            if (!val) return;
            const xRaw = parseFloat(val[0]);
            const yRaw = parseFloat(val[1]);

            // Detect normalization
            const isNorm = xRaw <= 1.0 && yRaw <= 1.0;
            const x = isNorm ? xRaw * 100 : (xRaw / imgSize.w) * 100;
            const y = isNorm ? yRaw * 100 : (yRaw / imgSize.h) * 100;

            points.push(
                <div key={key} className="absolute w-2 h-2 bg-red-500 rounded-full z-50 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center group" style={{ left: `${x}%`, top: `${y}%` }}>
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                        AI: {key}
                    </div>
                </div>
            );
        });

        return <div className="absolute inset-0 pointer-events-none">{points}</div>;
    };

    const renderAssembledSprites = () => {
        if (!isAssembled) return null;

        return bones.map(bone => {
            if (!bone.spriteId) return null;
            const slice = slices.find(s => s.id === bone.spriteId);
            if (!slice) return null;

            // Normalized Dimensions
            const widthPct = (slice.bbox.w / imgSize.w) * 100;
            const leftPct = (bone.x - bone.pivotOffset.x) * 100;
            const topPct = (bone.y - bone.pivotOffset.y) * 100;

            return (
                <img
                    key={`sprite-${bone.id}`}
                    src={slice.dataUrl}
                    alt={bone.name}
                    className="absolute pointer-events-none"
                    style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        zIndex: 5
                    }}
                />
            );
        });
    };

    const renderConnections = () => {
        return bones.map(bone => {
            if (!bone.parentId) return null;
            const parent = bones.find(b => b.id === bone.parentId);
            if (!parent) return null;

            return (
                <line
                    key={`conn-${bone.id}`}
                    x1={`${parent.x * 100}%`} y1={`${parent.y * 100}%`}
                    x2={`${bone.x * 100}%`} y2={`${bone.y * 100}%`}
                    stroke="#fbbf24"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="pointer-events-none opacity-80"
                />
            );
        });
    };

    return (
        <div className="flex-1 bg-slate-50 relative overflow-auto flex items-center justify-center p-8">

            {/* LOADING OVERLAY */}
            {state.isProcessing && (
                <div className="absolute inset-0 z-50 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                    <Bot className="animate-bounce mb-4 text-indigo-400" size={48} />
                    <h2 className="text-xl font-bold mb-2">Auto-Rigging AI</h2>
                    <p className="font-mono text-sm bg-black/40 px-4 py-2 rounded">{state.statusMsg}</p>
                </div>
            )}

            {/* Checkerboard Style */}
            <style>{`
                .bg-checkerboard {
                    background-color: #e5e7eb;
                    background-image:
                        linear-gradient(45deg, #ffffff 25%, transparent 25%),
                        linear-gradient(-45deg, #ffffff 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #ffffff 75%),
                        linear-gradient(-45deg, transparent 75%, #ffffff 75%);
                    background-size: 20px 20px;
                    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                }
            `}</style>

            {image ? (
                <div
                    className={`relative shadow-2xl border-2 border-dashed border-gray-300 select-none transition-cursor duration-200 bg-checkerboard ${tool === 'magic' ? 'cursor-not-allowed' : (tool === 'add' ? 'cursor-crosshair' : 'cursor-default')}`}
                    style={{
                        transform: `scale(${scale})`,
                        transition: 'transform 0.1s',
                        cursor: tool === 'magic' ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23a855f7\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M15.5 3v13.5l-2.5 2.5\'/><path d=\'M15.5 16.5l5-5\'/><path d=\'M2 21l6.5-6.5\'/><path d=\'M10 21l-3-3l1.5-1.5\'/></svg>") 0 24, auto' : undefined
                    }}
                    ref={refs.containerRef}
                    onClick={handleCanvasClick}
                    onMouseMove={actions.handleCanvasMouseMove}
                    onMouseUp={actions.handleCanvasMouseUp}
                    onMouseLeave={actions.handleCanvasMouseUp}
                >
                    {/* ASSEMBLED SPRITES LAYER */}
                    {renderAssembledSprites()}
                    {renderDebugOverlay()}

                    {/* STATIC IMAGE */}
                    <img
                        src={image}
                        onLoad={handleImgLoad}
                        alt="Workplace"
                        className={`max-w-none pointer-events-none transition-opacity duration-300 ${state.isPlaying || isAssembled ? 'opacity-0' : 'opacity-100'}`}
                        style={{ maxHeight: '80vh', display: 'block' }}
                    />

                    {/* WEBGL CANVAS */}
                    <canvas
                        ref={refs.canvasRef}
                        className={`pointer-events-none absolute top-0 left-0 transition-opacity duration-300 ${state.isPlaying ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        style={{ maxHeight: '80vh' }}
                    />

                    {/* BONE OVERLAY */}
                    <svg className={`absolute inset-0 w-full h-full pointer-events-none overflow-visible transition-opacity duration-300 ${state.isPlaying ? 'opacity-50' : 'opacity-100'}`}>
                        {renderConnections()}
                    </svg>

                    {/* NODES */}
                    {bones.map(bone => (
                        <div
                            key={bone.id}
                            className={`absolute w-6 h-6 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 shadow-sm transition-all hover:scale-125
                                ${selectedBoneId === bone.id
                                    ? 'bg-yellow-400 border-white z-20 scale-110'
                                    : 'bg-white border-indigo-500 z-10'}
                                ${tool === 'move' || tool === 'anchor' ? 'cursor-grab active:cursor-grabbing' : ''}
                                ${state.isPlaying ? 'opacity-50' : 'opacity-100'}`}
                            style={{ left: `${bone.x * 100}%`, top: `${bone.y * 100}%` }}
                            onMouseDown={(e) => actions.handleBoneMouseDown(e, bone.id)}
                            onClick={(e) => { e.stopPropagation(); handleSelection(bone.id); }}
                        >
                            <div className="absolute inset-0 m-auto w-1.5 h-1.5 bg-indigo-900 rounded-full opacity-50" />
                        </div>
                    ))}

                </div>
            ) : (
                <div className="text-center text-gray-400">
                    <Layers size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No Image Loaded</p>
                    <p className="text-sm opacity-70">Upload an image to start rigging</p>
                </div>
            )}
        </div>
    );
};
