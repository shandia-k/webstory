import React, { useState } from 'react';
import { useRiggingStudio } from './useRiggingStudio';
// @ts-ignore
import { RiggingSidebar } from './rigging/RiggingSidebar';
// @ts-ignore
import { RiggingToolbar } from './rigging/RiggingToolbar';
// @ts-ignore
import { RiggingCanvas } from './rigging/RiggingCanvas';
// @ts-ignore
import { TaggingCorrectionView } from './rigging/TaggingCorrectionView';
import { ArrowLeft } from 'lucide-react';

interface RiggingStudioProps {
    onBack: () => void;
    uiText: any;
}

const RiggingStudio: React.FC<RiggingStudioProps> = ({ onBack, uiText }) => {
    // --- HOOK (Logic Controller) ---
    // Ideally this hook also needs to be converted to TS, but for now we consume it as JS
    const {
        state, actions, refs
    } = useRiggingStudio();

    const [showTaggingView, setShowTaggingView] = useState(false);

    return (
        <div className="w-full h-full flex flex-col bg-gray-900 text-white relative">

            {/* HEADER */}
            <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between z-50">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-bold text-lg tracking-wide flex items-center gap-2">
                        <span className="text-blue-500">2D</span> Rigging Studio
                        <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-400">Beta</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                     <button
                        onClick={() => setShowTaggingView(!showTaggingView)}
                        className={`text-xs font-bold px-3 py-1.5 rounded border transition-colors ${showTaggingView ? 'bg-blue-600 border-blue-500 text-white' : 'border-gray-600 text-gray-400 hover:text-white'}`}
                     >
                        {showTaggingView ? 'Hide Tagger' : 'Show Tagger'}
                     </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* LEFT: SIDEBAR (LAYERS / BONES) */}
                <div className="w-72 bg-gray-800 border-r border-gray-700 flex flex-col z-20">
                    <RiggingSidebar
                        bones={state.bones}
                        selectedBoneId={state.selectedBoneId}
                        onSelectBone={actions.handleSelectBone}
                        onCreateBone={actions.handleCreateBone}
                        // Add more props as needed by Sidebar
                    />
                </div>

                {/* CENTER: CANVAS */}
                <div className="flex-1 bg-[#1a1a1a] relative overflow-hidden flex items-center justify-center">
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                         style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    </div>

                    {showTaggingView ? (
                        <TaggingCorrectionView
                             image={state.image}
                             points={state.points} // Assuming hook provides points
                             onUpdatePoints={actions.handleUpdatePoints}
                        />
                    ) : (
                        <RiggingCanvas
                            image={state.image}
                            bones={state.bones}
                            mesh={state.mesh}
                            // Pass refs and handlers
                            canvasRef={refs.canvasRef}
                        />
                    )}

                    {/* FLOATING TOOLBAR */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur border border-gray-600 rounded-full px-6 py-3 shadow-2xl flex gap-4">
                        <RiggingToolbar
                            activeTool={state.activeTool}
                            onSetTool={actions.handleSetTool}
                        />
                    </div>
                </div>

                {/* RIGHT: PROPERTIES (Optional) */}
                {/* <div className="w-64 bg-gray-800 border-l border-gray-700 p-4">
                    Properties Panel
                </div> */}

            </div>
        </div>
    );
};

export default RiggingStudio;
