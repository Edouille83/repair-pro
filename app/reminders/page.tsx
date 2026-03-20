"use client";

import { useStore } from "../store/StoreProvider";
import { useState, useEffect } from "react";
import { Bell, Clock, CheckCircle, AlertCircle, Send, Settings, Calendar, Smartphone, User } from "lucide-react";
import { detectGender } from "../lib/gender";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { 
    day: "2-digit", 
    month: "short", 
    year: "numeric" 
  });
}

function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export default function RemindersPage() {
  const { records, sendNotification, markReminderSent, getSetting } = useStore();
  const [autoReminders, setAutoReminders] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; subtext?: string }>({ show: false, message: "" });
  const [shopName, setShopName] = useState("Repair Pro");
  const [shopPhone, setShopPhone] = useState("");
  
  useEffect(() => {
    const loadShopInfo = async () => {
      const name = await getSetting("shopName");
      const phone = await getSetting("shopPhone");
      if (name) setShopName(name);
      if (phone) setShopPhone(phone);
    };
    loadShopInfo();
  }, [getSetting]);

  const completedNotRetrieved = records.filter(r => 
    r.status === "Terminée" && !r.retrievedAt
  );

  const waitingOver7Days = completedNotRetrieved.filter(r => 
    r.completedAt && daysSince(r.completedAt) >= 7
  );

  const waitingOver14Days = completedNotRetrieved.filter(r => 
    r.completedAt && daysSince(r.completedAt) >= 14
  );

  const waitingOver30Days = completedNotRetrieved.filter(r => 
    r.completedAt && daysSince(r.completedAt) >= 30
  );

  const inProgressOver14Days = records.filter(r => 
    r.status === "En cours" && daysSince(r.createdAt) >= 14
  );

  const sendBulkReminder = async (repairs: typeof records) => {
    const notYetReminded = repairs.filter(r => !r.reminderSent);
    
    if (notYetReminded.length === 0) {
      setToast({
        show: true,
        message: "Aucun rappel à envoyer",
        subtext: "Tous les appareils ont déjà été notifiés ou récupérés."
      });
      setTimeout(() => setToast({ show: false, message: "" }), 3000);
      return;
    }
    
    for (const repair of notYetReminded) {
      await handleSendReminder(repair.id);
    }
  };

  const handleSendReminder = async (repairId: number) => {
    const repair = records.find(r => r.id === repairId);
    if (!repair) return;

    const firstName = repair.clientName.split(" ")[0];
    
    await sendNotification(repairId, "email");
    
    setToast({
      show: true,
      message: `Rappel envoyé à ${firstName}`,
      subtext: `Votre ${repair.deviceType} est prêt à être récupéré.`
    });
    
    await markReminderSent(repairId);
    setTimeout(() => setToast({ show: false, message: "" }), 4000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <Bell className="w-6 h-6" />
            </div>
            Rappels & Alertes
          </h2>
          <p className="text-slate-500">Gestion des rappels clients et alertes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl">
            <div className={`w-3 h-3 rounded-full ${autoReminders ? "bg-emerald-500" : "bg-slate-300"}`} />
            <span className="text-sm font-medium">
              {autoReminders ? "Auto-activé" : "Désactivé"}
            </span>
          </div>
          <button 
            onClick={() => setAutoReminders(!autoReminders)}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 rounded-2xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-3xl font-black">{completedNotRetrieved.length}</span>
          </div>
          <p className="text-white/80 font-medium">Appareils terminés non récupérés</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-red-600">{waitingOver7Days.length}</span>
          </div>
          <p className="text-sm text-slate-600">En attente +7 jours</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-orange-600">{waitingOver14Days.length}</span>
          </div>
          <p className="text-sm text-slate-600">En attente +14 jours</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-indigo-600">{inProgressOver14Days.length}</span>
          </div>
          <p className="text-sm text-slate-600">En cours +14 jours</p>
        </div>
      </div>

      {/* Appareils terminés non récupérés */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Appareils terminés - En attente de récupération
            </h3>
            {completedNotRetrieved.length > 0 && (
              <button
                onClick={() => sendBulkReminder(completedNotRetrieved)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Envoyer à tous
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {completedNotRetrieved.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-300" />
              <p className="text-lg font-medium">Tous les appareils ont été récupérés !</p>
            </div>
          ) : (
            completedNotRetrieved.map(repair => {
              const days = repair.completedAt ? daysSince(repair.completedAt) : 0;
              const urgency = days >= 30 ? "urgent" : days >= 14 ? "warning" : "normal";
              
              return (
                <div key={repair.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        urgency === "urgent" ? "bg-red-100 text-red-600" :
                        urgency === "warning" ? "bg-orange-100 text-orange-600" :
                        "bg-emerald-100 text-emerald-600"
                      }`}>
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-slate-900">{repair.brandModel}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            urgency === "urgent" ? "bg-red-100 text-red-700" :
                            urgency === "warning" ? "bg-orange-100 text-orange-700" :
                            "bg-emerald-100 text-emerald-700"
                          }`}>
                            {days}j d&apos;attente
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <User className="w-4 h-4" />
                          <span>{repair.clientName}</span>
                        </div>
                        {repair.completedAt && (
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>Terminé le {formatDate(repair.completedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendReminder(repair.id)}
                      className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 ${
                        urgency === "urgent" 
                          ? "bg-red-600 text-white hover:bg-red-700" :
                        urgency === "warning"
                          ? "bg-orange-500 text-white hover:bg-orange-600" :
                          "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      Rappel
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Réparations en cours depuis longtemps */}
      {inProgressOver14Days.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-500" />
              Réparations en cours depuis +14 jours
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {inProgressOver14Days.map(repair => (
              <div key={repair.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-slate-900">{repair.brandModel}</h4>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                          {daysSince(repair.createdAt)}j
                        </span>
                      </div>
                      <div className="text-sm text-slate-500">
                        {repair.clientName}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        Problème: {repair.issue.substring(0, 60)}...
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendReminder(repair.id)}
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-medium hover:bg-indigo-200 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Informer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-6 rounded-2xl shadow-2xl shadow-amber-500/30 min-w-[400px] text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">Rappel envoyé</span>
            </div>
            <p className="text-white/90 text-lg font-semibold mb-1">{toast.message}</p>
            <p className="text-white/80 text-sm mb-4">{toast.subtext}</p>
            <div className="border-t border-white/20 pt-3 mt-2">
              <p className="text-white font-bold">{shopName}</p>
              <p className="text-white/70 text-sm">{shopPhone}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Wrench(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
}
