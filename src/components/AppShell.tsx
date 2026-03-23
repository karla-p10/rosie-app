"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useTasks } from "@/lib/store";

interface AppShellProps {
  children: React.ReactNode;
  onAddTask?: () => void;
}

export function AppShell({ children, onAddTask }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const initialized = useTasks((s) => s.initialized);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 border-0">
          <Sidebar mobile onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          onMenuClick={() => setMobileOpen(true)}
          onAddTask={onAddTask}
        />
        <main className="flex-1 overflow-y-auto relative">
          {!initialized ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
                  <span className="text-primary text-lg font-bold font-display">R</span>
                </div>
                <p className="text-muted-foreground text-sm">Loading your tasks...</p>
              </div>
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
