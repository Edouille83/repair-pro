"use client";

import { useStore } from "../store/StoreProvider";
import { useState } from "react";
import { BarChart3, TrendingUp, Clock, Package, Users, DollarSign, Smartphone, Wrench, Calendar, ArrowUpRight, ArrowDownRight, Printer, Download } from "lucide-react";

function euro(value: number) {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formatDate(dateStr: string) {
  const date = parseFrenchDate(dateStr);
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function parseFrenchDate(dateStr: string): Date {
  if (!dateStr) return new Date(0);
  const parts = dateStr.split(/[\/\s:]/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const hour = parts[3] ? parseInt(parts[3], 10) : 0;
    const minute = parts[4] ? parseInt(parts[4], 10) : 0;
    return new Date(year, month, day, hour, minute);
  }
  return new Date(dateStr);
}

export default function ReportsPage() {
  const { records, invoices, payments, clients, parts, warranties } = useStore();
  const [dateRange, setDateRange] = useState<"month" | "quarter" | "year" | "all">("month");

  const now = new Date();
  const dateFilters = {
    month: new Date(now.getFullYear(), now.getMonth(), 1),
    quarter: new Date(now.getFullYear(), now.getMonth() - 3, 1),
    year: new Date(now.getFullYear(), 0, 1),
    all: new Date(0),
  };

  const filterDate = dateFilters[dateRange];

  const filteredInvoices = invoices.filter(inv => parseFrenchDate(inv.createdAt) >= filterDate);
  const filteredPayments = payments.filter(pay => {
    const invoice = invoices.find(i => i.id === pay.invoiceId);
    return invoice && parseFrenchDate(invoice.createdAt) >= filterDate;
  });
  const filteredRepairs = records.filter(r => parseFrenchDate(r.createdAt) >= filterDate);

  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.totalTtc, 0);
  const totalPaid = filteredPayments.reduce((sum, pay) => sum + pay.amount, 0);
  const pendingAmount = totalRevenue - totalPaid;

  const repairsByStatus = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const repairsByType = filteredRepairs.reduce((acc, r) => {
    acc[r.deviceType] = (acc[r.deviceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topDevices = Object.entries(repairsByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const completedRepairs = records.filter(r => r.status === "Terminée");
  const avgRepairTime = completedRepairs.length > 0
    ? Math.round(completedRepairs.reduce((sum, r) => {
        const created = parseFrenchDate(r.createdAt).getTime();
        const completed = r.completedAt ? parseFrenchDate(r.completedAt).getTime() : Date.now();
        if (isNaN(created) || isNaN(completed)) return sum;
        return sum + (completed - created);
      }, 0) / completedRepairs.length / (1000 * 60 * 60 * 24))
    : 0;

  const activeWarranties = warranties.filter(w => !w.isExpired).length;
  const lowStockParts = parts.filter(p => p.isLowStock).length;

  const monthlyRevenue = filteredInvoices.reduce((acc, inv) => {
    const date = parseFrenchDate(inv.createdAt);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    acc[month] = (acc[month] || 0) + inv.totalTtc;
    return acc;
  }, {} as Record<string, number>);

  const monthlyData = Object.entries(monthlyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);

  const maxRevenue = Math.max(...Object.values(monthlyRevenue), 1);

  const printReport = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Rapport Business - ${new Date().toLocaleDateString("fr-FR")}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          h1 { color: #1e40af; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
          .card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .card h3 { margin: 0 0 10px 0; color: #666; font-size: 12px; }
          .card p { margin: 0; font-size: 24px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
          @media print { body { padding: 0; } }
        </style></head><body>
        <h1>📊 Rapport Business Repair Pro</h1>
        <p>Généré le ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        
        <div class="grid">
          <div class="card"><h3>CA Total (TTC)</h3><p style="color:green;">${euro(totalRevenue)}</p></div>
          <div class="card"><h3>Encaissé</h3><p>${euro(totalPaid)}</p></div>
          <div class="card"><h3>En attente</h3><p style="color:orange;">${euro(pendingAmount)}</p></div>
          <div class="card"><h3>Réparations</h3><p>${records.length}</p></div>
        </div>
        
        <h2>Top Appareils</h2>
        <table>
          <tr><th>Type</th><th>Quantité</th></tr>
          ${topDevices.map(([type, count]) => `<tr><td>${type}</td><td>${count}</td></tr>`).join('')}
        </table>
        
        <h2>Réparations par Statut</h2>
        <table>
          <tr><th>Statut</th><th>Nombre</th></tr>
          ${Object.entries(repairsByStatus).map(([status, count]) => `<tr><td>${status}</td><td>${count}</td></tr>`).join('')}
        </table>
        
        <p><strong>Délai moyen de réparation:</strong> ${avgRepairTime} jours</p>
        <p><strong>Garanties actives:</strong> ${activeWarranties}</p>
        <p><strong>Pièces en stock bas:</strong> ${lowStockParts}</p>
        
        <script>window.print();</script>
        </body></html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            Rapports Business
          </h2>
          <p className="text-slate-500">Analyse détaillée de votre atelier</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value as any)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-medium"
          >
            <option value="month">Ce mois</option>
            <option value="quarter">3 derniers mois</option>
            <option value="year">Cette année</option>
            <option value="all">Tout</option>
          </select>
          <button
            onClick={printReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-sm"
          >
            <Printer className="w-5 h-5" />
            Imprimer
          </button>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-2xl text-white shadow-lg shadow-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 opacity-70" />
          </div>
          <p className="text-white/80 text-sm font-medium mb-1">Chiffre d'affaires TTC</p>
          <p className="text-3xl font-black">{euro(totalRevenue)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Encaissé</span>
          </div>
          <p className="text-slate-500 text-sm mb-1">Total Encaissé</p>
          <p className="text-2xl font-bold text-slate-900">{euro(totalPaid)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">En Attente</span>
          </div>
          <p className="text-slate-500 text-sm mb-1">Factures Impayées</p>
          <p className="text-2xl font-bold text-slate-900">{euro(pendingAmount)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
              <Wrench className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 text-sm mb-1">Réparations</p>
          <p className="text-2xl font-bold text-slate-900">{records.length}</p>
          <p className="text-xs text-slate-400 mt-1">{filteredRepairs.length} sur la période</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Graphique CA Mensuel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Chiffre d&apos;Affaires Mensuel
          </h3>
          {monthlyData.length > 0 ? (
            <div className="space-y-4">
              {monthlyData.map(([month, revenue]) => {
                const height = (revenue / maxRevenue) * 100;
                const [year, m] = month.split("-");
                const monthName = new Date(parseInt(year), parseInt(m) - 1).toLocaleDateString("fr-FR", { month: "short" });
                return (
                  <div key={month} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-600 w-12">{monthName}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-8 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                        style={{ width: `${height}%` }}
                      >
                        <span className="text-white text-xs font-bold">{euro(revenue)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-8">Aucune donnée disponible</p>
          )}
        </div>

        {/* Top Appareils */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-500" />
            Top Réparations par Type
          </h3>
          {topDevices.length > 0 ? (
            <div className="space-y-4">
              {topDevices.map(([type, count], index) => {
                const percentage = Math.round((count / records.length) * 100);
                return (
                  <div key={type} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? "bg-amber-500" : index === 1 ? "bg-slate-400" : index === 2 ? "bg-amber-700" : "bg-slate-300"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-slate-900">{type}</span>
                        <span className="text-sm text-slate-500">{count} ({percentage}%)</span>
                      </div>
                      <div className="bg-slate-100 rounded-full h-2">
                        <div 
                          className={`h-full rounded-full ${
                            index === 0 ? "bg-amber-500" : index === 1 ? "bg-slate-400" : index === 2 ? "bg-amber-700" : "bg-slate-400"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-8">Aucune donnée disponible</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Réparations par Statut */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-500" />
            État des Réparations
          </h3>
          <div className="space-y-3">
            {Object.entries(repairsByStatus).map(([status, count]) => {
              const colors: Record<string, string> = {
                "Diagnostic": "bg-blue-100 text-blue-700",
                "En cours": "bg-indigo-100 text-indigo-700",
                "Attente pièce": "bg-amber-100 text-amber-700",
                "Terminée": "bg-emerald-100 text-emerald-700",
                "Annulée": "bg-red-100 text-red-700",
              };
              return (
                <div key={status} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] || "bg-slate-100 text-slate-700"}`}>
                    {status}
                  </span>
                  <span className="font-bold text-slate-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Complémentaires */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Clients & Garanties
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm text-slate-500">Clients</p>
                <p className="text-2xl font-bold text-slate-900">{clients.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm text-slate-500">Garanties Actives</p>
                <p className="text-2xl font-bold text-emerald-600">{activeWarranties}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm text-slate-500">Stock Bas</p>
                <p className="text-2xl font-bold text-amber-600">{lowStockParts}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Délai Moyen */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Performance
          </h3>
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-4">
                <span className="text-4xl font-black text-indigo-600">{avgRepairTime || "-"}</span>
              </div>
            <p className="text-slate-600 font-medium">jours en moyenne</p>
            <p className="text-sm text-slate-400 mt-1">Délai de réparation</p>
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Réparations terminées</span>
              <span className="font-bold">{completedRepairs.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Taux de réussite</span>
              <span className="font-bold text-emerald-600">
                {records.length > 0 ? Math.round((completedRepairs.length / records.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
