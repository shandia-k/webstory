import React from 'react';
import { X, BookOpen, Target, Scroll, MapPin } from 'lucide-react';
import { Campaign } from '../../../types/game';
import FitText from '../../common/FitText';
import FormattedText from '../../common/FormattedText';

interface MissionLogProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: Campaign;
}

const MissionLog: React.FC<MissionLogProps> = ({ isOpen, onClose, campaign }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#fcf5e5] w-full max-w-2xl max-h-[80vh] rounded-xl shadow-2xl overflow-hidden flex flex-col border-4 border-[#8d6e63] relative animate-in zoom-in-95 duration-300">
                {/* Vintage/Paper Texture overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}></div>

                {/* HEADER */}
                <div className="bg-[#5d4037] text-[#fcf5e5] p-4 flex items-center justify-between shrink-0 shadow-md z-10">
                    <div className="flex items-center gap-3">
                        <BookOpen size={24} />
                        <span className="font-bold text-xl tracking-widest uppercase">Adventure Log</span>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar relative z-0">

                    {!campaign.isActive ? (
                        <div className="text-center text-gray-500 py-10 opacity-70">
                            <Scroll size={48} className="mx-auto mb-4" />
                            <p className="text-xl font-bold">No active adventure.</p>
                            <p className="text-sm">Start a New Game to begin your journey.</p>
                        </div>
                    ) : (
                        <>
                            {/* CAMPAIGN TITLE & GOAL */}
                            <div className="text-center space-y-2 border-b-2 border-[#8d6e63]/20 pb-6">
                                <h2 className="text-3xl md:text-4xl font-bold text-[#3e2723] font-serif leading-tight">
                                    {campaign.title || "Untitled Saga"}
                                </h2>

                                <div className="inline-flex items-center gap-2 bg-[#8d6e63]/10 text-[#5d4037] px-4 py-2 rounded-full text-sm font-bold mt-2">
                                    <Target size={16} />
                                    <span>Goal: <FormattedText text={campaign.mainGoal || "Changes the world"} /></span>
                                </div>
                            </div>

                            {/* CURRENT CHAPTER */}
                            <div className="bg-white/50 p-6 rounded-lg border-2 border-[#8d6e63]/10 shadow-sm">
                                <div className="flex items-center gap-2 text-[#d84315] font-bold text-sm uppercase tracking-widest mb-3">
                                    <MapPin size={16} />
                                    Current Chapter {campaign.currentChapter}
                                </div>
                                <p className="text-xl font-medium text-[#4e342e] leading-relaxed italic">
                                    "The journey continues..."
                                </p>
                            </div>

                            {/* HISTORY TIMELINE */}
                            <div>
                                <h3 className="text-[#5d4037] font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                                    <Scroll size={16} />
                                    Chronicles
                                </h3>

                                <div className="space-y-4 border-l-2 border-[#8d6e63]/30 pl-6 ml-2">
                                    {campaign.historySummary.length === 0 ? (
                                        <div className="text-gray-400 italic text-sm">No history recorded yet.</div>
                                    ) : (
                                        [...campaign.historySummary].reverse().map((entry, idx) => (
                                            <div key={idx} className="relative">
                                                {/* Timeline dot */}
                                                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#8d6e63] border-2 border-[#fcf5e5]"></div>

                                                <div className="text-[#3e2723] font-serif text-lg leading-relaxed">
                                                    <div className="text-[#3e2723] font-serif text-lg leading-relaxed">
                                                        <FormattedText text={entry} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default MissionLog;
