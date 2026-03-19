"use client";

import { useState } from "react";
import { useStore } from "../store/StoreProvider";
import { Shield, AlertTriangle, CheckCircle, Clock, Phone, Smartphone, FileText } from "lucide-react";
import Link from "next/link";

export default function WarrantiesPage() {
  const { warranties, createWarrantyClaim } = useStore();
  const [selectedWarranty, setSelectedWarranty] = useState<any>(null);
  const [claimNotes, setClaimNotes] = useState("");

  const activeWarranties = warranties.filter(w => w.status === "Active" && !w.isExpired);
  const expiredWarranties = warranties.filter(w => w.isExpired);
  const claimedWarranties = warranties.filter(w => w.claims > 0);

  const handleClaim = async () => {
    if (selectedWarranty) {
      await createWarrantyClaim(selectedWarranty.id, claimNotes);
      setSelectedWarranty(null);
      setClaimNotes("");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <Shield className="w-6 h-6" />
          </div>
          Garanties
        </h2>
        <p className="text-slate-500">{warranties.length} garantie{warranties.length > 1 ? "s" : ""} • {activeWarranties.length} active{activeWarranties.length > 1 ? "s" : ""}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Actives</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{activeWarranties.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Bientôt expirées</span>
          </div>
          <div className="text-3xl font-bold text-amber-700">{activeWarranties.filter(w => {
            const daysLeft = Math.ceil((new Date(w.warrantyEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return daysLeft <= 30 && daysLeft > 0;
          }).length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">Expirées</span>
          </div>
          <div className="text-3xl font-bold text-red-700">{expiredWarranties.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-600 mb-2">
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium">Réclamations</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{claimedWarranties.length}</div>
        </div>
      </div>

      {selectedWarranty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Déclarer une réclamation</h3>
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="font-bold text-slate-900">{selectedWarranty.device}</div>
              <div className="text-sm text-slate-500">{selectedWarranty.clientName}</div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-600">Notes de réclamation</label>
              <textarea value={claimNotes} onChange={e => setClaimNotes(e.target.value)} rows={4} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" placeholder="Décrivez le problème..." />
            </div>
            <div className="flex gap-3">
              <button onClick={handleClaim} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700">Déclarer</button>
              <button onClick={() => { setSelectedWarranty(null); setClaimNotes(""); }} className="px-6 py-2 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50">Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Garanties actives
          </h3>
          {activeWarranties.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">Aucune garantie active</div>
          ) : (
            <div className="grid gap-4">
              {activeWarranties.map(w => {
                const daysLeft = Math.ceil((new Date(w.warrantyEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysLeft <= 30;
                return (
                  <div key={w.id} className={`bg-white rounded-xl border p-6 ${isUrgent ? "border-amber-300 bg-amber-50" : "border-slate-200"}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Smartphone className="w-5 h-5 text-slate-400" />
                          <span className="font-bold text-slate-900">{w.device}</span>
                          {w.claims > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">{w.claims} réclam.{w.claims > 1 ? "s" : ""}</span>}
                        </div>
                        <div className="text-sm text-slate-500">{w.clientName} • {w.clientPhone}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${isUrgent ? "text-amber-600" : "text-emerald-600"}`}>
                          {daysLeft > 0 ? `${daysLeft} jours` : "Expire aujourd'hui"}
                        </div>
                        <div className="text-xs text-slate-500">jusqu'au {w.warrantyEnd}</div>
                      </div>
                    </div>
                    {w.terms && <div className="mt-3 text-sm text-slate-600 bg-white p-3 rounded-lg">{w.terms}</div>}
                    <button onClick={() => setSelectedWarranty(w)} className="mt-4 text-sm text-red-600 hover:underline">Déclarer une réclamation</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {expiredWarranties.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 opacity-50">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Garanties expirées
            </h3>
            <div className="grid gap-4">
              {expiredWarranties.map(w => (
                <div key={w.id} className="bg-white rounded-xl border border-slate-200 p-6 opacity-60">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Smartphone className="w-5 h-5 text-slate-400" />
                        <span className="font-bold text-slate-900">{w.device}</span>
                      </div>
                      <div className="text-sm text-slate-500">{w.clientName} • {w.clientPhone}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">Expirée</div>
                      <div className="text-xs text-slate-500">{w.warrantyEnd}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
