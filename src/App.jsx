import React from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';

function App() {
    const {
        theme,
        setTheme,
        gameData,
        chatLog,
        handleInput,
        inspectItem
    } = useGameEngine('scifi');

    return (
        <>
            <div className="debug-bar">
                <span style={{ alignSelf: 'center', color: '#888' }}>GENRE SELECTOR:</span>
                <button className="debug-btn" onClick={() => setTheme('scifi')}>Sci-Fi (Cyberpunk)</button>
                <button className="debug-btn" onClick={() => setTheme('horror')}>Horror (Mansion)</button>
                <button className="debug-btn" onClick={() => setTheme('romance')}>Romance (School)</button>
            </div>

            <div className="game-container">
                <LeftPanel
                    avatar={gameData.avatar}
                    stats={gameData.stats}
                    status={gameData.status}
                />
                <CenterPanel
                    chatLog={chatLog}
                    onInput={handleInput}
                />
                <RightPanel
                    items={gameData.items}
                    quest={gameData.quest}
                    onInspect={inspectItem}
                />
            </div>
        </>
    );
}

export default App;
