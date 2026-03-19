"use client";

import { useState } from "react";
import { submitOnlineBookingAction } from "../actions";
import { Hammer, Smartphone, User, CheckCircle } from "lucide-react";
import { DEVICE_CATEGORIES, DEVICE_DATA } from "../lib/devices";

export default function BookPage() {
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deviceType, setDeviceType] = useState(DEVICE_CATEGORIES[0]);
  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [customBrandModel, setCustomBrandModel] = useState("");
  const [issue, setIssue] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<number | null>(null);

  const availableBrands = deviceType && deviceType !== "Autre" ? Object.keys(DEVICE_DATA[deviceType] || {}) : [];
  const availableModels = deviceBrand && deviceBrand !== "Autre" && deviceType !== "Autre" ? (DEVICE_DATA[deviceType]?.[deviceBrand] || []) : [];

  const handleDeviceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDeviceType(e.target.value);
    setDeviceBrand("");
    setDeviceModel("");
  };
  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDeviceBrand(e.target.value);
    setDeviceModel("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalDeviceType = deviceType;
    let finalBrandModel = "";
    if (deviceType === "Autre" || deviceBrand === "Autre" || deviceModel === "Autre") {
      finalBrandModel = customBrandModel.trim();
    } else {
      finalBrandModel = `${deviceBrand} ${deviceModel}`.trim();
    }

    try {
      const res = await submitOnlineBookingAction({
        clientName: clientName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        deviceType: finalDeviceType,
        brandModel: finalBrandModel,
        issue: issue.trim(),
      });
      if (res.success) {
        setSuccess(res.repairId);
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de l'enregistrement de votre demande.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-lg shadow-slate-200/50 border border-slate-100 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 leading-tight">Demande envoyée !</h1>
          <p className="text-slate-500 mb-8 leading-snug">Votre demande de prise en charge a bien été enregistrée et pré-remplie sous le numéro de dossier <strong className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded">#{success.toString().slice(-4)}</strong>.</p>
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-8">
            <p className="text-sm font-bold text-indigo-900 mb-1">Que faire maintenant ?</p>
            <p className="text-sm text-indigo-700/80 leading-snug">Vous pouvez présenter ce numéro en boutique lors du dépôt de votre appareil pour accélérer la prise en charge.</p>
          </div>
          <a href={`/dossier/${success}`} className="block w-full py-4 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-200/50 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
            Suivre mon dossier en ligne
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 mb-2">Repair Pro</h1>
          <p className="font-bold uppercase tracking-widest text-slate-500 text-xs">Demande d&apos;intervention en ligne</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-900 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
               <Hammer className="w-32 h-32" />
             </div>
             <div className="relative z-10">
               <h2 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">Décrivez votre problème</h2>
               <p className="text-blue-100/80 text-sm">Gagnez du temps en préparant votre dossier avant de passer en atelier.</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-indigo-500" /> Vos coordonnées
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Nom complet *</label>
                  <input required type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="Ex: Jean Dupont" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Téléphone *</label>
                  <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="06 12 34 56 78" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Adresse de domiciliation (Facturation)</label>
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="Ex: 10 Rue de la République, 75001 Paris" />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                <Smartphone className="w-4 h-4 text-indigo-500" /> Votre appareil
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Catégorie *</label>
                  <select
                    value={deviceType}
                    onChange={handleDeviceTypeChange}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 shadow-sm"
                  >
                    {DEVICE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {deviceType !== "Autre" && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Marque *</label>
                    <select
                      value={deviceBrand}
                      onChange={handleBrandChange}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 shadow-sm"
                      required
                    >
                      <option value="" disabled>Choisir...</option>
                      {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                )}

                {deviceType !== "Autre" && deviceBrand !== "Autre" && deviceBrand !== "" && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Modèle *</label>
                    <select
                      value={deviceModel}
                      onChange={e => setDeviceModel(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 shadow-sm"
                      required
                    >
                      <option value="" disabled>Choisir...</option>
                      {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                )}
                
                {(deviceType === "Autre" || deviceBrand === "Autre" || deviceModel === "Autre") && (
                   <div className={deviceType === "Autre" ? "sm:col-span-2" : "sm:col-span-3"}>
                     <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Précisez la marque et le modèle *</label>
                     <input
                       required
                       value={customBrandModel}
                       onChange={e => setCustomBrandModel(e.target.value)}
                       placeholder="Ex: OnePlus 9 Pro, Drone DJI..."
                       className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                     />
                   </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Défaut signalé *</label>
                <textarea required rows={4} value={issue} onChange={e => setIssue(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none shadow-sm leading-relaxed" placeholder="Décrivez le problème rencontré (ex: Écran brisé après une chute, le téléphone ne prend plus la charge...)"></textarea>
              </div>
            </div>

            <div className="pt-2">
              <button disabled={loading} type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200/50 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Générer mon dossier"}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 font-medium pb-8 w-max mx-auto px-4">Vos données personnelles sont traitées de manière sécurisée.</p>
      </div>
    </div>
  );
}
