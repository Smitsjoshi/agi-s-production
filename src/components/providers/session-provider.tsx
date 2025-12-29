'use client';

import type { User } from '@/lib/types';
import React, { createContext, useState, useMemo, useEffect } from 'react';
import { auth, onAuthStateChanged, logOut } from '@/lib/firebase/auth';

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

  // Use the admin email from the context (or hardcode for now as per instructions)
  const ADMIN_EMAIL = 'mmsjsmit@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email?.toLowerCase();

        if (email === ADMIN_EMAIL.toLowerCase()) {
          // Admin: Full Access
          const userData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName || 'Admin',
            avatarUrl: firebaseUser.photoURL || '',
            pages: ['all']
          };
          setUser(userData);
        } else if (['dushyant@testing.com', 'dushyant@gmail.com', 'yash@testing.com', 'dhruv@testing.com'].includes(email || '')) {
          // Testers: Partial Access
          const names: { [key: string]: string } = {
            'dushyant@testing.com': 'Dushyant',
            'dushyant@gmail.com': 'Dushyant',
            'yash@testing.com': 'Yash',
            'dhruv@testing.com': 'Dhruv'
          };
          const userData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: names[email || ''] || 'Tester',
            avatarUrl: firebaseUser.photoURL || '',
            pages: ['/ask']
          };
          setUser(userData);
        } else {
          // Unauthorized
          console.warn(`Unauthorized: ${email}`);
          await logOut();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string): Promise<User> => {
    // This is just a stub for the context interface, actual auth happens in login page via library
    // We could redirect here if we wanted to enforce flow
    throw new Error("Use the login page.");
  };

  const signOut = () => {
    logOut();
  };

  // Redirect if not signed in and not on a public page
  useEffect(() => {
    if (!isLoading && !user) {
      // Basic client-side protection
      // We could use usePathname to check if we are already on /login or /signup
      // But for now, let's just expose the logic and let the layout/page handle it or 
      // add a specific 'ProtectedLayout' component.
      // Actually, let's do it here for simplicity as requested.
      const isPublicPath = window.location.pathname === '/login' || window.location.pathname === '/signup';
      if (!isPublicPath) {
        window.location.href = '/login';
      }
    }
  }, [user, isLoading]);

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
