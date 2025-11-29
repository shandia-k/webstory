import React from 'react';

export function GenreList({ genres, handleGenreClick }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-2">
            {genres.map((g) => (
                <button
                    key={g.id}
                    onClick={() => handleGenreClick(g.id)}
                    className="group relative h-48 md:h-64 rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all hover:scale-105 shrink-0"
                >
                    <div className={`absolute inset-0 bg-gradient-to-br ${g.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
                    <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center gap-2 md:gap-4">
                        <div className="text-4xl md:text-6xl mb-2 transform group-hover:scale-110 transition-transform duration-500">{g.icon}</div>
                        <h3 className="text-xl md:text-2xl font-bold text-white">{g.label}</h3>
                        <p className="text-xs md:text-sm text-gray-300 line-clamp-2">{g.desc}</p>
                    </div>
                </button>
            ))}
        </div>
    );
}
