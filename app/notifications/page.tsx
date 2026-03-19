"use client";

import { useEffect } from "react";
import { useStore } from "../store/StoreProvider";
import { Bell, Check, CheckCheck, Wrench, Smartphone, AlertTriangle, Info } from "lucide-react";
import Link from "next/link";

const typeIcons: Record<string, any> = {
  new_repair: Wrench,
  repair_complete: Smartphone,
  warranty_expiring: AlertTriangle,
  payment: AlertTriangle,
  default: Info,
};

const typeColors: Record<string, string> = {
  new_repair: "bg-blue-100 text-blue-600",
  repair_complete: "bg-emerald-100 text-emerald-600",
  warranty_expiring: "bg-amber-100 text-amber-600",
  payment: "bg-violet-100 text-violet-600",
  default: "bg-slate-100 text-slate-600",
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, refreshNotifications } = useStore();

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
              <Bell className="w-6 h-6" />
            </div>
            Notifications
          </h2>
          <p className="text-slate-500">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllNotificationsRead} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-sm">
            <CheckCheck className="w-5 h-5" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Bell className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg">Aucune notification</p>
          <p className="text-sm text-slate-400 mt-2">Les notifications apparaîtront ici</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || Info;
            const colorClass = typeColors[notif.type] || typeColors.default;
            return (
              <div key={notif.id} className={`p-6 border-b border-slate-100 last:border-b-0 flex gap-4 items-start hover:bg-slate-50 transition-colors ${!notif.read ? "bg-blue-50/30" : ""}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold text-slate-900">{notif.title}</div>
                      <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-slate-400">{notif.createdAt}</span>
                      {!notif.read && (
                        <button onClick={() => markNotificationRead(notif.id)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400" title="Marquer comme lu">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {notif.repairId && (
                    <Link href={`/repairs?id=${notif.repairId}`} className="text-sm text-indigo-600 hover:underline mt-2 inline-block">
                      Voir la réparation →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
