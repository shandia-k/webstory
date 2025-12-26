import React from 'react';
import { Download, Save, Grid, Image as ImageIcon, Type } from 'lucide-react';

interface AssetWorkshopViewProps {
    state: any;
    actions: any;
}

export const AssetWorkshopView: React.FC<AssetWorkshopViewProps> = ({ state, actions }) => {
    const { workshopParts, isProcessing, statusMsg } = state;
    const { handlePartRename, handleDownloadAsset, handleDownloadAllWorkshop } = actions;

    if (isProcessing) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white p-12">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600 font-medium animate-pulse">{statusMsg || 'Processing assets...'}</p>
            </div>
        );
    }

    if (!workshopParts || workshopParts.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 m-8 rounded-2xl">
                <ImageIcon size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-400">No assets detected. Please upload an image.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <div className="p-6 border-b border-gray-100 flex flex-col gap-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Grid size={20} className="text-indigo-500" />
                            Asset Workshop
                        </h2>
                        <p className="text-xs text-gray-400">Detected {workshopParts.length} potential assets.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={actions.handleDownloadAllWorkshop}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 transition-all font-bold text-sm active:scale-95"
                        >
                            <Download size={18} />
                            Download All
                        </button>
                    </div>
                </div>

                {/* CONTROLS */}
                <div className="flex items-center gap-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex-1 flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                            <span>Green Hue Tolerance</span>
                            <span>{state.tolerance}%</span>
                        </div>
                        <input
                            type="range" min="10" max="90" value={state.tolerance}
                            onChange={(e) => actions.setTolerance(Number(e.target.value))}
                            className="w-full accent-indigo-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                            <span>Shadow Sensitivity</span>
                            <span>{state.sensitivity}%</span>
                        </div>
                        <input
                            type="range" min="10" max="90" value={state.sensitivity}
                            onChange={(e) => actions.setSensitivity(Number(e.target.value))}
                            className="w-full accent-indigo-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <button
                        onClick={actions.handleReProcess}
                        className="px-4 py-2 bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold text-xs shadow-sm transition-colors"
                    >
                        Re-Scan
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {workshopParts.map((part, index) => (
                        <div key={index} className="group bg-white border-2 border-gray-100 hover:border-indigo-200 rounded-2xl p-4 transition-all hover:shadow-xl hover:shadow-indigo-50/50 flex flex-col gap-4">
                            {/* PREVIEW */}
                            <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden relative border border-gray-50">
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                                <img
                                    src={part.dataUrl}
                                    className="max-w-[85%] max-h-[85%] object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500"
                                    alt={part.name}
                                />
                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/80 backdrop-blur-sm rounded-lg text-[10px] font-bold text-gray-400 border border-gray-100 italic">
                                    {Math.round(part.bbox.w)}x{Math.round(part.bbox.h)} px
                                </div>
                            </div>

                            {/* NAMING */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                                    <Type size={12} />
                                    Asset Filename
                                </label>
                                <div className="relative">
                                    <select
                                        value={part.name || ''}
                                        onChange={(e) => actions.handleWorkshopRename(index, e.target.value)}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-400 focus:bg-white rounded-xl px-4 py-2 text-xs font-medium text-gray-700 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">-- Select Asset ID --</option>
                                        <optgroup label="1. Action Buttons">
                                            <option value="btn_feed">btn_feed (Food)</option>
                                            <option value="btn_play">btn_play (Toy)</option>
                                            <option value="btn_sleep">btn_sleep (Sleep)</option>
                                            <option value="btn_clean">btn_clean (Clean)</option>
                                            <option value="btn_heal">btn_heal (Heal)</option>
                                            <option value="btn_adventure">btn_adventure (Sword)</option>
                                        </optgroup>
                                        <optgroup label="2. Navigation & System">
                                            <option value="btn_start">btn_start (Banner)</option>
                                            <option value="btn_close">btn_close (Close)</option>
                                            <option value="btn_back">btn_back (Back)</option>
                                            <option value="btn_resume">btn_resume (Resume)</option>
                                            <option value="btn_menu">btn_menu (Menu)</option>
                                        </optgroup>
                                        <optgroup label="3. World/Genre Selectors">
                                            <option value="theme_scifi">theme_scifi</option>
                                            <option value="theme_fantasy">theme_fantasy</option>
                                            <option value="theme_horror">theme_horror</option>
                                            <option value="theme_romance">theme_romance</option>
                                            <option value="theme_slice_of_life">theme_slice_of_life</option>
                                            <option value="theme_isekai">theme_isekai</option>
                                            <option value="theme_mythology">theme_mythology</option>
                                            <option value="theme_wild_west">theme_wild_west</option>
                                            <option value="theme_dark">theme_dark</option>
                                            <option value="theme_comedy">theme_comedy</option>
                                            <option value="theme_world_war">theme_world_war</option>
                                            <option value="theme_surreal">theme_surreal</option>
                                        </optgroup>
                                        <optgroup label="4. UI Containers">
                                            <option value="ui_bubble">ui_bubble (Dialog)</option>
                                            <option value="ui_hud_base">ui_hud_base (Bottom Bar)</option>
                                            <option value="ui_stat_track">ui_stat_track (Progress)</option>
                                            <option value="ui_modal_bg">ui_modal_bg (Modal)</option>
                                            <option value="ui_clipboard">ui_clipboard (Menu)</option>
                                        </optgroup>
                                        <optgroup label="5. Environment">
                                            <option value="env_ground">env_ground</option>
                                            <option value="env_cloud">env_cloud</option>
                                            <option value="env_tree">env_tree</option>
                                            <option value="env_twine">env_twine</option>
                                        </optgroup>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex items-center gap-2 mt-auto pt-2">
                                <button
                                    onClick={() => handleDownloadAsset(part)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all active:scale-95 group/btn"
                                >
                                    <Download size={16} className="group-hover/btn:translate-y-0.5 transition-transform" />
                                    <span className="text-xs font-bold">Download</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
