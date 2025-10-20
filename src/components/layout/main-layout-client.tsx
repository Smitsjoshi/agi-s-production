'use client';

import { SidebarProvider, SidebarInset, SidebarRail } from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/layout/main-sidebar";
import { MouseFollower } from "@/components/mouse-follower";
import { Header } from "@/components/layout/header";
import { UpgradeBanner } from "@/components/upgrade-banner";
import { useEffect, useState } from "react";
import Loading from "@/app/(main)/loading";
import { useSession } from "@/hooks/use-session";
import { OtpForm } from "@/components/auth/access code form";

export function MainLayoutClient({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const { isSignedIn } = useSession();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-center">Access Code</h1>
            <p className="text-sm text-center text-muted-foreground">
              Enter your access code provided by Smit to access AGI-S
            </p>
          </div>
          <OtpForm />
        </div>
      </div>
    );
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
