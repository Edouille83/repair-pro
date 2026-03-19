"use client";

import { useState, useEffect } from "react";
import { Search, Smartphone, CheckCircle, Clock, AlertCircle, Package, Wrench, FileText, Sparkles } from "lucide-react";
import Link from "next/link";

const statusIcons: Record<string, any> = {
  "Diagnostic": AlertCircle,
  "En cours": Wrench,
  "Attente pièce": Package,
  "Terminée": CheckCircle,
};

const statusColors: Record<string, string> = {
  "Diagnostic": "bg-slate-100 text-slate-700",
  "En cours": "bg-blue-100 text-blue-700",
  "Attente pièce": "bg-amber-100 text-amber-700",
  "Terminée": "bg-emerald-100 text-emerald-700",
};

const statusSteps = ["Diagnostic", "En cours", "Attente pièce", "Terminée"];

export default function SuiviPage() {
  const [searchType, setSearchType] = useState<"invoice" | "phone">("invoice");
  const [searchValue, setSearchValue] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setSearchType("invoice");
      setSearchValue(ref);
      const form = document.querySelector("form");
      if (form) {
        setTimeout(() => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })), 100);
      }
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchType, searchValue }),
      });
      
      const data = await response.json();
      
      if (!data.success || !data.repair) {
        setError(data.message || "Aucune réparation trouvée. Vérifiez votre numéro de facture.");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = (status: string) => statusSteps.indexOf(status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-5 shadow-xl shadow-indigo-200">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Suivi de réparation</h1>
          <p className="text-slate-600">Entrez votre numéro de facture pour suivre l&apos;avancement de votre réparation</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100 p-6 mb-6 border border-indigo-100">
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => { setSearchType("invoice"); setResult(null); setError(""); }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                searchType === "invoice" 
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FileText className="w-5 h-5" />
              N° Facture
            </button>
            <button
              onClick={() => { setSearchType("phone"); setResult(null); setError(""); }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                searchType === "phone" 
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Smartphone className="w-5 h-5" />
              Téléphone
            </button>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <input
                type={searchType === "invoice" ? "text" : "tel"}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={searchType === "invoice" ? "Ex: RP-2024-00001" : "Ex: 0612345678"}
                className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none text-lg font-medium transition-all"
                required
              />
              {searchType === "invoice" && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <div className="w-6 h-6 rounded-full border-3 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <Search className="w-6 h-6" />
                  Rechercher
                </>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-5 text-red-700 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-bold">{error}</span>
            </div>
            <p className="text-sm text-red-500">Votre numéro commence par RP-2024-XXXXX</p>
          </div>
        )}

        {result && result.repair && (
          <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100 overflow-hidden border border-indigo-100">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="text-center">
                <p className="text-white/70 text-sm font-medium mb-1">Numéro de facture</p>
                <div className="text-4xl font-black mb-2">{result.repair.invoiceRef}</div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-sm font-semibold">
                  {(() => {
                    const Icon = statusIcons[result.repair.status] || Clock;
                    return <Icon className="w-4 h-4" />;
                  })()}
                  {result.repair.status}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-5 mb-6 border border-indigo-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{result.repair.brandModel}</h3>
                    <p className="text-slate-500">{result.repair.deviceType}</p>
                  </div>
                </div>
                <div className="text-sm text-slate-600 bg-white/60 rounded-xl p-3">
                  <span className="font-semibold">Problème : </span>{result.repair.issue}
                </div>
              </div>

              {result.repair.diagnosis && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 mb-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-bold text-blue-700">Diagnostic</span>
                  </div>
                  <p className="text-slate-700">{result.repair.diagnosis}</p>
                </div>
              )}

              {result.repair.solution && (
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 mb-4 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-bold text-emerald-700">Solution appliquée</span>
                  </div>
                  <p className="text-slate-700">{result.repair.solution}</p>
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-slate-500 pt-4 border-t border-slate-100">
                <span>Déposé le {result.repair.createdAt}</span>
                {result.repair.completedAt && <span className="text-emerald-600 font-semibold">Terminé le {result.repair.completedAt}</span>}
              </div>

              {result.repair.status === "Terminée" && (
                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl text-white text-center">
                  <p className="font-bold text-lg mb-1">✨ Votre appareil est prêt !</p>
                  <p className="text-white/80 text-sm">Vous pouvez passer le récupérer à l&apos;atelier.</p>
                </div>
              )}

              {result.repair.status === "En cours" && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-white text-center">
                  <p className="font-bold text-lg mb-1">🔧 Réparation en cours</p>
                  <p className="text-white/80 text-sm">Nous vous tiendrons informé de l&apos;avancement.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
            <span>←</span> Retour à l&apos;atelier
          </Link>
        </div>
      </div>
    </div>
  );
}
