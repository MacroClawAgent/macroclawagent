"use client";

import { AppNav } from "./AppNav";
import { AppFooter } from "./AppFooter";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#08090D] flex flex-col">
      <AppNav />
      <main className="flex-1">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
