'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { links } from '@/lib/links';

import { MainNavAccordionContent } from './main-nav-accordion-content';
import { MainNavAccordionTrigger } from './main-nav-accordion-trigger';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="flex w-full flex-col gap-2">
      <Accordion type="multiple" className="w-full">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <div key={link.href}>
              {link.children ? (
                <div className="flex flex-col">
                  <MainNavAccordionTrigger
                    Icon={Icon}
                    link={link}
                    pathname={pathname}
                  />
                  <MainNavAccordionContent link={link} pathname={pathname} />
                </div>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={pathname === link.href ? 'secondary' : 'ghost'}
                        className="h-12 w-full items-center justify-start gap-2"
                        asChild
                      >
                        <Link href={link.href}>
                          <Icon className="h-4 w-4" />
                          {link.title}
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">
                      <p>{link.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          );
        })}
      </Accordion>
    </div>
  );
}
