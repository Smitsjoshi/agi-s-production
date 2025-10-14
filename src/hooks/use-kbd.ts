
'use client';

import { useEffect } from 'react';

export function useKbd(key: string, callback: () => void, metaKey: 'ctrl' | 'shift' | 'alt' | 'none' = 'none') {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMetaKeyPressed = metaKey === 'none' ? !event.ctrlKey && !event.shiftKey && !event.altKey :
                               metaKey === 'ctrl' ? event.ctrlKey :
                               metaKey === 'shift' ? event.shiftKey :
                               metaKey === 'alt' ? event.altKey : false;

      if (event.key.toLowerCase() === key.toLowerCase() && isMetaKeyPressed) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, callback, metaKey]);
}
