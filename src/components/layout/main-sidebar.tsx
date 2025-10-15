
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, MessageSquare, Users, Clapperboard, Palette, Cpu, Landmark, Wind, BookCheck, ShieldHalf, Briefcase, Sparkles, User, LogOut, Workflow, Code, Star, BookOpen, GitMerge, Puzzle, Key, LifeBuoy, HelpCircle, Bell } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/layout/user-nav';
import { cn } from '@/lib/utils';
import { useSound } from '@/hooks/use-sound';
import { Button } from '../ui/button';

type NavItem = {
    href: string;
    icon: React.ElementType;
    label: string;
    description: string;
}

const coreNavItems: NavItem[] = [
  { href: '/ask', icon: MessageSquare, label: 'Ask', description: 'The main AI chat interface for multi-modal interactions.' },
  { href: '/canvas', icon: Cpu, label: 'Canvas', description: 'Your goal-oriented autonomous web agent.' },
  { href: '/codex', icon: Code, label: 'CodeX', description: 'Your AI pair programmer for generating frontend components.' },
  { href: '/workflows', icon: GitMerge, label: 'Workflows', description: 'Automate tasks by creating powerful, connected flows.' },
  { href: '/agents', icon: Users, label: 'Agents', description: 'Interact with specialized AI agents or create your own.' },
  { href: '/extensions', icon: Puzzle, label: 'Extensions', description: 'Extend the functionality of AGI-S with custom plugins.' },
];

const businessNavItems: NavItem[] = [
    { href: '/dashboard', icon: Briefcase, label: 'Dashboard', description: 'AI-powered command center for market intelligence.' },
    { href: '/workspaces', icon: Users, label: 'Workspaces', description: 'Collaborate with your team and share AI projects.' },
];

const exploreNavItems: NavItem[] = [
    { href: '/discover', icon: Compass, label: 'Discover', description: 'Your daily brief of market trends and top headlines.' },
    { href: '/notifications', icon: Bell, label: 'Notifications', description: 'Manage your notification settings.' },
    { href: '/api', icon: Key, label: 'API', description: 'Integrate your own tools and services with AGI-S.' },
    { href: '/support', icon: LifeBuoy, label: 'Support', description: 'Get help and submit feedback.' },
    { href: '/faq', icon: HelpCircle, label: 'FAQ', description: 'Find answers to common questions.' },
];

const createNavItems: NavItem[] = [
  { href: '/continuum', icon: Landmark, label: 'Continuum', description: 'AI-powered historical & future event simulator.' },
  { href: '/aether', icon: Wind, label: 'Aether', description: 'Your AI-powered dream journal and visualizer.' },
  { href: '/cosmos', icon: Star, label: 'Cosmos', description: 'Generate entire fictional universes and lorebooks with a prompt.' },
  { href: '/media', icon: Clapperboard, label: 'Media', description: 'Generate video or audio content from text.' },
  { href: '/creator', icon: Palette, label: 'Creator', description: 'Analyze images/PDFs or generate new visual content.' },
];

const productivityNavItems: NavItem[] = [
  { href: '/synthesis', icon: BookCheck, label: 'Synthesis', description: 'Your AI Data Analyst & Report Generator.' },
  { href: '/blueprint', icon: Workflow, label: 'Blueprint', description: 'Deconstructs goals into actionable plans with tools.' },
];

const strategyNavItems: NavItem[] = [
    { href: '/crucible', icon: ShieldHalf, label: 'Crucible', description: 'The AI Red Team & Decision Simulator to pressure-test ideas.' },
];

const learnNavItems: NavItem[] = [
    { href: '/catalyst', icon: BookOpen, label: 'Catalyst', description: 'Generates personalized learning paths and curriculums on any topic.' },
];


const NavGroup = ({ title, items, state, pathname, playNavSound }: { title: string, items: NavItem[], state: 'expanded' | 'collapsed', pathname: string, playNavSound: () => void }) => {
  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => {
      const Icon = item.icon;
      const isActive = pathname.startsWith(item.href);
      return (
        <SidebarMenuItem key={item.href} onClick={() => !isActive && playNavSound()}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={isActive}
              tooltip={(
                <div>
                    <p className="font-bold">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              )}
            >
              <Icon />
              <span className={cn(state === 'collapsed' && 'opacity-0')}>
                {item.label}
              </span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      );
    });
  }

  if (state === 'collapsed') {
      return (
          <>
            <SidebarSeparator />
            <ul className="flex w-full min-w-0 flex-col gap-1 py-2">{renderNavItems(items)}</ul>
          </>
      )
  }

  return (
    <AccordionItem value={title} className="border-none">
        <AccordionTrigger className="py-2 px-3 text-sm text-muted-foreground font-bold uppercase hover:no-underline hover:text-foreground tracking-wider">
            {title}
        </AccordionTrigger>
        <AccordionContent className="pb-0">
            <ul className="flex w-full min-w-0 flex-col gap-1 pt-1">
                {renderNavItems(items)}
            </ul>
        </AccordionContent>
    </AccordionItem>
  )
}

export function MainSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const playNavSound = useSound('/sounds/navigate.mp3');

  const navProps = { state, pathname, playNavSound };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div
          className={cn(
            'flex h-16 items-center justify-center gap-2'
          )}
        >
          {state === 'expanded' ? (
              <Logo className="h-10" />
          ) : (
             <Cpu/>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Accordion type="multiple" className="w-full" disabled={state === 'collapsed'} defaultValue={['Core', 'Business', 'Productivity', 'Strategy', 'Learn', 'Explore', 'Create']}>
            <NavGroup title="Core" items={coreNavItems} {...navProps} />
            <NavGroup title="Business" items={businessNavItems} {...navProps} />
            <NavGroup title="Productivity" items={productivityNavItems} {...navProps} />
            <NavGroup title="Strategy" items={strategyNavItems} {...navProps} />
            <NavGroup title="Learn" items={learnNavItems} {...navProps} />
            <NavGroup title="Explore" items={exploreNavItems} {...navProps} />
            <NavGroup title="Create" items={createNavItems} {...navProps} />
        </Accordion>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarMenuItem className="overflow-hidden">
        <Link href="/pro">
            <SidebarMenuButton variant="outline" className="w-full justify-center text-primary hover:text-primary border-primary/50 hover:border-primary hover:bg-primary/10 animate-static-glow">
                <Sparkles />
                <span className={cn(state === 'collapsed' && 'opacity-0')}>
                    Upgrade to Pro
                </span>
            </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarSeparator />
      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  );
}
