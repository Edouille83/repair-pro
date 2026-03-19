"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, PenTool, Wrench, FileText, CreditCard, Users, Package, FileSignature, UserCog, Tags, Shield, Bell, Settings, BarChart3, LogOut } from "lucide-react";
import clsx from "clsx";
import { useStore } from "../store/StoreProvider";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount, unretrievedRepairs } = useStore();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  const links = [
    { name: "Prise en charge", href: "/intake", icon: PenTool },
    { name: "Réparations", href: "/repairs", icon: Wrench },
    { name: "Rapports", href: "/reports", icon: BarChart3 },
    { name: "Devis", href: "/quotes", icon: FileSignature },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Factures", href: "/invoices", icon: FileText },
    { name: "Paiements", href: "/payments", icon: CreditCard },
  ];

  const settingsLinks = [
    { name: "Catalogue pièces", href: "/parts", icon: Package },
    { name: "Rappels", href: "/reminders", icon: Bell },
    { name: "Techniciens", href: "/technicians", icon: UserCog },
    { name: "Catégories", href: "/categories", icon: Tags },
    { name: "Garanties", href: "/warranties", icon: Shield },
  ];

  const publicLinks = [
    { name: "Suivi client", href: "/suivi", icon: Bell, external: true },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white h-screen sticky top-0 flex flex-col overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent mb-1">
          Repair Pro
        </h1>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Atelier premium</p>
      </div>

      <nav className="flex flex-col gap-1 px-3 flex-1">
        <Link
          href="/"
          className={clsx(
            "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200",
            pathname === "/" 
              ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <LayoutDashboard className={clsx("w-5 h-5", pathname === "/" ? "text-white" : "text-slate-400")} />
          Tableau de bord
          {unretrievedRepairs.length > 0 && (
            <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{unretrievedRepairs.length}</span>
          )}
        </Link>
        
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4 mb-2 px-2">Gestion</div>
        
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                isActive 
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={clsx("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400")} />
              {link.name}
            </Link>
          );
        })}

        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4 mb-2 px-2">Accès client</div>
        
        {publicLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                isActive 
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={clsx("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400")} />
              {link.name}
            </a>
          );
        })}

        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4 mb-2 px-2">Configuration</div>
        
        {settingsLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                isActive 
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={clsx("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400")} />
              {link.name}
            </Link>
          );
        })}

        <div className="mt-auto pt-4">
          <Link
            href="/notifications"
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
              pathname === "/notifications"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="relative">
              <Bell className={clsx("w-5 h-5", pathname === "/notifications" ? "text-blue-600" : "text-slate-400")} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            Notifications
          </Link>
          <Link
            href="/settings"
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
              pathname === "/settings"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Settings className={clsx("w-5 h-5", pathname === "/settings" ? "text-blue-600" : "text-slate-400")} />
            Paramètres
          </Link>
        </div>
      </nav>
      
      <div className="p-6 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
            A
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Admin</div>
            <div className="text-xs text-slate-500">Atelier Principal</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {loggingOut ? "Déconnexion..." : "Déconnexion"}
        </button>
      </div>
    </aside>
  );
}
