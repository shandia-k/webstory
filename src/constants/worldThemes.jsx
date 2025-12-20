import React from 'react';
import {
    Rocket, Ghost, Sparkles,
    Coffee, Zap, Skull, Heart,
    Crown, Map, Laugh, Crosshair, HelpCircle
} from 'lucide-react';
import { GAME_CONTENT } from './gameContent';

export const WORLD_THEMES = {
    scifi: {
        ...GAME_CONTENT.WORLDS.scifi,
        colors: "from-indigo-400 to-cyan-300",
        buttonGradient: "from-indigo-500 to-cyan-400",
        accent: "bg-cyan-100 text-cyan-600",
        icon: <Rocket size="1em" />,
        bgPattern: "radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2px)",
        bgSize: "30px 30px"
    },
    fantasy: {
        ...GAME_CONTENT.WORLDS.fantasy,
        colors: "from-emerald-400 to-teal-300",
        buttonGradient: "from-emerald-500 to-teal-400",
        accent: "bg-emerald-100 text-emerald-600",
        icon: <Sparkles size="1em" />,
        bgPattern: "repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 10px, transparent 10px, transparent 20px)",
        bgSize: "100% 100%"
    },
    horror: {
        ...GAME_CONTENT.WORLDS.horror,
        colors: "from-purple-900 to-pink-900",
        buttonGradient: "from-purple-800 to-pink-600",
        accent: "bg-purple-950 text-pink-400",
        icon: <Ghost size="1em" />,
        bgPattern: "radial-gradient(circle, rgba(0,0,0,0.2) 10px, transparent 10px)",
        bgSize: "40px 40px"
    },
    romance: {
        ...GAME_CONTENT.WORLDS.romance,
        colors: "from-pink-400 to-rose-300",
        buttonGradient: "from-pink-500 to-rose-400",
        accent: "bg-pink-100 text-rose-500",
        icon: <Heart size="1em" />,
        bgPattern: "radial-gradient(circle, rgba(255,255,255,0.4) 2px, transparent 2px)",
        bgSize: "20px 20px"
    },
    slice_of_life: {
        ...GAME_CONTENT.WORLDS.slice_of_life,
        colors: "from-orange-300 to-yellow-200",
        buttonGradient: "from-orange-400 to-yellow-300",
        accent: "bg-orange-50 text-orange-600",
        icon: <Coffee size="1em" />,
        bgPattern: "repeating-linear-gradient(0deg, transparent 0px, transparent 24px, rgba(255,255,255,0.5) 25px)",
        bgSize: "100% 25px"
    },
    isekai: {
        ...GAME_CONTENT.WORLDS.isekai,
        colors: "from-violet-500 to-indigo-400",
        buttonGradient: "from-violet-600 to-indigo-500",
        accent: "bg-violet-100 text-violet-600",
        icon: <Zap size="1em" />,
        bgPattern: "linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)",
        bgSize: "40px 40px"
    },
    mythology: {
        ...GAME_CONTENT.WORLDS.mythology,
        colors: "from-amber-500 to-yellow-400",
        buttonGradient: "from-amber-600 to-yellow-500",
        accent: "bg-amber-100 text-amber-700",
        icon: <Crown size="1em" />,
        bgPattern: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
        bgSize: "10px 10px"
    },
    wild_west: {
        ...GAME_CONTENT.WORLDS.wild_west,
        colors: "from-amber-700 to-orange-600",
        buttonGradient: "from-amber-800 to-orange-700",
        accent: "bg-orange-100 text-orange-800",
        icon: <Map size="1em" />,
        bgPattern: "repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 20px)",
        bgSize: "20px 100%"
    },
    dark: {
        ...GAME_CONTENT.WORLDS.dark,
        colors: "from-slate-800 to-gray-900",
        buttonGradient: "from-slate-700 to-gray-800",
        accent: "bg-slate-900 text-slate-400",
        icon: <Skull size="1em" />,
        bgPattern: "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
        bgSize: "50px 50px"
    },
    comedy: {
        ...GAME_CONTENT.WORLDS.comedy,
        colors: "from-pink-400 to-yellow-300",
        buttonGradient: "from-pink-500 to-yellow-400",
        accent: "bg-yellow-100 text-pink-500",
        icon: <Laugh size="1em" />,
        bgPattern: "radial-gradient(circle, rgba(255,255,255,0.6) 5px, transparent 5px)",
        bgSize: "25px 25px"
    },
    world_war: {
        ...GAME_CONTENT.WORLDS.world_war,
        colors: "from-green-700 to-stone-600",
        buttonGradient: "from-green-800 to-stone-700",
        accent: "bg-stone-200 text-green-800",
        icon: <Crosshair size="1em" />,
        bgPattern: "repeating-linear-gradient(45deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 5px, transparent 5px, transparent 10px)",
        bgSize: "100% 100%"
    },
    surreal: {
        ...GAME_CONTENT.WORLDS.surreal,
        colors: "from-fuchsia-600 to-purple-500",
        buttonGradient: "from-fuchsia-700 to-purple-600",
        accent: "bg-fuchsia-100 text-purple-700",
        icon: <HelpCircle size="1em" />,
        bgPattern: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 0% 0%, rgba(255,255,255,0.2) 0%, transparent 50%)",
        bgSize: "60px 60px"
    }
};
