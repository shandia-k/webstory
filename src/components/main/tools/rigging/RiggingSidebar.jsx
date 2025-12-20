import React from 'react';
import { Wand2, Layers, ChevronDown, Circle } from 'lucide-react';

export const RiggingSidebar = ({ tool, tolerance, setTolerance, bones, selectedBoneId, handleSelection, state, actions }) => {

    const renderBoneHierarchy = (parentId = null, level = 0) => {
        const children = bones.filter(b => b.parentId === parentId);
        if (children.length === 0) return null;

        return (
            <div className={`pl-${level * 2} mt-1`}>
                {children.map(bone => (
                    <div key={bone.id}>
                        <div
                            className={`flex items-center gap-2 p-1 rounded cursor-pointer ${selectedBoneId === bone.id ? 'bg-indigo-100 text-indigo-700 font-bold' : 'hover:bg-gray-100 text-gray-600'}`}
                            onClick={(e) => { e.stopPropagation(); handleSelection(bone.id); }}
                        >
                            <ChevronDown size={14} className="text-gray-400" />
                            <Circle size={8} fill={selectedBoneId === bone.id ? "currentColor" : "none"} />
                            <span className="text-sm">{bone.name}</span>
                        </div>
                        {renderBoneHierarchy(bone.id, level + 1)}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-64 bg-white border-l border-gray-200 flex flex-col z-10 shadow-sm">
            {tool === 'magic' && (
                <div className="p-4 bg-purple-50 border-b border-purple-100">
                    <h3 className="text-sm font-bold text-purple-700 flex items-center gap-2 mb-2">
                        <Wand2 size={16} /> Magic Remove
                    </h3>
                    <p className="text-xs text-purple-600 mb-3">Click on a color to remove it.</p>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Color Tolerance: {tolerance}</label>
                    <input type="range" min="10" max="150" value={tolerance} onChange={(e) => setTolerance(parseInt(e.target.value))} className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer" />
                </div>
            )}

            <div className="p-4 border-b border-gray-100 font-bold text-gray-700 flex items-center gap-2">
                <Layers size={18} />
                Hierarchy
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {bones.length === 0 ? (
                    <p className="p-4 text-xs text-center text-gray-400 italic">No bones added yet.</p>
                ) : (
                    renderBoneHierarchy()
                )}
            </div>

            {/* ANIMATION FOOTER */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                {bones.length > 0 && (
                    <div className="mb-4">
                        <p className="font-bold text-gray-700 mb-2 flex justify-between items-center">
                            Animations
                            {state.isPlaying && (
                                <button onClick={actions.stopAnimation} className="text-red-500 hover:text-red-600 font-bold text-[10px] uppercase border border-red-200 px-2 py-1 rounded bg-red-50">Stop</button>
                            )}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {['idle', 'walk', 'jump', 'happy', 'fall', 'eat', 'confused'].map(anim => (
                                <button key={anim} onClick={() => actions.startAnimation(anim)} className={`p-2 rounded text-center border transition-all capitalize ${state.currentAnim === anim ? 'bg-green-100 border-green-300 text-green-700 font-bold shadow-inner' : 'bg-white border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 text-gray-600'}`}>
                                    {anim}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {selectedBoneId ? (
                    <>
                        <p className="font-bold text-indigo-600 mb-1">SELECTED: {bones.find(b => b.id === selectedBoneId)?.name}</p>
                        <p>X: {Math.round(bones.find(b => b.id === selectedBoneId)?.x * 100)}%</p>
                        <p>Y: {Math.round(bones.find(b => b.id === selectedBoneId)?.y * 100)}%</p>
                    </>
                ) : "Select a bone to view properties"}
            </div>
        </div>
    );
};
