// LocalStorage utilities for persistent data

export const storage = {
    // Generic get/set
    get: <T>(key: string, defaultValue: T): T => {
        if (typeof window === 'undefined') return defaultValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading from localStorage key "${key}":`, error);
            return defaultValue;
        }
    },

    set: <T>(key: string, value: T): void => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
        }
    },

    remove: (key: string): void => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    },

    clear: (): void => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    },
};

// Specific storage keys
export const STORAGE_KEYS = {
    CONVERSATIONS: 'agi-s-conversations',
    CURRENT_CONVERSATION: 'agi-s-current-conversation',
    CUSTOM_AGENTS: 'agi-s-custom-agents',
    CODE_LIBRARY: 'agi-s-code-library',
    CODE_HISTORY: 'agi-s-code-history',
    USER_PREFERENCES: 'agi-s-user-preferences',
} as const;

// Auto-save hook
export function useAutoSave<T>(
    key: string,
    value: T,
    delay: number = 30000 // 30 seconds
) {
    if (typeof window === 'undefined') return;

    const timeoutRef = React.useRef<NodeJS.Timeout>();

    React.useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            storage.set(key, value);
        }, delay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [key, value, delay]);
}

import React from 'react';
