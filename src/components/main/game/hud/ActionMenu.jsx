import { Gift, Sparkles, Cloud, Rocket } from 'lucide-react';
import FitText from '../../../common/FitText';

const ActionBtn = ({ icon: Icon, label, color, onClick }) => (
    <button
        onClick={(e) => onClick(e)}
        className={`
            flex flex-col items-center justify-center gap-2 p-4 md:p-6 rounded-3xl 
            bg-white shadow-[0_4px_0_0_rgba(0,0,0,0.05)] border-2 border-transparent
            hover:-translate-y-1 hover:shadow-[0_8px_0_0_rgba(0,0,0,0.05)] hover:border-${color}-200
            active:translate-y-1 active:shadow-none
            transition-all duration-200 group
        `}
    >
        <div className={`p-3 md:p-4 rounded-2xl bg-${color}-50 text-${color}-500 group-hover:scale-110 transition-transform`}>
            <Icon size={24} className="md:w-8 md:h-8" />
        </div>
        <div className="w-full h-4 flex items-center justify-center pointer-events-none">
            <FitText maxFontSize={14} className="text-xs md:text-sm font-bold text-gray-400 group-hover:text-gray-600">{label}</FitText>
        </div>
    </button>
);

const ActionMenu = ({ onAction, onExplore, uiText }) => {
    return (
        <div className="grid grid-cols-4 gap-3 md:gap-4 mt-auto">
            <ActionBtn icon={Gift} label={uiText.CUTE_UI.FEED} color="pink" onClick={(e) => onAction('feed', e)} />
            <ActionBtn icon={Sparkles} label={uiText.CUTE_UI.PLAY} color="purple" onClick={(e) => onAction('play', e)} />
            <ActionBtn icon={Cloud} label={uiText.CUTE_UI.NAP} color="blue" onClick={(e) => onAction('sleep', e)} />
            <ActionBtn icon={Rocket} label={uiText.CUTE_UI.EXPLORE} color="indigo" onClick={(e) => onExplore()} />
        </div>
    );
};

export default ActionMenu;
