'use client';

import Link from 'next/link';

import { AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MainNavAccordionContentProps {
  link: any;
  pathname: string;
}

export function MainNavAccordionContent({
  link,
  pathname,
}: MainNavAccordionContentProps) {
  return (
    <AccordionContent className="flex flex-col gap-2 py-2">
      {link.children.map((child: any) => {
        const Icon = child.icon;
        return (
          <TooltipProvider key={child.href}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={pathname === child.href ? 'secondary' : 'ghost'}
                  className="h-12 w-full items-center justify-start gap-2"
                  asChild
                >
                  <Link href={child.href}>
                    <Icon className="h-4 w-4" />
                    {child.title}
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                <p>{child.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </AccordionContent>
  );
}
