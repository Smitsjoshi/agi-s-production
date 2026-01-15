'use client';

import { useState, useEffect } from 'react';

declare global {
    interface Window {
        AGIS_GHOST_ACTIVE?: boolean;
    }
}

export function useGhostProtocol() {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Check if already active
        if (typeof window !== 'undefined' && window.AGIS_GHOST_ACTIVE) {
            setIsConnected(true);
        }

        // Listen for the announcement event
        const handleGhostReady = () => setIsConnected(true);
        window.addEventListener('AGIS_UAL_READY', handleGhostReady);

        return () => {
            window.removeEventListener('AGIS_UAL_READY', handleGhostReady);
        };
    }, []);

    return { isConnected };
}
