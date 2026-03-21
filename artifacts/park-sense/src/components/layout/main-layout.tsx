import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { useLocation } from "wouter";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isHome = location === "/";

  // Hide sidebar on the true landing page for a cleaner look
  if (isHome) {
    return <div className="min-h-screen flex flex-col">{children}</div>;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="h-16 flex items-center px-4 border-b border-border/50 bg-background/80 backdrop-blur-sm z-10 shrink-0 lg:hidden">
            <SidebarTrigger className="mr-4" />
            <div className="font-display font-bold text-lg tracking-tight">
              Park<span className="text-primary">Sense</span>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
