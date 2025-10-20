'use client';

import React, { useEffect, useRef } from 'react';
import { useTour } from './tour-provider';
import { tourSteps } from './tour-steps';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { X } from 'lucide-react';

export function TourTooltip() {
  const { isTourActive, currentStep, nextStep, stopTour } = useTour();
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTourActive && tourSteps[currentStep]) {
      const targetElement = document.querySelector(tourSteps[currentStep].target as string) as HTMLElement;
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const rect = targetElement.getBoundingClientRect();
        if (tooltipRef.current) {
          tooltipRef.current.style.top = `${rect.bottom + 10}px`;
          tooltipRef.current.style.left = `${rect.left}px`;
        }
      }
    }
  }, [isTourActive, currentStep]);

  if (!isTourActive || !tourSteps[currentStep]) {
    return null;
  }

  const { content, icon: Icon } = tourSteps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute z-50 p-4 bg-primary text-primary-foreground rounded-lg shadow-lg max-w-sm"
      >
        <div className="flex items-start gap-4">
          {Icon && <Icon className="h-6 w-6 mt-1" />}
          <p className="flex-1">{content}</p>
          <Button variant="ghost" size="icon" onClick={stopTour} className="-mr-2 -mt-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-end mt-4">
          {currentStep < tourSteps.length - 1 ? (
            <Button onClick={nextStep}>Next</Button>
          ) : (
            <Button onClick={stopTour}>Finish</Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
