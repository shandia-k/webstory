import React, { useState, useEffect } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';


function App() {
    const {
        theme,
        setTheme,
        gameData,
        chatLog,
        handleInput,
        inspectItem
    } = useGameEngine('scifi');

    // Default to open on larger screens, closed on smaller
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsPanelOpen(false);
            } else {
                setIsPanelOpen(true);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const togglePanel = () => {
        setIsPanelOpen(!isPanelOpen);
    };

    return (
        <>
            <div className="debug-bar">
                <span style={{ alignSelf: 'center', color: '#888' }}>GENRE SELECTOR:</span>
                <button className="debug-btn" onClick={() => setTheme('scifi')}>Sci-Fi (Cyberpunk)</button>
                <button className="debug-btn" onClick={() => setTheme('horror')}>Horror (Mansion)</button>
                <button className="debug-btn" onClick={() => setTheme('romance')}>Romance (School)</button>
            </div>

            <div className="game-container">
                {/* Floating Avatar Button */}
                <button
                    className={`avatar-toggle-btn ${!isPanelOpen ? 'closed' : ''}`}
                    onClick={togglePanel}
                    title={isPanelOpen ? "Close Panel" : "Open Panel"}
                >
                    {gameData.avatar}
                </button>

                <div className={`left-panel-wrapper ${!isPanelOpen ? 'closed' : ''}`}>
                    <LeftPanel
                        // avatar prop removed as it's now the toggle button
                        stats={gameData.stats}
                        status={gameData.status}
                        items={gameData.items}
                        onInspect={inspectItem}
                        quest={gameData.quest}
                    />
                </div>

                <div className="center-panel-wrapper">
                    <CenterPanel
                        chatLog={chatLog}
                        onInput={handleInput}
                    />
                </div>
            </div>
        </>
    );
}

export default App;
