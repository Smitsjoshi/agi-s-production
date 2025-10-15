'use client';

import { AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MainNavAccordionTriggerProps {
  Icon: React.ElementType;
  link: any;
  pathname: string;
}

export const MainNavAccordionTrigger = ({
  Icon,
  link,
  pathname,
}: MainNavAccordionTriggerProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <AccordionTrigger
            className={cn(
              'h-12 w-full items-center justify-between gap-2 rounded-md px-4 text-base transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              {
                'bg-secondary': pathname.includes(link.href),
              },
            )}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <p>{link.title}</p>
            </div>
          </AccordionTrigger>
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
          <p>{link.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
