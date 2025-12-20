import React from 'react';
import { GripVertical, Copy, Check } from 'lucide-react';

export const TaggingCorrectionView = ({ state, imgSize, handlePartRename, handleFinalizeRig, handleCopyData }) => {
    const { image, pivotData, slices } = state;

    const STANDARD_TAGS = [
        { id: 'head', label: 'Head' },
        { id: 'torso', label: 'Torso' },
        { id: 'arm_L', label: 'Left Arm' },
        { id: 'arm_R', label: 'Right Arm' },
        { id: 'leg_L', label: 'Left Leg' },
        { id: 'leg_R', label: 'Right Leg' },
        { id: 'hand_L', label: 'Left Hand' },
        { id: 'hand_R', label: 'Right Hand' },
    ];

    const onDragStart = (e, tagId) => {
        e.dataTransfer.setData("text/tag", tagId);
    };

    const onDrop = (e, index) => {
        e.preventDefault();
        const tagId = e.dataTransfer.getData("text/tag");
        if (tagId) {
            handlePartRename(index, tagId);
        }
    };

    return (
        <div className="flex-1 flex bg-gray-100 overflow-hidden">
            {/* TAGS SIDEBAR */}
            <div className="w-64 bg-white border-r p-4 flex flex-col gap-4 overflow-y-auto">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <GripVertical size={18} /> Standard Tags
                </h3>
                <p className="text-xs text-gray-500 mb-2">Drag these tags to correct the detected parts.</p>

                <div className="flex flex-col gap-2">
                    {STANDARD_TAGS.map(tag => (
                        <div
                            key={tag.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, tag.id)}
                            className="p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-grab active:cursor-grabbing flex items-center justify-between transition-all"
                        >
                            <span className="font-medium text-indigo-700">{tag.label}</span>
                            <div className="p-1 bg-white rounded text-xs px-2 text-indigo-400 font-mono">{tag.id}</div>
                        </div>
                    ))}
                </div>

                {/* AI REFERENCE MAP */}
                {state.pivotData && state.image && (
                    <div className="mt-4 border-t pt-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">AI Detection Map</h4>
                        <div className="relative w-full aspect-square bg-slate-100 rounded-lg border overflow-hidden">
                            <img src={state.image} className="w-full h-full object-contain opacity-50" alt="Ref" />
                            {Object.entries(state.pivotData).map(([key, val]) => {
                                if (!val) return null;
                                const xRaw = parseFloat(val[0]);
                                const yRaw = parseFloat(val[1]);

                                const isNorm = xRaw <= 1.0 && yRaw <= 1.0;
                                const x = isNorm ? xRaw * 100 : (xRaw / imgSize.w) * 100;
                                const y = isNorm ? yRaw * 100 : (yRaw / imgSize.h) * 100;

                                return (
                                    <div key={key} className="absolute w-1.5 h-1.5 bg-red-600 rounded-full z-10" style={{ left: `${x}%`, top: `${y}%` }} title={key} />
                                );
                            })}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 text-center">Reference for Neck/Shoulders</p>
                    </div>
                )}

                <div className="mt-auto border-t pt-4">
                    <button
                        onClick={handleCopyData}
                        className="w-full py-2 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50 border rounded-lg mb-2"
                    >
                        <Copy size={16} /> Copy AI Data
                    </button>
                </div>
            </div>

            {/* PARTS GRID */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Review Detected Parts</h2>
                    <button
                        onClick={handleFinalizeRig}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg flex items-center gap-2 font-bold transition-all transform hover:scale-105"
                    >
                        <Check size={20} /> Finalize & Assemble
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {slices.map((part, idx) => (
                        <div
                            key={idx}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => onDrop(e, idx)}
                            className={`bg-white rounded-xl shadow-sm border-2 p-4 transition-all ${STANDARD_TAGS.some(t => t.id === part.id) ? 'border-emerald-400 bg-emerald-50/10' : 'border-gray-200 hover:border-indigo-300'}`}
                        >
                            <div className="aspect-square bg-checkerboard rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-gray-100 relative">
                                <img src={part.dataUrl} className="max-w-full max-h-full object-contain" alt="Part" />
                                <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1 rounded-sm">
                                    {Math.round(part.bbox.w)}x{Math.round(part.bbox.h)}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Assigned Tag</label>
                                <input
                                    type="text"
                                    value={part.id}
                                    onChange={(e) => handlePartRename(idx, e.target.value)}
                                    className={`w-full p-2 rounded border focus:outline-none focus:ring-2 ${STANDARD_TAGS.some(t => t.id === part.id) ? 'border-emerald-300 text-emerald-700 font-bold' : 'border-gray-300 text-gray-700'}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
