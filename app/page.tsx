"use client";

import { useStore } from "./store/StoreProvider";
import { Users, Wrench, ReceiptText, Banknote, Clock, CheckCircle, Wallet, AlertCircle, TrendingUp, Package, Shield, Bell, ChevronRight } from "lucide-react";
import Link from "next/link";

function euro(value: number) {
  return value.toFixed(2).replace(".", ",") + " €";
}

function formatMonth(month: string) {
  const [year, m] = month.split("-");
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  return `${months[parseInt(m) - 1]} ${year}`;
}

function Card({ title, value, icon: Icon, colorClass, subtext }: { title: string; value: string | number; icon: any; colorClass: string; subtext?: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="text-slate-500 text-sm font-medium mb-1">{title}</div>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          {subtext && <div className="text-xs text-slate-400 mt-1">{subtext}</div>}
        </div>
      </div>
    </div>
  );
}

function MiniChart({ data, color }: { data: { month: string; count?: number; total?: number }[]; color: string }) {
  if (!data || data.length === 0) return <div className="h-16 flex items-end gap-1">
    {[1,2,3,4,5,6].map(i => <div key={i} className="flex-1 bg-slate-100 rounded-t" style={{height: '20%'}}/>)}
  </div>;
  const max = Math.max(...data.map(d => d.count || d.total || 0));
  return (
    <div className="h-16 flex items-end gap-1">
      {data.slice(-6).map((d, i) => (
        <div key={i} className="flex-1 rounded-t" style={{ 
          height: `${max > 0 ? ((d.count || d.total || 0) / max) * 100 : 20}%`,
          backgroundColor: color 
        }}/>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { stats, invoices, records, payments, technicians, parts, quotes, unretrievedRepairs, getInvoicePaidTotal } = useStore();

  const totalFactured = invoices.reduce((sum, inv) => sum + inv.totalTtc, 0);
  const totalPaid = payments.reduce((sum, pay) => sum + pay.amount, 0);
  const remaining = totalFactured - totalPaid;
  const pendingQuotes = quotes.filter(q => q.status === "En attente").length;
  const lowStockCount = parts.filter(p => p.isLowStock).length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Tableau de bord</h2>
          <p className="text-slate-500">Vue globale de l'atelier, de la facturation et des règlements.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const headers = ["Date", "N° Facture", "Client", "Montant HT", "TVA", "Montant TTC"].join(";");
              const rows = invoices.map(inv => {
                const numeroFacture = `FAC-${inv.createdAt.slice(6,10)}${inv.createdAt.slice(3,5)}-${inv.id.toString().padStart(4, "0")}`;
                return [inv.createdAt.split(' ')[0], numeroFacture, `"${inv.clientName || ''}"`, inv.totalHt, inv.totalVat, inv.totalTtc].join(";");
              });
              const blob = new Blob([[headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `Export_RepairPro_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '')}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2"
          >
            Exporter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card title="CA Total" value={euro(stats.totalRevenue)} icon={TrendingUp} colorClass="bg-emerald-50 text-emerald-600" subtext={`${invoices.length} factures`}/>
        <Card title="Réparations" value={stats.totalRepairs} icon={Wrench} colorClass="bg-indigo-50 text-indigo-600" subtext={`${stats.totalClients} clients`}/>
        <Card title="En attente" value={pendingQuotes} icon={ReceiptText} colorClass="bg-amber-50 text-amber-600" subtext="devis en attente"/>
        <Card title="Stock bas" value={lowStockCount} icon={Package} colorClass="bg-red-50 text-red-600" subtext="pièces à commander"/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card title="En diagnostic" value={stats.repairsByStatus["Diagnostic"] || 0} icon={AlertCircle} colorClass="bg-slate-50 text-slate-600"/>
        <Card title="En cours" value={stats.repairsByStatus["En cours"] || 0} icon={Clock} colorClass="bg-blue-50 text-blue-600"/>
        <Card title="Attente pièce" value={stats.repairsByStatus["Attente pièce"] || 0} icon={Package} colorClass="bg-amber-50 text-amber-600"/>
        <Card title="Terminées" value={stats.repairsByStatus["Terminée"] || 0} icon={CheckCircle} colorClass="bg-emerald-50 text-emerald-600"/>
        <Card title="Reste à encaisser" value={euro(remaining)} icon={Wallet} colorClass="bg-rose-50 text-rose-600"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Réparations / mois</h3>
          <MiniChart data={stats.repairsByMonth} color="#6366f1"/>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">CA / mois</h3>
          <MiniChart data={stats.revenueByMonth} color="#10b981"/>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Garanties</h3>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">{stats.activeWarranties}</div>
              <div className="text-sm text-slate-500">Actives</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">{stats.expiredWarranties}</div>
              <div className="text-sm text-slate-500">Expirées</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-600">{stats.activeWarranties + stats.expiredWarranties}</div>
              <div className="text-sm text-slate-500">Total</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {unretrievedRepairs.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Appareils en attente
              </h3>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                {unretrievedRepairs.length}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {unretrievedRepairs.slice(0, 5).map((repair) => (
                <div key={repair.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                  <div>
                    <div className="font-semibold text-slate-900">{repair.brandModel}</div>
                    <div className="text-sm text-slate-500">{repair.clientName} • {repair.daysWaiting}j</div>
                  </div>
                  <Link href={`/repairs?id=${repair.id}`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                    <ChevronRight className="w-5 h-5"/>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Dernières factures</h3>
            <Link href="/invoices" className="text-sm text-blue-600 hover:underline">Voir tout</Link>
          </div>
          {invoices.length === 0 ? (
            <div className="p-6 text-center text-slate-500">Aucune facture pour le moment.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {invoices.slice(0, 5).map((invoice) => {
                const paidTotal = getInvoicePaidTotal(invoice.id);
                const isPaid = paidTotal >= invoice.totalTtc;
                const isPartial = paidTotal > 0 && paidTotal < invoice.totalTtc;

                return (
                  <div key={invoice.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                    <div>
                      <div className="font-semibold text-slate-900">#{invoice.id} — {invoice.clientName}</div>
                      <div className="text-sm text-slate-500">{invoice.createdAt}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{euro(invoice.totalTtc)}</div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isPaid ? "bg-emerald-100 text-emerald-700" : isPartial ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                      }`}>
                        {isPaid ? "Soldée" : isPartial ? "Partiel" : "Impayée"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {stats.topDevices.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Appareils les plus réparés</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.topDevices.slice(0, 5).map((device, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-slate-50">
                <div className="text-2xl font-bold text-slate-900">{device.count}</div>
                <div className="text-sm text-slate-600">{device.brandModel || device.deviceType}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
