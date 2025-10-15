'use client';

import React, { createContext, useContext } from 'react';
import { useLanguage } from './language-provider';
import { translate } from '@/lib/translator';

interface TranslateContextType {
  t: (key: string) => string;
}

const TranslateContext = createContext<TranslateContextType | null>(null);

export function TranslateProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();

  const t = (key: string) => {
    return translate(key, language);
  };

  return (
    <TranslateContext.Provider value={{ t }}>
      {children}
    </TranslateContext.Provider>
  );
}

export const useTranslation = () => {
  const context = useContext(TranslateContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslateProvider');
  }
  return context;
};
