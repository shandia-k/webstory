import React from 'react';
import { Megaphone, Cookie, Frown, DoorOpen } from 'lucide-react';

const CommandButton = ({ label, icon: Icon, color, onClick, disabled, desc }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
            group relative flex flex-col items-center justify-center gap-2
            p-4 rounded-2xl border-b-4 transition-all active:scale-95
            ${disabled
                ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                : `bg-white border-${color}-200 hover:bg-${color}-50 text-gray-600 hover:text-${color}-600 shadow-sm hover:shadow-md`
            }
        `}
    >
        <Icon size={24} className={disabled ? "text-gray-300" : `text-${color}-500 group-hover:scale-110 transition-transform`} />
        <span className="font-bold text-sm tracking-wide">{label}</span>

        {/* TOOLTIP */}
        {!disabled && (
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs py-1 px-3 rounded-lg whitespace-nowrap pointer-events-none">
                {desc}
            </div>
        )}
    </button>
);

const CoachingMenu = ({ onCommand, disabled }) => {
    return (
        <div className="grid grid-cols-4 gap-3 w-full max-w-lg mx-auto bg-white/50 p-3 rounded-[2rem] backdrop-blur-sm shadow-xl border border-white/50">
            <CommandButton
                label="CHEER"
                icon={Megaphone}
                color="yellow"
                desc="ATK UP, ACC DOWN (Hype!)"
                onClick={() => onCommand('CHEER')}
                disabled={disabled}
            />
            <CommandButton
                label="TREAT"
                icon={Cookie}
                color="pink"
                desc="Heal HP, Skip Turn"
                onClick={() => onCommand('TREAT')}
                disabled={disabled}
            />
            <CommandButton
                label="SCOLD"
                icon={Frown}
                color="indigo"
                desc="ACC UP, Mood DOWN"
                onClick={() => onCommand('SCOLD')}
                disabled={disabled}
            />
            <CommandButton
                label="WAIT"
                icon={DoorOpen}
                color="gray"
                desc="Do nothing..."
                onClick={() => onCommand('WAIT')}
                disabled={disabled}
            />
        </div>
    );
};

export default CoachingMenu;
