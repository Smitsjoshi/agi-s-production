'use client';

import type { User } from '@/lib/types';
import React, { createContext, useState, useMemo, useEffect } from 'react';

interface SessionContextType {
  user: User | null;
  signIn: (email: string, pass: string) => Promise<User>;
  signOut: () => void;
  isLoading: boolean;
  isSignedIn: boolean;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSignedIn = !!user;

  useEffect(() => {
    // Auto-sign-in the user with full access
    const autoUser: User = {
      id: 'mmsjsmit@gmail.com',
      name: 'Smit Joshi',
      email: 'mmsjsmit@gmail.com',
      avatarUrl: `https://picsum.photos/seed/mmsjsmit@gmail.com/100/100`,
      pages: ['all'],
    };
    setUser(autoUser);
    setIsLoading(false);
  }, []);

  const signIn = (email: string, pass: string): Promise<User> => {
    // This function is no longer used for login but kept for compatibility
    return new Promise((resolve, reject) => {
        reject(new Error('Manual sign-in is disabled.'));
    });
  };

  const signOut = () => {
    // Sign out is not really possible in this auto-login setup
    console.log("Sign out clicked, but user is auto-logged in.");
  };

  const value = useMemo(
    () => ({
      user,
      signIn,
      signOut,
      isLoading,
      isSignedIn,
    }),
    [user, isLoading, isSignedIn]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
