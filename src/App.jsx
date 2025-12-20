import React, { useState } from 'react';
import OmniHub from './components/main/OmniHub';
import { DebugMenu } from './components/debug/DebugMenu';

export default function App() {
    return (
        <>
            <OmniHub />
            <DebugMenu />
        </>
    );
}
