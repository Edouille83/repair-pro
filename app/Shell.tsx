"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./components/Sidebar";
import { StoreProvider } from "./store/StoreProvider";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isPublic = pathname?.startsWith("/dossier") || pathname?.startsWith("/book") || pathname?.startsWith("/suivi");

  if (isPublic) {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  return (
    <StoreProvider>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-slate-900">Repair Pro</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 border-r border-slate-200 bg-white h-screen sticky top-0 flex-col overflow-y-auto">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <>
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="lg:hidden fixed top-0 left-0 h-full w-72 bg-white z-50 overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">R</span>
                  </div>
                  <span className="font-bold text-slate-900">Repair Pro</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto pt-20 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </StoreProvider>
  );
}
