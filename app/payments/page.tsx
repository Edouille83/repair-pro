"use client";

import { useState } from "react";
import { useStore, PaymentMethod, Payment } from "../store/StoreProvider";
import { Banknote, CreditCard, AlertCircle } from "lucide-react";

export default function PaymentsPage() {
  const { invoices, records, payments, addPayment, getInvoicePaidTotal } = useStore();
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Carte");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const selectedInvoice = invoices.find(inv => inv.id === Number(invoiceId));
  const alreadyPaid = selectedInvoice ? getInvoicePaidTotal(selectedInvoice.id) : 0;
  const remaining = selectedInvoice ? selectedInvoice.totalTtc - alreadyPaid : 0;

  function euro(val: number) {
    return val.toFixed(2).replace(".", ",") + " €";
  }

  function handleCreatePayment() {
    if (!invoiceId) return setError("Veuillez choisir une facture à régler.");
    const numAmount = Number(amount) || 0;
    if (numAmount <= 0) return setError("Le montant saisi doit être valide.");
    if (selectedInvoice && numAmount > remaining) return setError("Le montant dépasse le reste à payer !");

    const payment: Payment = {
      id: Date.now(),
      invoiceId: Number(invoiceId),
      amount: numAmount,
      method,
      note: note.trim(),
      createdAt: new Date().toLocaleString("fr-FR"),
    };

    addPayment(payment);
    setInvoiceId("");
    setAmount("");
    setNote("");
    setError("");
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
            <CreditCard className="w-6 h-6" />
          </div>
          Encaissements
        </h2>
        <p className="text-slate-500">Saisissez ici les paiements reçus par vos clients (acomptes ou soldes).</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* NEW PAYMENT FORM */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-amber-500" />
            Nouveau paiement
          </h3>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Facture concernée</label>
              <select
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all appearance-none bg-slate-50 font-medium"
              >
                <option value="">Sélectionner une facture en attente...</option>
                {invoices.map((inv) => {
                  const rep = records.find(r => r.id === inv.repairId);
                  const paidTotal = getInvoicePaidTotal(inv.id);
                  if (paidTotal >= inv.totalTtc) return null; // Only show unpaid invoices
                  return (
                    <option key={inv.id} value={inv.id}>
                      FAC-{inv.createdAt.slice(6,10)}{inv.createdAt.slice(3,5)}-{inv.id.toString().padStart(4, "0")} — {rep ? rep.clientName : "Client inconnu"} (Reste: {euro(inv.totalTtc - paidTotal)})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Montant à encaisser</label>
                <div className="relative">
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`${remaining > 0 ? remaining : 0}`} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 transition-all text-base font-bold text-slate-900" />
                  <span className="absolute right-3 top-3 text-slate-400 font-medium">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Moyen de paiement</label>
                <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 outline-none transition-all bg-white font-medium text-slate-700">
                  <option value="Carte">Carte Bancaire</option>
                  <option value="Espèces">Espèces</option>
                  <option value="Virement">Virement</option>
                  <option value="PayPal">PayPal / En ligne</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Note / Observation</label>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Ex: Acompte 30%, réglé par le mari..." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 transition-all text-sm font-medium" />
            </div>

            {selectedInvoice && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex justify-between items-center text-amber-900">
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider opacity-70 mb-1">Reste à payer calculé</div>
                  <div className="font-bold text-xl">{euro(remaining)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase font-bold tracking-wider opacity-70 mb-1">Facture totale</div>
                  <div className="font-medium text-sm">{euro(selectedInvoice.totalTtc)}</div>
                </div>
              </div>
            )}

            {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}

            <button onClick={handleCreatePayment} className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg shadow-amber-200 flex justify-center items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Valider l'encaissement
            </button>
          </div>
        </div>

        {/* RECENT PAYMENTS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-slate-400" />
            Historique des encaissements
          </h3>

          {payments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Banknote className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p>Aucun paiement n'a été enregistré.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {payments.map((pay) => {
                const inv = invoices.find(i => i.id === pay.invoiceId);
                const rep = inv ? records.find(r => r.id === inv.repairId) : null;

                return (
                  <div key={pay.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-amber-600 text-base">+{euro(pay.amount)}</div>
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white border border-slate-200 text-slate-600">
                        {pay.method}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-slate-900 mb-1">
                      FAC-{inv ? `${inv.createdAt.slice(6,10)}${inv.createdAt.slice(3,5)}-${inv.id.toString().padStart(4, "0")}` : `? (${pay.invoiceId})`}
                    </div>

                    <div className="text-xs text-slate-500 mb-3">
                      Client: {rep ? rep.clientName : "Inconnu"}
                    </div>

                    <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-3">
                      {pay.note ? (
                        <div className="text-slate-500 italic flex-1 truncate pr-4">"{pay.note}"</div>
                      ) : (
                        <div className="flex-1"></div>
                      )}
                      <div className="text-slate-400 font-medium whitespace-nowrap">{pay.createdAt}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
