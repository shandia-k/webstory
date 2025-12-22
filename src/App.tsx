import React, { useState } from 'react';
import OmniHub from './components/main/OmniHub';
import TabGuard from './components/common/TabGuard';

export default function App() {
    return (
        <TabGuard>
            <OmniHub />
        </TabGuard>
    );
}
