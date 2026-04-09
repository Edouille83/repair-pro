"use client";

import { useState, useEffect, useMemo } from "react";
import { User, Wrench, ClipboardList, FileText, Plus, Minus, Smartphone, Mail, Trash2, CheckCircle2, Clock } from "lucide-react";
import { VEHICLE_DB, SERVICES_CAT, ServiceCategory } from "./data";

function genNum() {
  const d = new Date();
  const pad = (n: number) => (n < 10 ? "0" + n : "" + n);
  const r = Math.floor(Math.random() * 900) + 100;
  return `FAC-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${r}`;
}

function ht(t: number) {
  return Math.round((t / 1.2) * 100) / 100;
}

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " €";
}

type LibreService = { n: string; ttc: number; qty: number };

export default function AutoKeysPage() {
  const [tab, setTab] = useState(0);
  const [num, setNum] = useState("");
  const [hnum, setHnum] = useState("—");

  // State Client
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  const [nom, setNom] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [adresse, setAdresse] = useState("");

  // State Véhicule
  const [immat, setImmat] = useState("");
  const [marque, setMarque] = useState("");
  const [modele, setModele] = useState("");
  const [annee, setAnnee] = useState("");
  const [carburant, setCarburant] = useState("");
  const [couleur, setCouleur] = useState("");

  // State Services
  const [sel, setSel] = useState<Record<string, number>>({});
  const [libres, setLibres] = useState<LibreService[]>([]);
  
  // State Libre Form
  const [libreLbl, setLibreLbl] = useState("");
  const [librePrix, setLibrePrix] = useState("");
  const [libreQty, setLibreQty] = useState("1");

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    const d = new Date();
    setDate(d.toISOString().split("T")[0]);
    const hr = (d.getHours() < 10 ? "0" : "") + d.getHours();
    const min = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
    setHeure(`${hr}:${min}`);
    const n = genNum();
    setNum(n);
    setHnum(n.split("-").pop() || "—");
  }, []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  const handleImmat = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (v.length > 5) v = v.slice(0, 2) + "-" + v.slice(2, 5) + "-" + v.slice(5, 7);
    else if (v.length > 2) v = v.slice(0, 2) + "-" + v.slice(2);
    setImmat(v);
  };

  const addLibre = () => {
    const lbl = libreLbl.trim();
    const prix = parseFloat(librePrix) || 0;
    const qty = parseInt(libreQty) || 1;
    if (!lbl || prix <= 0) {
      showToast("Libellé et prix requis", false);
      return;
    }
    setLibres([...libres, { n: lbl, ttc: prix, qty }]);
    setLibreLbl("");
    setLibrePrix("");
    setLibreQty("1");
    showToast("Ajouté !");
  };

  const tog = (id: string) => {
    setSel((prev) => {
      const p = { ...prev };
      if (p[id]) delete p[id];
      else p[id] = 1;
      return p;
    });
  };

  const chg = (id: string, d: number) => {
    setSel((prev) => {
      const p = { ...prev };
      p[id] = Math.max(1, (p[id] || 1) + d);
      return p;
    });
  };

  const getItems = () => {
    const r = [];
    for (const id of Object.keys(sel)) {
      const svc = SERVICES_CAT.find((s) => s.id === id);
      if (svc) r.push({ n: svc.n, ttc: svc.ttc, qty: sel[id] });
    }
    return [...r, ...libres];
  };

  const items = getItems();
  const totalTtc = items.reduce((acc, curr) => acc + curr.ttc * curr.qty, 0);
  const sousTotalHt = ht(totalTtc);
  const tva = Math.round((totalTtc - sousTotalHt) * 100) / 100;

  const handleReset = () => {
    if (!window.confirm("Créer une nouvelle facture ?")) return;
    setSel({});
    setLibres([]);
    setNom(""); setTel(""); setEmail(""); setAdresse("");
    setImmat(""); setMarque(""); setModele(""); setAnnee(""); setCarburant(""); setCouleur("");
    setLibreLbl(""); setLibrePrix(""); setLibreQty("1");
    const n = genNum();
    setNum(n);
    setHnum(n.split("-").pop() || "—");
    setTab(0);
    showToast("Nouvelle facture !");
  };

  const corpsEmail = () => {
    const dt = date ? new Date(date).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR");
    let b = `REPARETONPHONE83\nFacture ${num} — ${dt}\n`;
    if (nom) b += `Client : ${nom}\n`;
    const veh = [marque, modele, immat].filter(Boolean).join(" ");
    if (veh) b += `Véhicule : ${veh}\n`;
    b += `\nPrestations :\n`;
    items.forEach((it) => {
      b += `- ${it.n} ×${it.qty} : ${fmt(it.ttc * it.qty)}\n`;
    });
    b += `\nTOTAL TTC : ${fmt(totalTtc)}\nMerci de votre confiance !`;
    return b;
  };

  const groupedServices = useMemo(() => {
    const groups: Record<string, ServiceCategory[]> = {};
    SERVICES_CAT.forEach(s => {
      if (!groups[s.g]) groups[s.g] = [];
      groups[s.g].push(s);
    });
    return groups;
  }, []);

  const vehString = [marque, modele, annee].filter(Boolean).join(" ");

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {toast && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 text-white px-5 py-2.5 rounded-full text-sm font-semibold z-50 shadow-lg transition-all ${toast.ok ? "bg-green-600" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-[#1a2e4a] rounded-t-2xl p-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-white font-bold text-lg md:text-xl flex items-center gap-2">
            <span className="text-yellow-400">⚡</span> Reparetonphone83
          </h1>
          <p className="text-blue-200 text-xs mt-0.5">Clé auto — Micro-soudure</p>
        </div>
        <div className="bg-white/10 text-blue-200 font-mono text-sm px-3 py-1.5 rounded-full">
          {hnum}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white shadow-sm border-b border-slate-200">
        {[
          { name: "Client", icon: User },
          { name: "Prestations", icon: Wrench },
          { name: "Récap", icon: ClipboardList },
          { name: "Facture", icon: FileText },
        ].map((t, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            className={`flex-1 py-3 text-xs md:text-sm flex flex-col items-center gap-1 border-b-2 transition-colors ${
              tab === i ? "border-blue-600 text-blue-600 font-bold bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <t.icon className="w-5 h-5 mb-0.5" />
            {t.name}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {/* Tab 0 - Client & Vehicle */}
        <div className={tab === 0 ? "block" : "hidden"}>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-base">🗓</span> Intervention
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Heure</label>
                <div className="flex gap-2">
                  <input type="time" value={heure} onChange={e => setHeure(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                  <button 
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      const hr = (d.getHours() < 10 ? "0" : "") + d.getHours();
                      const min = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
                      setHeure(`${hr}:${min}`);
                    }}
                    className="flex justify-center items-center w-10 bg-slate-100 hover:bg-blue-100 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                    title="Actualiser l'heure"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">N° Facture</label>
              <input type="text" value={num} onChange={e => setNum(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mt-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-base">👤</span> Client
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
              <input type="text" value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom Prénom" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                <input type="tel" value={tel} onChange={e => setTel(e.target.value)} placeholder="06 XX XX XX XX" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lieu d'intervention</label>
              <input type="text" value={adresse} onChange={e => setAdresse(e.target.value)} placeholder="Adresse, Ville" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mt-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-base">🚗</span> Véhicule / Appareil
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1 text-center">Immatriculation</label>
              <input type="text" value={immat} onChange={handleImmat} placeholder="AB-123-CD" maxLength={9} className="w-full bg-white border-2 border-slate-200 rounded-lg px-4 py-3 text-xl font-bold font-mono text-center text-[#1a2e4a] focus:border-blue-500 outline-none transition-all uppercase tracking-widest placeholder-slate-300" />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Marque</label>
              <select value={marque} onChange={e => { setMarque(e.target.value); setModele(""); setAnnee(""); }} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                <option value="">— Choisir une marque —</option>
                {Object.keys(VEHICLE_DB).sort().map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Modèle</label>
                <select value={modele} onChange={e => { setModele(e.target.value); setAnnee(""); }} disabled={!marque} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50">
                  <option value="">— Modèle —</option>
                  {marque && VEHICLE_DB[marque] && Object.keys(VEHICLE_DB[marque]).sort().map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Année</label>
                <select value={annee} onChange={e => setAnnee(e.target.value)} disabled={!modele} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50">
                  <option value="">— Année —</option>
                  {marque && modele && VEHICLE_DB[marque][modele] && Array.from({ length: VEHICLE_DB[marque][modele][1] - VEHICLE_DB[marque][modele][0] + 1 }, (_, i) => VEHICLE_DB[marque][modele][1] - i).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Carburant</label>
                <select value={carburant} onChange={e => setCarburant(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                  <option value="">—</option>
                  {["Essence", "Diesel", "Hybride", "Électrique", "GPL"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Couleur</label>
                <input type="text" value={couleur} onChange={e => setCouleur(e.target.value)} placeholder="Gris, Blanc..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          <button onClick={() => setTab(1)} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2">
            Choisir les prestations <span className="text-xl leading-none">→</span>
          </button>
        </div>

        {/* Tab 1 - Prestations */}
        <div className={tab === 1 ? "block" : "hidden"}>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-base">🔑</span> Catalogue Prestations
            </h2>
            
            {Object.entries(groupedServices).map(([groupName, items]) => (
              <div key={groupName} className="mb-6 last:mb-0">
                <h3 className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-3 border-b border-slate-100 pb-1.5">{groupName}</h3>
                <div className="space-y-2">
                  {items.map(item => {
                    const isOn = !!sel[item.id];
                    const qty = sel[item.id] || 1;
                    return (
                      <div key={item.id} onClick={() => tog(item.id)} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none ${isOn ? 'bg-blue-50 border-blue-400' : 'bg-slate-50 border-slate-200 hover:border-blue-300'}`}>
                        <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border text-[10px] sm:text-xs transition-colors ${isOn ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
                          {isOn && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800 truncate">{item.n}</div>
                          <div className="flex gap-2.5 mt-0.5 items-baseline">
                            <span className="text-[11px] font-mono text-slate-400">{fmt(ht(item.ttc))} HT</span>
                            <span className="text-xs font-mono font-bold text-blue-600">{fmt(item.ttc)} TTC</span>
                          </div>
                        </div>
                        {item.q && isOn && (
                          <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                            <button onClick={() => chg(item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-300 bg-white shadow-sm hover:bg-slate-100 font-bold text-slate-600">−</button>
                            <span className="font-mono text-sm w-5 text-center">{qty}</span>
                            <button onClick={() => chg(item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-300 bg-white shadow-sm hover:bg-slate-100 font-bold text-slate-600">+</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mt-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-base">✏️</span> Prestation Libre
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Libellé de l'intervention</label>
              <input type="text" value={libreLbl} onChange={e => setLibreLbl(e.target.value)} placeholder="Autre intervention..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prix TTC €</label>
                <input type="number" step="0.01" value={librePrix} onChange={e => setLibrePrix(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantité</label>
                <input type="number" min="1" value={libreQty} onChange={e => setLibreQty(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>
            <button onClick={addLibre} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
            
            {libres.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                {libres.map((l, i) => (
                  <div key={i} className="flex justify-between items-center py-2 text-sm">
                    <div>
                      <span className="font-medium text-slate-800">{l.n}</span>
                      <span className="text-slate-400 text-xs ml-2">×{l.qty}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-blue-600">{fmt(l.ttc * l.qty)}</span>
                      <button onClick={() => setLibres(libres.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sticky total */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm sticky bottom-4 z-10">
            <div className="flex justify-between text-sm text-slate-600 py-1">
              <span>Sous-total HT</span>
              <span className="font-mono">{fmt(sousTotalHt)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600 py-1">
              <span>TVA 20%</span>
              <span className="font-mono">{fmt(tva)}</span>
            </div>
            <hr className="border-blue-200 my-2" />
            <div className="flex justify-between text-lg text-[#1a2e4a] font-bold py-1">
              <span>Total TTC</span>
              <span className="font-mono text-blue-600 text-xl">{fmt(totalTtc)}</span>
            </div>
          </div>

          <button onClick={() => setTab(2)} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2">
            Voir le récapitulatif <span>→</span>
          </button>
        </div>

        {/* Tab 2 - Recap */}
        <div className={tab === 2 ? "block" : "hidden"}>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mb-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="text-base">👤</span> Client & Véhicule
            </h2>
            <div className="mb-2">
              <div className="text-base font-bold text-[#1a2e4a]">{nom || "—"}</div>
              <div className="text-sm text-slate-500 mt-1 flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5"/> {tel || "—"}</div>
              <div className="text-sm text-slate-600 mt-1 flex items-center gap-1.5"><span className="text-base leading-none">🚗</span> {vehString || "—"} {immat && `(${immat})`}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mb-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-base">🔑</span> Prestations <span className="bg-blue-600 text-white text-[10px] py-0.5 px-2 rounded-full ml-1">{items.length}</span>
            </h2>
            {items.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">Aucune prestation sélectionnée</div>
            ) : (
              <div className="space-y-3">
                {items.map((it, i) => (
                  <div key={i} className="flex justify-between items-center py-1 flex-wrap gap-y-1">
                    <div className="max-w-[70%]">
                      <div className="text-sm font-medium text-slate-800">{it.n}</div>
                      <div className="text-xs text-slate-400">×{it.qty} à {fmt(it.ttc)}</div>
                    </div>
                    <div className="font-mono text-sm font-bold text-blue-600">{fmt(it.ttc * it.qty)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between text-sm text-slate-600 py-1">
              <span>Sous-total HT</span>
              <span className="font-mono">{fmt(sousTotalHt)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600 py-1">
              <span>TVA 20%</span>
              <span className="font-mono">{fmt(tva)}</span>
            </div>
            <hr className="border-blue-200 my-2" />
            <div className="flex justify-between text-lg text-[#1a2e4a] font-bold py-1">
              <span>Total TTC</span>
              <span className="font-mono text-blue-600 text-xl">{fmt(totalTtc)}</span>
            </div>
          </div>

          <button onClick={() => setTab(3)} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2">
            Générer la facture <span>→</span>
          </button>
        </div>

        {/* Tab 3 - Facture Preview */}
        <div className={tab === 3 ? "block" : "hidden"}>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6 text-sm text-[#1a2e4a] relative overflow-hidden">
            {/* Facture Header */}
            <div className="flex flex-col sm:flex-row justify-between mb-8 gap-4">
              <div>
                <div className="font-bold text-lg mb-1 flex items-center gap-1.5"><span className="text-yellow-500">⚡</span> Reparetonphone83</div>
                <div className="text-xs text-slate-500">Intervention mobile — Toulon & Var (83)</div>
              </div>
              <div className="text-left sm:text-right font-mono text-xs text-slate-600 pt-1">
                <strong className="block text-base text-[#1a2e4a] mb-1 font-sans">FACTURE {num}</strong>
                {date ? new Date(date).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR")} {heure && `à ${heure}`}
              </div>
            </div>

            {/* Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Client</div>
                <div className="font-bold text-sm mb-1">{nom || "—"}</div>
                {tel && <div className="text-xs text-slate-600 mb-0.5">📞 {tel}</div>}
                {email && <div className="text-xs text-slate-600 mb-0.5">✉️ {email}</div>}
                {adresse && <div className="text-xs text-slate-600">📍 {adresse}</div>}
              </div>
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Véhicule</div>
                <div className="font-medium text-sm text-slate-800 mb-1">{vehString || "—"}</div>
                {immat && <div className="text-xs font-mono font-bold text-slate-600 bg-white border border-slate-200 inline-block px-1.5 py-0.5 rounded">{immat}</div>}
                {[carburant, couleur].filter(Boolean).length > 0 && <div className="text-xs text-slate-600 mt-1">{[carburant, couleur].filter(Boolean).join(" — ")}</div>}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-xs text-left min-w-[500px]">
                <thead className="bg-[#1a2e4a] text-white">
                  <tr>
                    <th className="px-3 py-2.5 font-medium rounded-tl">Prestation</th>
                    <th className="px-3 py-2.5 font-medium text-right w-16">Qté</th>
                    <th className="px-3 py-2.5 font-medium text-right w-24">HT</th>
                    <th className="px-3 py-2.5 font-medium text-right w-20">TVA</th>
                    <th className="px-3 py-2.5 font-medium text-right w-24 rounded-tr">TTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-slate-500">Aucune prestation</td>
                    </tr>
                  ) : items.map((it, i) => (
                    <tr key={i} className={i % 2 === 0 ? "" : "bg-slate-50/50"}>
                      <td className="px-3 py-2.5">{it.n}</td>
                      <td className="px-3 py-2.5 text-right font-mono">{it.qty}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-600">{fmt(ht(it.ttc))}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-600">20%</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold">{fmt(it.ttc * it.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="ml-auto w-full sm:w-64 space-y-1.5 mb-8">
              <div className="flex justify-between text-xs text-slate-600 px-3">
                <span>Sous-total HT</span>
                <span className="font-mono">{fmt(sousTotalHt)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 px-3">
                <span>TVA 20%</span>
                <span className="font-mono">{fmt(tva)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm bg-blue-50/80 p-3 rounded-lg mt-2 text-[#1a2e4a]">
                <span>Total TTC</span>
                <span className="font-mono text-blue-600 font-bold">{fmt(totalTtc)}</span>
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-5 mt-8 text-center text-[10px] text-slate-500">
              Reparetonphone83 — Toulon & Var (83) — TVA 20%<br />
              Merci pour votre confiance ✔️
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={() => {
              const phoneNumber = tel.replace(/\s/g, "");
              if (!phoneNumber) return showToast("Téléphone requis", false);
              window.open(`sms:${phoneNumber}&body=${encodeURIComponent(corpsEmail())}`, "_blank");
            }} className="w-full bg-[#27ae60] hover:bg-[#219653] text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-green-100 flex justify-center items-center gap-2">
              <Smartphone className="w-5 h-5" /> Envoyer par SMS
            </button>
            <button onClick={() => {
              if (!email) return showToast("Email requis", false);
              window.open(`mailto:${email}?subject=${encodeURIComponent(`Facture ${num} — REPARETONPHONE83`)}&body=${encodeURIComponent(corpsEmail())}`, "_blank");
            }} className="w-full bg-[#8e44ad] hover:bg-[#732d91] text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-purple-100 flex justify-center items-center gap-2">
              <Mail className="w-5 h-5" /> Envoyer par Email
            </button>
            <button onClick={handleReset} className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold py-3.5 rounded-xl transition-all mt-6">
              🗑 Nouvelle facture
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
