"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../store/StoreProvider";
import { FileSignature, Plus, Clock, Check, X, FileText, Euro, ChevronRight, Printer, Download } from "lucide-react";
import Link from "next/link";

function euro(value: number) {
  return value.toFixed(2).replace(".", ",") + " €";
}

export default function QuotesPage() {
  const router = useRouter();
  const { quotes, records, addQuote, updateQuote, deleteQuote, convertQuoteToInvoice } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ repairId: "", label: "", description: "", amount: "" });

  const pendingQuotes = quotes.filter(q => q.status === "En attente");
  const acceptedQuotes = quotes.filter(q => q.status === "Accepté");
  const refusedQuotes = quotes.filter(q => q.status === "Refusé");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addQuote({
      repairId: parseInt(formData.repairId),
      label: formData.label,
      description: formData.description || null,
      amount: parseFloat(formData.amount),
    });
    setShowForm(false);
    setFormData({ repairId: "", label: "", description: "", amount: "" });
  };

  const handleAccept = async (quoteId: number) => {
    await updateQuote(quoteId, { status: "Accepté" });
  };

  const handleRefuse = async (quoteId: number) => {
    await updateQuote(quoteId, { status: "Refusé" });
  };

  const handleConvert = async (quoteId: number) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;
    await convertQuoteToInvoice(quoteId, {
      partLabel: quote.label,
      partAmount: quote.amount,
      totalHt: quote.amount,
      totalVat: 0,
      totalTtc: quote.amount,
    });
    router.push("/invoices");
  };

  const printQuotePDF = (quote: any) => {
    const quoteNumber = `DEV-${quote.createdAt.slice(6,10)}${quote.createdAt.slice(3,5)}-${quote.id.toString().padStart(4, "0")}`;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Devis ${quoteNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; color: #1f2937; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: bold; color: #4f46e5; }
            .quote-info { text-align: right; }
            .quote-number { font-size: 20px; font-weight: bold; color: #4f46e5; }
            .quote-date { color: #6b7280; }
            .client-section { margin-bottom: 30px; }
            .section-title { font-size: 14px; color: #6b7280; margin-bottom: 10px; text-transform: uppercase; }
            .client-name { font-size: 18px; font-weight: bold; }
            .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .items-table th { background: #f3f4f6; padding: 15px; text-align: left; border-bottom: 2px solid #e5e7eb; }
            .items-table td { padding: 15px; border-bottom: 1px solid #e5e7eb; }
            .items-table .amount { text-align: right; font-weight: bold; }
            .totals { margin-left: auto; width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .total-row.final { font-size: 20px; font-weight: bold; color: #4f46e5; border: none; }
            .validity { margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px; }
            .validity-title { font-weight: bold; color: #92400e; margin-bottom: 5px; }
            .signatures { margin-top: 60px; display: flex; gap: 60px; }
            .signature-box { border-top: 2px solid #d1d5db; padding-top: 10px; width: 200px; }
            .footer { margin-top: 60px; text-align: center; color: #9ca3af; font-size: 12px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">REPAIR PRO</div>
              <div style="color: #6b7280; font-size: 14px;">Atelier de Réparation</div>
            </div>
            <div class="quote-info">
              <div class="quote-number">DEVIS N° ${quoteNumber}</div>
              <div class="quote-date">Date: ${quote.createdAt}</div>
              ${quote.validUntil ? `<div style="color: #dc2626;">Valide jusqu'au: ${quote.validUntil}</div>` : ''}
            </div>
          </div>
          
          <div class="client-section">
            <div class="section-title">Client</div>
            <div class="client-name">${quote.clientName || 'Client'}</div>
            ${quote.device ? `<div style="color: #6b7280;">Appareil: ${quote.device}</div>` : ''}
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Désignation</th>
                <th style="text-align: right;">Montant HT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${quote.label}</strong>
                  ${quote.description ? `<br><span style="color: #6b7280; font-size: 14px;">${quote.description}</span>` : ''}
                </td>
                <td class="amount">${euro(quote.amount)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <span>Total HT</span>
              <span>${euro(quote.amount)}</span>
            </div>
            <div class="total-row">
              <span>TVA (0%)</span>
              <span>0,00 €</span>
            </div>
            <div class="total-row final">
              <span>Total TTC</span>
              <span>${euro(quote.amount)}</span>
            </div>
          </div>
          
          <div class="validity">
            <div class="validity-title">Validité du devis</div>
            <div style="font-size: 14px;">Ce devis est valable 30 jours à compter de sa date d'émission. Passé ce délai, il pourra être révisé.</div>
          </div>
          
          <div class="signatures">
            <div>
              <div class="signature-box">Signature du client</div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">(précédée de la mention "Bon pour accord")</div>
            </div>
            <div>
              <div class="signature-box">Signature du vendeur</div>
            </div>
          </div>
          
          <div class="footer">
            <p>Repair Pro - Votre atelier de confiance</p>
            <p>Ce devis est un document officiel de Repair Pro</p>
          </div>
          
          <script>window.print();</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
    "En attente": { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
    "Accepté": { bg: "bg-emerald-100", text: "text-emerald-700", icon: Check },
    "Refusé": { bg: "bg-red-100", text: "text-red-700", icon: X },
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
              <FileSignature className="w-6 h-6" />
            </div>
            Devis
          </h2>
          <p className="text-slate-500">{quotes.length} devis • {pendingQuotes.length} en attente</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-sm">
          <Plus className="w-5 h-5" />
          Nouveau devis
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Nouveau devis</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Réparation *</label>
                <select required value={formData.repairId} onChange={e => setFormData({...formData, repairId: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none">
                  <option value="">Sélectionner une réparation...</option>
                  {records.filter(r => r.status !== "Terminée").map(r => (
                    <option key={r.id} value={r.id}>#{r.id} - {r.brandModel} ({r.clientName})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Intitulé *</label>
                <input type="text" required value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} placeholder="Ex: Remplacement écran" className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Montant HT (€) *</label>
                <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700">Créer le devis</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            En attente ({pendingQuotes.length})
          </h3>
          {pendingQuotes.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">Aucun devis en attente</div>
          ) : (
            <div className="grid gap-4">
              {pendingQuotes.map(quote => (
                <div key={quote.id} className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-bold text-slate-900 text-lg">{quote.label}</div>
                      <div className="text-sm text-slate-500">
                        <Link href={`/repairs?id=${quote.repairId}`} className="hover:text-indigo-600">#{quote.repairId} - {quote.clientName} - {quote.device}</Link>
                      </div>
                      {quote.description && <p className="text-sm text-slate-600 mt-2">{quote.description}</p>}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">{euro(quote.amount)}</div>
                      <div className="text-xs text-slate-500">HT</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <span className="text-sm text-slate-500">Créé le {quote.createdAt}</span>
                    <div className="flex gap-2">
                      <button onClick={() => printQuotePDF(quote)} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 flex items-center gap-2">
                        <Printer className="w-4 h-4" /> Imprimer
                      </button>
                      <button onClick={() => handleAccept(quote.id)} className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium hover:bg-emerald-200 flex items-center gap-2">
                        <Check className="w-4 h-4" /> Accepter
                      </button>
                      <button onClick={() => handleRefuse(quote.id)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 flex items-center gap-2">
                        <X className="w-4 h-4" /> Refuser
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-500" />
            Acceptés ({acceptedQuotes.length})
          </h3>
          {acceptedQuotes.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">Aucun devis accepté</div>
          ) : (
            <div className="grid gap-4">
              {acceptedQuotes.map(quote => (
                <div key={quote.id} className="bg-white rounded-xl border border-emerald-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-bold text-slate-900 text-lg">{quote.label}</div>
                      <div className="text-sm text-slate-500">#{quote.repairId} - {quote.clientName} - {quote.device}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">{euro(quote.amount)}</div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => printQuotePDF(quote)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 flex items-center justify-center gap-2">
                      <Printer className="w-4 h-4" /> Imprimer
                    </button>
                    <button onClick={() => handleConvert(quote.id)} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" /> Créer la facture
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <X className="w-5 h-5 text-red-500" />
            Refusés ({refusedQuotes.length})
          </h3>
          {refusedQuotes.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">Aucun devis refusé</div>
          ) : (
            <div className="grid gap-4">
              {refusedQuotes.map(quote => (
                <div key={quote.id} className="bg-white rounded-xl border border-red-200 p-6 opacity-60">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900">{quote.label}</div>
                      <div className="text-sm text-slate-500">#{quote.repairId} - {quote.clientName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{euro(quote.amount)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
