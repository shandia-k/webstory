import React, { useState, useEffect } from 'react';
import { ShieldAlert, XCircle, ExternalLink } from 'lucide-react';

interface TabGuardProps {
    children: React.ReactNode;
}

const TabGuard: React.FC<TabGuardProps> = ({ children }) => {
    return <>{children}</>;
};

export default TabGuard;
