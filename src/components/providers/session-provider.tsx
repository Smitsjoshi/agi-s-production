'use client';

import type { User } from '@/lib/types';
import React, { createContext, useState, useMemo } from 'react';

interface SessionContextType {
  user: User | null;
  signIn: (otp: string) => Promise<User>;
  signOut: () => void;
  isLoading: boolean;
  isSignedIn: boolean;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

const userMap: { [key: string]: { name: string; email: string } } = {
  '115667': { name: 'Ketul', email: 'ketul@example.com' },
  '115668': { name: 'Nisarg', email: 'nisarg@example.com' },
  '115669': { name: 'Yash', email: 'yash@example.com' },
  '115660': { name: 'Gaurav', email: 'gaurav@example.com' },
  '115671': { name: 'Dushyant', email: 'dushyant@example.com' },
  '123456': { name: 'Smit', email: 'smit@example.com' },
};

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isSignedIn = !!user;

  const signIn = (otp: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const userData = userMap[otp];
        if (userData) {
          const newUser = {
            id: otp,
            ...userData,
            avatarUrl: `https://picsum.photos/seed/${otp}/100/100`,
          };
          setUser(newUser);
          resolve(newUser);
        } else {
          reject(new Error('Invalid access code'));
        }
        setIsLoading(false);
      }, 1000);
    });
  };

  const signOut = () => {
    setUser(null);
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
