import React, { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { useRiggingStudio } from './useRiggingStudio';
import { TaggingCorrectionView } from './rigging/TaggingCorrectionView';
import { RiggingToolbar } from './rigging/RiggingToolbar';
import { RiggingSidebar } from './rigging/RiggingSidebar';
import { RiggingCanvas } from './rigging/RiggingCanvas';

const RiggingStudio = ({ onBack, uiText }) => {
    const { state, actions, refs } = useRiggingStudio();
    const { image, bones, selectedBoneId, tool, scale, tolerance, workflowStage, slices } = state;
    const {
        setTool,
        setTolerance,
        handleImageUpload,
        handleSelection,
        handlePartRename,
        handleFinalizeRig,
        handleCopyData
    } = actions;

    const [imgSize, setImgSize] = useState({ w: 1, h: 1 });
    const [showDebug, setShowDebug] = useState(false);

    return (
        <div className="w-full h-full flex flex-col bg-gray-50 text-gray-800 font-sans">
            {/* HEADER */}
            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                            2D Rigging Setup
                        </h1>
                        <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">
                            {workflowStage === 'tagging' ? 'Step 1: Verify Parts' : (workflowStage === 'assembled' ? 'Step 2: Skeleton Adjustment' : 'Start')}
                        </p>
                    </div>
                </div>

                {/* STEPPER */}
                {workflowStage !== 'upload' && (
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${workflowStage === 'tagging' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-gray-400'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${workflowStage === 'tagging' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>1</div>
                            <span>Detection</span>
                        </div>
                        <div className="w-8 h-[2px] bg-gray-200" />
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${workflowStage === 'assembled' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-gray-400'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${workflowStage === 'assembled' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>2</div>
                            <span>Assembly</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <button
                        onClick={actions.handleAutoRig}
                        className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                        title="Restart Wizard"
                    >
                        Restart
                    </button>
                    {workflowStage === 'upload' && (
                        <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer transition-colors shadow-sm">
                            <Upload size={18} />
                            <span className="font-medium text-sm">Upload Image</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT SWITCHER */}
            {workflowStage === 'tagging' ? (
                <TaggingCorrectionView
                    state={state}
                    imgSize={imgSize}
                    handlePartRename={handlePartRename}
                    handleFinalizeRig={handleFinalizeRig}
                    handleCopyData={handleCopyData}
                />
            ) : (
                <div className="flex-1 flex overflow-hidden">
                    {/* TOOLBAR (Left) */}
                    <RiggingToolbar
                        tool={tool}
                        setTool={setTool}
                        actions={actions}
                        selectedBoneId={selectedBoneId}
                        showDebug={showDebug}
                        setShowDebug={setShowDebug}
                    />

                    {/* CANVAS (Center) */}
                    <RiggingCanvas
                        state={state}
                        actions={actions}
                        refs={refs}
                        tool={tool}
                        scale={scale}
                        showDebug={showDebug}
                        imgSize={imgSize}
                        setImgSize={setImgSize}
                    />

                    {/* PROPERTIES (Right) */}
                    <RiggingSidebar
                        tool={tool}
                        tolerance={tolerance}
                        setTolerance={setTolerance}
                        bones={bones}
                        selectedBoneId={selectedBoneId}
                        handleSelection={handleSelection}
                        state={state}
                        actions={actions}
                    />
                </div>
            )}
        </div>
    );
};

export default RiggingStudio;
