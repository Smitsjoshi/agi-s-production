
'use client';

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { PanelLeft, PlusCircle, PlayCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import useLocalStorage from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@/lib/types";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useTour } from "@/components/tour-provider";


export function Header() {
    const pathname = usePathname();
    const { toast } = useToast();
    const [, setMessages] = useLocalStorage<ChatMessage[]>('chat-history', []);
    const { startTour } = useTour();

    const isAskPage = pathname.startsWith('/ask');

    const handleNewChat = () => {
        window.dispatchEvent(new Event('new-chat'));
        setMessages([]);
        if (isAskPage) {
            toast({ title: 'New Chat' });
        }
    };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6 tour-header">
        <div className="flex items-center gap-2">
            <div className="md:hidden">
                <SidebarTrigger className="sidebar-toggle">
                    <PanelLeft />
                </SidebarTrigger>
            </div>
            <div className="hidden md:block">
                <SidebarTrigger className="sidebar-toggle">
                    <PanelLeft />
                </SidebarTrigger>
            </div>
        </div>
      
      <div className="flex-1"></div>

      
      
      <ThemeSwitcher />
      <Button variant="outline" onClick={startTour}>
          <PlayCircle className="mr-2" />
          Start Tour
      </Button>
      <Button variant="outline" onClick={handleNewChat} className="new-chat-button">
          <PlusCircle className="mr-2" />
          New Chat
      </Button>
    </header>
  );
}
