import React from 'react';

export function GenreSelection({ onSelect }) {
    const genres = [
        { id: 'scifi', label: 'Cyberpunk 2077', icon: '🌆', desc: 'High-tech, low-life. Neon lights and chrome.', color: 'from-blue-600 to-purple-600' },
        { id: 'horror', label: 'Cosmic Horror', icon: '👁️', desc: 'Ancient madness in a derelict station.', color: 'from-red-900 to-black' },
        { id: 'romance', label: 'Neo-Tokyo Romance', icon: '🌸', desc: 'Love and heartbreak in a digital age.', color: 'from-pink-500 to-rose-400' },
    ];

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
            <div className="max-w-4xl w-full space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse tracking-tighter">
                        NEXUS RPG
                    </h1>
                    <p className="text-theme-muted text-lg md:text-xl max-w-2xl mx-auto">
                        Initialize your neural link. Select a simulation parameter.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {genres.map((g) => (
                        <button
                            key={g.id}
                            onClick={() => onSelect(g.id)}
                            className="group relative h-64 rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all hover:scale-105"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${g.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
                            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center gap-4">
                                <div className="text-6xl mb-2 transform group-hover:scale-110 transition-transform duration-500">{g.icon}</div>
                                <h3 className="text-2xl font-bold text-white">{g.label}</h3>
                                <p className="text-sm text-gray-300">{g.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
