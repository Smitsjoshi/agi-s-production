'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

interface TourContextType {
  isTourActive: boolean;
  currentStep: number;
  startTour: () => void;
  nextStep: () => void;
  stopTour: () => void;
  setCurrentStep: (step: number) => void;
}

const TourContext = createContext<TourContextType | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startTour = useCallback(() => {
    setIsTourActive(true);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prevStep => prevStep + 1);
  }, []);

  const stopTour = useCallback(() => {
    setIsTourActive(false);
    setCurrentStep(0);
  }, []);

  return (
    <TourContext.Provider value={{ isTourActive, currentStep, startTour, nextStep, stopTour, setCurrentStep }}>
      {children}
    </TourContext.Provider>
  );
}

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
