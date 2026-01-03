"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

interface MainLayoutProps {
  children: React.ReactNode;
}

import { useThemeTransitions } from "@/hooks/useTheme";

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { transitionClass } = useThemeTransitions();

  return (
    <div className={`flex h-screen overflow-hidden bg-background ${transitionClass}`}>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden transition-all duration-300 ease-in-out lg:block ${isCollapsed ? "w-[70px]" : "w-64"
          } shadow-xl z-10 bg-card`}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          onItemClick={() => setIsCollapsed(true)}
        />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-card">
          <SheetTitle className="hidden">Navigation Menu</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className={`flex h-14 items-center gap-4 bg-card px-4 lg:hidden shrink-0 shadow-md ${transitionClass}`}>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-bold text-lg">ERP Packaging</span>
        </header>

        <main className={`flex-1 overflow-auto bg-muted/20 ${transitionClass}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
