'use client';

import { SidebarProvider, SidebarInset, SidebarRail } from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/layout/main-sidebar";
import { MouseFollower } from "@/components/mouse-follower";
import { Header } from "@/components/layout/header";
import { UpgradeBanner } from "@/components/upgrade-banner";
import { useEffect, useState } from "react";
import Loading from "@/app/(main)/loading";

export function MainLayoutClient({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <div className="relative flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-4 sm:p-6 md:p-8">
            {children}
          </main>
          <UpgradeBanner />
        </div>
      </SidebarInset>
      <SidebarRail />
      <MouseFollower />
    </SidebarProvider>
  );
}
