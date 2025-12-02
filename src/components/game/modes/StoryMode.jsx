import React, { useState } from 'react';
import { useGame } from '../../../context/GameContext';
import { NarrativeFeed } from '../game-board/narrative-feed/NarrativeFeed';
import { InputArea } from '../game-board/input-area/InputArea';
import { Sidebar } from '../game-board/sidebar/Sidebar';
import { Header } from '../game-board/header/Header';

export function StoryMode({ setGameStarted, isSidebarOpen, setIsSidebarOpen, isMenuOpen, setIsMenuOpen }) {
    const {
        handleAction,
        stats,
        inventory,
        history,
        isProcessing,
        choices,
        gameOver
    } = useGame();

    const [inputValue, setInputValue] = useState("");

    const handleSend = (action) => {
        const input = typeof action === 'string' ? action : inputValue;
        if (input.trim()) {
            handleAction(input);
            setInputValue("");
        }
    };

    return (
        <>
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                stats={stats}
                inventory={inventory}
                handleAction={handleAction}
            />

            <main className="flex-1 flex flex-col min-w-0 bg-transparent relative transition-colors duration-500 z-10">
                <Header
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                />

                <div className="flex-1 min-h-0 relative flex flex-col">
                    <div className="flex-1 min-h-0 flex flex-col">
                        <NarrativeFeed handleSend={handleSend} />
                    </div>
                </div>

                <InputArea
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    handleSend={handleSend}
                    choices={choices}
                    inventory={inventory}
                    handleAction={handleAction}
                    disabled={gameOver}
                />
            </main>
        </>
    );
}
