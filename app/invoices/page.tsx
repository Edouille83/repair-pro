"use client";

import { useState, useEffect } from "react";
import { useStore, Invoice } from "../store/StoreProvider";
import { ReceiptText, FileText, Search, PlusCircle, Printer } from "lucide-react";
import { useRef, useState as useReactState } from "react";
import { useReactToPrint } from "react-to-print";
import { InvoicePrint } from "../components/InvoicePrint";

export default function InvoicesPage() {
  const { records, invoices, addInvoice, getInvoicePaidTotal, getSetting } = useStore();
  const [repairId, setRepairId] = useReactState("");
  const [laborLabel, setLaborLabel] = useReactState("Main d'œuvre");
  const [laborAmount, setLaborAmount] = useReactState("");
  const [partLabel, setPartLabel] = useReactState("Pièce");
  const [partAmount, setPartAmount] = useReactState("");
  const [vatRate, setVatRate] = useReactState("20");
  const [error, setError] = useReactState("");
  const [shopInfo, setShopInfo] = useState({ name: "Repair Pro", address: "", city: "", phone: "", siret: "", email: "" });
  
  const [printingInvoice, setPrintingInvoice] = useReactState<Invoice | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadShopInfo = async () => {
      const [name, address, city, phone, siret, email] = await Promise.all([
        getSetting("shopName"),
        getSetting("shopAddress"),
        getSetting("shopCity"),
        getSetting("shopPhone"),
        getSetting("shopSiret"),
        getSetting("shopEmail"),
      ]);
      setShopInfo({
        name: name || "Repair Pro",
        address: address || "",
        city: city || "",
        phone: phone || "",
        siret: siret || "",
        email: email || "",
      });
    };
    loadShopInfo();
  }, [getSetting]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const totalHt = (Number(laborAmount) || 0) + (Number(partAmount) || 0);
  const totalVat = totalHt * ((Number(vatRate) || 0) / 100);
  const totalTtc = totalHt + totalVat;

  function euro(val: number) {
    return val.toFixed(2).replace(".", ",") + " €";
  }

  function handleCreateInvoice() {
    if (!repairId) return setError("Choisis une réparation.");
    if (totalHt <= 0) return setError("Le total HT doit être supérieur à 0.");

    const invoice: Invoice = {
      id: Date.now(),
      repairId: Number(repairId),
      laborLabel: laborLabel.trim() || "Main d'œuvre",
      laborAmount: Number(laborAmount) || 0,
      partLabel: partLabel.trim() || "Pièce",
      partAmount: Number(partAmount) || 0,
      vatRate: Number(vatRate) || 0,
      totalHt,
      totalVat,
      totalTtc,
      createdAt: new Date().toLocaleString("fr-FR"),
    };

    addInvoice(invoice);
    setRepairId("");
    setLaborAmount("");
    setPartAmount("");
    setError("");
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <ReceiptText className="w-6 h-6" />
          </div>
          Facturation
        </h2>
        <p className="text-slate-500">Créer et gérer les factures liées aux réparations terminées ou en cours.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* CREATE INVOICE FORM */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-500" />
            Éditer une facture
          </h3>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Réparation liée</label>
              <select
                value={repairId}
                onChange={(e) => setRepairId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all appearance-none bg-slate-50"
              >
                <option value="">Sélectionner une réparation...</option>
                {records.map((r) => (
                  <option key={r.id} value={r.id}>{r.clientName} — {r.brandModel}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Libellé Main d'œuvre</label>
                <input value={laborLabel} onChange={e => setLaborLabel(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 transition-all font-medium text-sm text-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Montant HT</label>
                <div className="relative">
                  <input type="number" value={laborAmount} onChange={e => setLaborAmount(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 transition-all text-sm font-bold text-slate-900" />
                  <span className="absolute right-3 top-2 text-slate-400 font-medium">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Libellé Pièce</label>
                <input value={partLabel} onChange={e => setPartLabel(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 transition-all font-medium text-sm text-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Montant HT</label>
                <div className="relative">
                  <input type="number" value={partAmount} onChange={e => setPartAmount(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 transition-all text-sm font-bold text-slate-900" />
                  <span className="absolute right-3 top-2 text-slate-400 font-medium">€</span>
                </div>
              </div>
              
              <div className="col-span-2">
                 <label className="block text-sm font-medium text-slate-600 mb-1">Taux de TVA (%)</label>
                 <input type="number" value={vatRate} onChange={e => setVatRate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 transition-all text-sm" />
              </div>
            </div>

            <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 flex flex-col gap-2">
              <div className="flex justify-between text-emerald-800 text-sm">
                <span>Total HT</span>
                <span className="font-bold">{euro(totalHt)}</span>
              </div>
              <div className="flex justify-between text-emerald-800 text-sm">
                <span>TVA ({vatRate}%)</span>
                <span>{euro(totalVat)}</span>
              </div>
              <div className="h-px bg-emerald-200 my-1"></div>
              <div className="flex justify-between text-emerald-900 text-lg font-bold">
                <span>Total TTC</span>
                <span>{euro(totalTtc)}</span>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}

            <button onClick={handleCreateInvoice} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg shadow-emerald-200 flex justify-center items-center gap-2">
              <FileText className="w-5 h-5" />
              Générer la facture
            </button>
          </div>
        </div>

        {/* INVOICES LIST */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-400" />
            Archive des factures
          </h3>

          {invoices.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p>Oups, aucune facture trouvée.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {invoices.map((inv) => {
                const rep = records.find(r => r.id === inv.repairId);
                const paid = getInvoicePaidTotal(inv.id);
                const isPaid = paid >= inv.totalTtc;
                const isPartial = paid > 0 && paid < inv.totalTtc;

                return (
                  <div key={inv.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-bold text-slate-900 text-lg">FAC-{inv.createdAt.slice(6,10)}{inv.createdAt.slice(3,5)}-{inv.id.toString().padStart(4, "0")}</div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isPaid ? "bg-emerald-100 text-emerald-700" : isPartial ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                      }`}>
                        {isPaid ? "Soldée" : isPartial ? "Partiel" : "Impayée"}
                      </span>
                    </div>

                    <div className="text-sm text-slate-600 mb-4">
                      {rep ? <span className="font-medium text-slate-800">{rep.clientName} — {rep.brandModel}</span> : "Appareil supprimé"}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm bg-white p-3 rounded-lg border border-slate-100">
                      <div>
                        <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Montant TTC</div>
                        <div className="font-bold text-slate-900">{euro(inv.totalTtc)}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Déjà payé</div>
                        <div className={`font-bold ${paid > 0 ? "text-emerald-600" : "text-slate-500"}`}>{euro(paid)}</div>
                      </div>
                      <div className="flex justify-end items-center">
                        <button
                          onClick={() => { setPrintingInvoice(inv); setTimeout(handlePrint, 100); }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-2"
                          title="Générer PDF Facture"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          PDF
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="hidden">
        <InvoicePrint 
          ref={printRef} 
          invoice={printingInvoice} 
          repairDetails={records.find(r => r.id === printingInvoice?.repairId) || null}
          shopInfo={shopInfo}
          autoPrint={!!printingInvoice}
        />
      </div>
    </div>
  );
}
