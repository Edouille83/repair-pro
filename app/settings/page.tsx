"use client";

import { useState, useEffect } from "react";
import { useStore } from "../store/StoreProvider";
import { Settings as SettingsIcon, Building, Mail, Phone, MapPin, Save, Database, Trash2, Lock, Bell, Download, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { getSetting, setSetting } = useStore();
  const [exporting, setExporting] = useState(false);
  const [settings, setSettings] = useState({
    shopName: "Repair Pro",
    shopAddress: "",
    shopCity: "",
    shopPhone: "",
    shopEmail: "",
    shopSiret: "",
    defaultWarrantyMonths: "3",
    lowStockAlert: "5",
    reminderDays: "14",
  });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [passwordMsg, setPasswordMsg] = useState<{type: "success" | "error", text: string} | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const keys = ["shopName", "shopAddress", "shopCity", "shopPhone", "shopEmail", "shopSiret", "defaultWarrantyMonths", "lowStockAlert", "reminderDays"];
      const values = await Promise.all(keys.map(k => getSetting(k)));
      setSettings({
        shopName: values[0] || "Repair Pro",
        shopAddress: values[1] || "",
        shopCity: values[2] || "",
        shopPhone: values[3] || "",
        shopEmail: values[4] || "",
        shopSiret: values[5] || "",
        defaultWarrantyMonths: values[6] || "3",
        lowStockAlert: values[7] || "5",
        reminderDays: values[8] || "14",
      });
    };
    loadSettings();
  }, [getSetting]);

  const handleSave = async () => {
    await Promise.all([
      setSetting("shopName", settings.shopName),
      setSetting("shopAddress", settings.shopAddress),
      setSetting("shopCity", settings.shopCity),
      setSetting("shopPhone", settings.shopPhone),
      setSetting("shopEmail", settings.shopEmail),
      setSetting("shopSiret", settings.shopSiret),
      setSetting("defaultWarrantyMonths", settings.defaultWarrantyMonths),
      setSetting("lowStockAlert", settings.lowStockAlert),
      setSetting("reminderDays", settings.reminderDays),
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = async () => {
    if (passwords.newPass !== passwords.confirm) {
      setPasswordMsg({ type: "error", text: "Les mots de passe ne correspondent pas" });
      return;
    }
    if (passwords.newPass.length < 6) {
      setPasswordMsg({ type: "error", text: "Le mot de passe doit contenir au moins 6 caractères" });
      return;
    }
    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
    });
    if (res.ok) {
      setPasswordMsg({ type: "success", text: "Mot de passe modifié avec succès !" });
      setPasswords({ current: "", newPass: "", confirm: "" });
    } else {
      setPasswordMsg({ type: "error", text: "Mot de passe actuel incorrect" });
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
            <SettingsIcon className="w-6 h-6" />
          </div>
          Paramètres
        </h2>
        <p className="text-slate-500">Configurez votre atelier et vos préférences.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Building className="w-5 h-5 text-slate-400" />
            Informations de l'entreprise
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Nom de l'atelier</label>
              <input type="text" value={settings.shopName} onChange={e => setSettings({...settings, shopName: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Adresse</label>
              <input type="text" value={settings.shopAddress} onChange={e => setSettings({...settings, shopAddress: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Code postal et ville</label>
                <input type="text" value={settings.shopCity} onChange={e => setSettings({...settings, shopCity: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">SIRET</label>
                <input type="text" value={settings.shopSiret} onChange={e => setSettings({...settings, shopSiret: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" placeholder="123 456 789 00012" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Téléphone</label>
                <input type="tel" value={settings.shopPhone} onChange={e => setSettings({...settings, shopPhone: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Email</label>
                <input type="email" value={settings.shopEmail} onChange={e => setSettings({...settings, shopEmail: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-400" />
            Sécurité
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Mot de passe actuel</label>
              <input type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Nouveau mot de passe</label>
                <input type="password" value={passwords.newPass} onChange={e => setPasswords({...passwords, newPass: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Confirmer</label>
                <input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
              </div>
            </div>
            {passwordMsg && (
              <div className={`p-3 rounded-lg text-sm ${passwordMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {passwordMsg.text}
              </div>
            )}
            <button onClick={handlePasswordChange} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 text-sm">
              Modifier le mot de passe
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-slate-400" />
            Préférences par défaut
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Garantie par défaut (mois)</label>
              <input type="number" value={settings.defaultWarrantyMonths} onChange={e => setSettings({...settings, defaultWarrantyMonths: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
              <p className="text-xs text-slate-500 mt-1">Durée de garantie appliquée automatiquement aux nouvelles réparations</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Alerte stock bas</label>
              <input type="number" value={settings.lowStockAlert} onChange={e => setSettings({...settings, lowStockAlert: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
              <p className="text-xs text-slate-500 mt-1">Nombre d'unités minimum avant alerte</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Rappel appareil non récupéré (jours)</label>
              <input type="number" value={settings.reminderDays} onChange={e => setSettings({...settings, reminderDays: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
              <p className="text-xs text-slate-500 mt-1">Jours après lesquels un rappel est envoyé</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-slate-400" />
            Base de données
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="text-sm font-medium text-slate-600 mb-2">Export de données</div>
              <p className="text-xs text-slate-500 mb-3">Téléchargez une sauvegarde complète de vos données au format CSV.</p>
              <button 
                onClick={async () => {
                  setExporting(true);
                  try {
                    const res = await fetch("/api/export");
                    const data = await res.json();
                    if (data.success && data.data) {
                      const timestamp = new Date().toISOString().split("T")[0];
                      for (const [name, content] of Object.entries(data.data)) {
                        const blob = new Blob([content as string], { type: "text/csv;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `repairpro_${name}_${timestamp}.csv`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      }
                    } else {
                      alert("Erreur lors de l'export: " + (data.error || "Inconnu"));
                    }
                  } catch {
                    alert("Erreur lors de l'export");
                  } finally {
                    setExporting(false);
                  }
                }} 
                disabled={exporting}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Export en cours...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Exporter les données
                  </>
                )}
              </button>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-sm font-medium text-red-600 mb-2">Zone dangereuse</div>
              <p className="text-xs text-red-500 mb-3">Cette action est irréversible. Assurez-vous d'avoir une sauvegarde.</p>
              <button onClick={() => {
                if (confirm("Êtes-vous sûr de vouloir réinitialiser la base de données ? Toutes les données seront perdues.")) {
                  alert("Pour réinitialiser : supprimez dev.db et lancez 'npx prisma db push'");
                }
              }} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 text-sm flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Réinitialiser la base
              </button>
            </div>
          </div>
        </div>

        <button onClick={handleSave} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-2">
          <Save className="w-5 h-5" />
          {saved ? "Paramètres sauvegardés !" : "Sauvegarder les paramètres"}
        </button>
      </div>
    </div>
  );
}
