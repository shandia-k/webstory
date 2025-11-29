import React from 'react';

export function GenreHeader({ uiText }) {
    return (
        <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse tracking-tighter py-2">
                {uiText.UI.GENRE_SELECTION.TITLE}
            </h1>
            <p className="text-theme-muted text-base md:text-xl max-w-2xl mx-auto px-4">
                {uiText.UI.GENRE_SELECTION.SUBTITLE}
            </p>
        </div>
    );
}
