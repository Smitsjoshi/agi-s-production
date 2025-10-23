'use client';

import type { User } from '@/lib/types';
import React, { createContext, useState, useMemo } from 'react';

interface SessionContextType {
  user: User | null;
  signIn: (email: string, pass: string) => Promise<User>;
  signOut: () => void;
  isLoading: boolean;
  isSignedIn: boolean;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

const userMap: { [key: string]: { name: string; email: string, pass: string, pages: string[] } } = {
    'mmsjsmit@gmail.com': { name: 'Smit', email: 'mmsjsmit@gmail.com', pass: '123456', pages:['all'] },
    'kvkdgt12345@gmail.com': { name: 'Kvkdgt', email: 'kvkdgt12345@gmail.com', pass: '123321', pages: ['/ask', '/support', '/faq'] },
    'yashgk543@gmail.com': { name: 'Yash', email: 'yashgk543@gmail.com', pass: '123321', pages: ['/ask', '/support', '/faq'] },
  };

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isSignedIn = !!user;

  const signIn = (email: string, pass: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const lowercasedEmail = email.toLowerCase();
        const userData = userMap[lowercasedEmail];
        if (userData && userData.pass === pass) {
          const newUser: User = {
            id: lowercasedEmail,
            name: userData.name,
            email: userData.email,
            avatarUrl: `https://picsum.photos/seed/${lowercasedEmail}/100/100`,
            pages: userData.pages,
          };
          setUser(newUser);
          resolve(newUser);
        } else {
          reject(new Error('Invalid email or password'));
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
