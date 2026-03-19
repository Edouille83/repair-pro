"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./components/Sidebar";
import { StoreProvider } from "./store/StoreProvider";
import React from "react";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isPublic = pathname?.startsWith("/dossier") || pathname?.startsWith("/book");

  if (isPublic) {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  return (
    <StoreProvider>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </StoreProvider>
  );
}
