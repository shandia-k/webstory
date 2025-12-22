import React from 'react';
import { X, Sword, Search, Book, ChevronsRight } from 'lucide-react';

export type AdventureIntent = 'patrol' | 'scavenge' | 'story';

interface MissionSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (intent: AdventureIntent) => void;
}

const MissionCard = ({ icon: Icon, title, desc, color, border, onClick }: any) => (
    <button
        onClick={onClick}
        className={`w-full bg-white p-4 rounded-xl border-2 ${border} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center gap-4 group text-left`}
    >
        <div className={`p-3 rounded-full ${color} text-white shrink-0 group-hover:scale-110 transition-transform shadow-inner`}>
            <Icon size={24} />
        </div>
        <div className="flex-1">
            <h3 className="font-bold text-gray-700 text-lg">{title}</h3>
            <p className="text-sm text-gray-500 leading-tight">{desc}</p>
        </div>
        <ChevronsRight className="text-gray-300 group-hover:text-gray-600 transition-colors" />
    </button>
);

const MissionSelector: React.FC<MissionSelectorProps> = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl md:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 relative">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Choose Mission</h2>
                        <p className="text-sm text-gray-500 font-bold">What is your goal today?</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Options */}
                <div className="space-y-3">
                    <MissionCard
                        icon={Sword}
                        title="Patrol"
                        desc="Hunt for enemies. High XP, Danger."
                        color="bg-rose-500"
                        border="border-rose-100"
                        onClick={() => onSelect('patrol')}
                    />
                    <MissionCard
                        icon={Search}
                        title="Scavenge"
                        desc="Search for loot & resources. Low Risk."
                        color="bg-amber-400"
                        border="border-amber-100"
                        onClick={() => onSelect('scavenge')}
                    />
                    <MissionCard
                        icon={Book}
                        title="Story Mission"
                        desc="Advance the main plot. High Stakes."
                        color="bg-indigo-500"
                        border="border-indigo-100"
                        onClick={() => onSelect('story')}
                    />
                </div>

            </div>
        </div>
    );
};

export default MissionSelector;
