import React from 'react';
import { Plus, Move, Anchor, Wand2, Download, Copy, Trash2, Eye } from 'lucide-react';

const ToolButton = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`p-3 rounded-xl transition-all duration-200 group relative flex items-center justify-center
            ${active ? 'bg-indigo-100 text-indigo-600 shadow-inner' : 'hover:bg-gray-100 text-gray-500'}`}
    >
        {icon}
        <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {label}
        </span>
    </button>
);

export const RiggingToolbar = ({ tool, setTool, actions, selectedBoneId, showDebug, setShowDebug }) => {
    return (
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-4 z-10 shadow-sm">
            <ToolButton icon={<Plus />} label="Manual Add" active={tool === 'add'} onClick={() => setTool('add')} />
            <ToolButton icon={<Move />} label="Move" active={tool === 'move'} onClick={() => setTool('move')} />
            <ToolButton icon={<Anchor />} label="Adjust Pivot" active={tool === 'anchor'} onClick={() => setTool('anchor')} />

            <div className="w-8 h-[1px] bg-gray-200 my-2" />

            <ToolButton icon={<Wand2 />} label="Magic Remove BG" active={tool === 'magic'} onClick={() => setTool('magic')} />

            <div className="w-8 h-[1px] bg-gray-200 my-2" />

            <div className="flex flex-col gap-2">
                <button
                    onClick={actions.handleExportRig}
                    className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Export JSON"
                >
                    <Download size={24} />
                </button>

                <button
                    onClick={actions.handleCopyData}
                    className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                    title="Copy JSON to Clipboard"
                >
                    <Copy size={24} />
                </button>
            </div>

            <button
                onClick={actions.handleDeleteBone}
                className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedBoneId}
                title="Delete Selected"
            >
                <Trash2 size={24} />
            </button>

            <div className="w-8 h-[1px] bg-gray-200 my-2" />

            <button
                onClick={() => setShowDebug(!showDebug)}
                className={`p-3 rounded-xl transition-all ${showDebug ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:bg-gray-50'}`}
                title="Toggle AI Heatmap"
            >
                <Eye size={24} />
            </button>
        </div>
    );
};
