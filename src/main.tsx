import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { GameProvider } from './context/GameContext'; // Legacy Context for OmniHub compatibility

// Note: We wrap App in GameProvider only to keep legacy OmniHub working
// while we migrate components to Zustand one by one.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>
);
