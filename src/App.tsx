import React, { useState } from 'react';
import OmniHub from './components/main/OmniHub';
import TabGuard from './components/common/TabGuard';

export default function App() {
    return (
        <div className="paper-grain min-h-screen">
            <TabGuard>
                <OmniHub />
            </TabGuard>
        </div>
    );
}
