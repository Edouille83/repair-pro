"use client";

import { useStore } from "../store/StoreProvider";
import { Users, Search, Smartphone, Phone, ChevronRight, Mail, Euro } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

function euro(value: number) {
  return value.toFixed(2).replace(".", ",") + " €";
}

export default function ClientsPage() {
  const { clients } = useStore();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "cards">("table");

  const filteredClients = clients?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            Annuaire Clients CRM
          </h2>
          <p className="text-slate-500">{clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("table")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${view === "table" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}
          >
            Tableau
          </button>
          <button
            onClick={() => setView("cards")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${view === "cards" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}
          >
            Cartes
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un client par nom, téléphone ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-slate-700"
          />
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm text-center py-16 text-slate-500">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-lg font-semibold text-slate-900">Aucun client trouvé.</p>
          <p className="text-sm">Modifiez votre recherche ou ajoutez des prises en charge.</p>
        </div>
      ) : view === "table" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4 hidden lg:table-cell">Email</th>
                  <th className="px-6 py-4 text-center">Dossiers</th>
                  <th className="px-6 py-4 text-right">Total dépensé</th>
                  <th className="px-6 py-4 text-right">Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{client.name}</div>
                      <div className="text-xs text-slate-400 font-medium">#{client.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-slate-600 font-medium hover:text-indigo-600">
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </a>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {client.email ? (
                        <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600">
                          <Mail className="w-4 h-4" />
                          {client.email}
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-indigo-700 font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                        <Smartphone className="w-4 h-4" />
                        {client.repairsCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="flex items-center justify-end gap-1 text-emerald-700 font-bold">
                        <Euro className="w-4 h-4" />
                        {euro(client.totalSpent)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-500 font-medium">
                      {client.createdAt}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/clients/${client.id}`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 inline-flex">
                        <ChevronRight className="w-5 h-5"/>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Link href={`/clients/${client.id}`} key={client.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:border-indigo-200 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-slate-400 font-medium">#{client.id}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{client.name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {client.phone}
                </div>
                {client.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {client.email}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1 text-indigo-700 font-bold">
                  <Smartphone className="w-4 h-4" />
                  {client.repairsCount} appareil{client.repairsCount > 1 ? 's' : ''}
                </div>
                <div className="text-emerald-700 font-bold">
                  {euro(client.totalSpent)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
