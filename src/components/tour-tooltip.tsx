'use client';

import { useEffect, useState } from 'react';
import { useTour } from './tour-provider';
import { tourSteps } from './tour-steps';
import { Button } from './ui/button';
import { X } from 'lucide-react';

export function TourTooltip() {
  const { isTourActive, currentStep, nextStep, stopTour } = useTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (isTourActive) {
      const step = tourSteps[currentStep];
      const targetElement = document.querySelector(step.target) as HTMLElement;

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetRect(rect);
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        console.error(`Tour target element not found: ${step.target}`);
        nextStep(); // Skip to the next step if element not found
      }
    }
  }, [isTourActive, currentStep, nextStep]);

  if (!isTourActive || !targetRect || currentStep >= tourSteps.length) {
    return null;
  }

  const step = tourSteps[currentStep];
  const { icon: Icon } = step;

  const tooltipStyle = {
    top: `${targetRect.bottom + 10}px`,
    left: `${targetRect.left}px`,
  };

  const spotlightStyle = {
    position: 'fixed' as const,
    top: `${targetRect.top - 10}px`,
    left: `${targetRect.left - 10}px`,
    width: `${targetRect.width + 20}px`,
    height: `${targetRect.height + 20}px`,
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
    borderRadius: '8px',
    pointerEvents: 'none' as const,
    zIndex: 9998,
  };

  return (
    <div className="tour-active">
      <div style={spotlightStyle} />
      <div
        className="fixed z-[9999] bg-background p-4 rounded-lg shadow-lg max-w-xs animate-fade-in"
        style={tooltipStyle}
      >
        <div className="flex items-start gap-3">
          {Icon && <Icon className="h-5 w-5 mt-1 text-primary" />}
          <p className="text-sm">{step.content}</p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-muted-foreground">
            {currentStep + 1} / {tourSteps.length}
          </div>
          <div className="flex gap-2">
            <Button onClick={nextStep} size="sm">
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
        <Button
            onClick={stopTour}
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 h-6 w-6"
        >
            <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
