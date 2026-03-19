import React, { forwardRef } from "react";
import { Invoice, IntakeRecord } from "../store/StoreProvider";

type InvoicePrintProps = { 
  invoice: Invoice | null;
  repairDetails: IntakeRecord | null;
  clientInfo?: { name: string, phone: string, address?: string } | null;
  shopInfo?: { name: string; address: string; city: string; phone: string; siret: string; email: string };
};

export const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ invoice, repairDetails, clientInfo, shopInfo }, ref) => {
    const euro = (val: number) => val.toFixed(2).replace(".", ",") + " €";
    const shopName = shopInfo?.name || "Repair Pro";
    const shopAddress = shopInfo?.address || "";
    const shopCity = shopInfo?.city || "";
    const shopPhone = shopInfo?.phone || "";
    const shopSiret = shopInfo?.siret || "";
    const shopEmail = shopInfo?.email || "";

    if (!invoice || !repairDetails) return null;

    return (
      <div className="hidden print:block">
        <style type="text/css" media="print">
          {`
            @page { size: A4 portrait; margin: 0mm; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; } }
          `}
        </style>
        <div ref={ref} className="p-12 w-[210mm] h-[297mm] box-border overflow-hidden mx-auto bg-white font-sans text-slate-900 leading-normal relative">
          {/* En-tête de facture */}
          <div className="flex justify-between items-start mb-8 border-b-2 border-slate-900 pb-6">
            <div>
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 mb-2">{shopName}</h1>
              <p className="font-bold uppercase tracking-widest text-slate-500 text-sm">Atelier de Réparation Premium</p>
              <div className="mt-4 text-sm text-slate-600 font-medium">
                {shopAddress && <p>{shopAddress}</p>}
                {shopCity && <p>{shopCity}</p>}
                {shopPhone && <p>Tél : {shopPhone}</p>}
                {shopSiret && <p>SIRET : {shopSiret}</p>}
                {shopEmail && <p>{shopEmail}</p>}
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-light text-slate-400 mb-4 uppercase tracking-widest">Facture</h2>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 inline-block text-left w-64 shadow-sm">
                <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">Facturé à</p>
                <p className="font-black text-lg text-slate-900 mb-0.5">{clientInfo ? clientInfo.name : repairDetails.clientName}</p>
                { (clientInfo?.address || repairDetails.address) && (
                  <p className="text-sm text-slate-600 font-medium mb-0.5">{clientInfo?.address || repairDetails.address}</p>
                ) }
                <p className="text-sm text-slate-500 font-medium mb-4">{clientInfo ? clientInfo.phone : repairDetails.phone}</p>
                <div className="h-px bg-slate-200 my-3 w-full"></div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Facture N°</span>
                  <span className="text-sm font-bold">FAC-{invoice.createdAt.slice(6,10)}{invoice.createdAt.slice(3,5)}-{invoice.id.toString().padStart(4, "0")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Date</span>
                  <span className="text-sm font-bold">{invoice.createdAt.split(' ')[0]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Détails de l'appareil */}
          <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Concerne</h3>
            <div className="flex gap-16">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Appareil</p>
                <p className="font-bold text-base text-slate-900">{repairDetails.brandModel}</p>
                <p className="text-sm text-indigo-600 font-medium">{repairDetails.deviceType}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Défaut signalé</p>
                <p className="font-medium text-slate-700 italic">"{repairDetails.issue}"</p>
              </div>
            </div>
          </div>

          {/* Lignes de facturation */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-sm">
                <th className="py-3 px-4 text-left font-bold rounded-tl-lg tracking-wider uppercase text-xs">Désignation</th>
                <th className="py-3 px-4 text-right font-bold tracking-wider uppercase text-xs">TVA</th>
                <th className="py-3 px-4 text-right font-bold rounded-tr-lg tracking-wider uppercase text-xs">Montant HT</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-4 px-4">
                  <p className="font-bold text-slate-800 text-base">{invoice.laborLabel}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Prestation technique et temps de travail</p>
                </td>
                <td className="py-4 px-4 text-right text-slate-500 font-medium">{invoice.vatRate}%</td>
                <td className="py-4 px-4 text-right font-bold text-slate-700">{euro(invoice.laborAmount)}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-4 px-4">
                  <p className="font-bold text-slate-800 text-base">{invoice.partLabel}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Pièces détachées remplacées</p>
                </td>
                <td className="py-4 px-4 text-right text-slate-500 font-medium">{invoice.vatRate}%</td>
                <td className="py-4 px-4 text-right font-bold text-slate-700">{euro(invoice.partAmount)}</td>
              </tr>
            </tbody>
          </table>

          {/* Pied de page avec Totaux */}
          <div className="absolute bottom-10 left-12 right-12">
            <div className="flex justify-end mb-4">
              <div className="w-72">
                <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-500 font-medium">Total HT</span>
                  <span className="font-bold">{euro(invoice.totalHt)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200 text-sm">
                  <span className="text-slate-500 font-medium">TVA ({invoice.vatRate}%)</span>
                  <span className="font-bold">{euro(invoice.totalVat)}</span>
                </div>
                <div className="flex justify-between py-4 bg-slate-900 text-white rounded-xl px-5 mt-2 shadow-lg">
                  <span className="text-lg font-black uppercase">Total TTC</span>
                  <span className="text-xl font-black text-yellow-400">{euro(invoice.totalTtc)}</span>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-slate-400 pt-4 border-t-2 border-slate-900">
              <p className="mb-2 font-bold tracking-wide text-slate-600 text-sm">Merci de votre confiance ! Vos réparations sont garanties 6 mois.</p>
              <p className="opacity-75">Les factures sont payables à réception. En cas de retard de paiement, des pénalités pourront être appliquées selon les taux en vigueur.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
InvoicePrint.displayName = "InvoicePrint";
