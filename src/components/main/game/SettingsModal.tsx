import React from 'react';
import { ApiKeyModal } from './ApiKeyModal';

// Wrapper for compatibility if needed, or simply re-export ApiKeyModal if functionality is identical
// In legacy, SettingsModal seemed to be just another name for ApiKeyModal in some contexts,
// or a specific modal for in-game settings.
// For now, we'll map it to ApiKeyModal props structure.

export const SettingsModal: React.FC<any> = (props) => {
    return <ApiKeyModal {...props} />;
}

export default SettingsModal;
