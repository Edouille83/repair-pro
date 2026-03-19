"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore, ClientDetails } from "../../store/StoreProvider";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Smartphone, Wrench, Euro, FileText, Shield, Edit, ChevronRight, CheckCircle, Clock, AlertCircle, Package } from "lucide-react";
import Link from "next/link";

function euro(value: number) {
  return value.toFixed(2).replace(".", ",") + " €";
}

const statusColors: Record<string, string> = {
  "Diagnostic": "bg-slate-100 text-slate-700",
  "En cours": "bg-blue-100 text-blue-700",
  "Attente pièce": "bg-amber-100 text-amber-700",
  "Terminée": "bg-emerald-100 text-emerald-700",
  "Annulée": "bg-red-100 text-red-700",
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getClientDetails, updateClient } = useStore();
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "", notes: "" });

  useEffect(() => {
    const loadClient = async () => {
      const data = await getClientDetails(Number(params.id));
      setClient(data);
      if (data) {
        setFormData({
          name: data.name,
          phone: data.phone,
          email: data.email || "",
          address: data.address || "",
          notes: data.notes || "",
        });
      }
    };
    loadClient();
  }, [params.id, getClientDetails]);

  const handleSave = async () => {
    await updateClient(Number(params.id), formData);
    const data = await getClientDetails(Number(params.id));
    setClient(data);
    setEditing(false);
  };

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
      </div>
    );
  }

  const totalSpent = client.repairs.reduce((sum, r) => {
    const repairInvoices = (r as any).invoices || [];
    return sum + repairInvoices.reduce((s: number, i: any) => s + i.totalTtc, 0);
  }, 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-5 h-5" />
        Retour aux clients
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <button onClick={() => setEditing(!editing)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                <Edit className="w-5 h-5" />
              </button>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Nom</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Adresse</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700">
                    Sauvegarder
                  </button>
                  <button onClick={() => setEditing(false)} className="px-4 py-2 border border-slate-200 rounded-lg font-medium hover:bg-slate-50">
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{client.name}</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <a href={`tel:${client.phone}`} className="hover:text-indigo-600">{client.phone}</a>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <a href={`mailto:${client.email}`} className="hover:text-indigo-600">{client.email}</a>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <MapPin className="w-5 h-5 text-slate-400" />
                      {client.address}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-slate-500 text-sm">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    Client depuis le {client.createdAt}
                  </div>
                </div>

                {client.notes && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm font-medium text-slate-600 mb-1">Notes</div>
                    <p className="text-sm text-slate-700">{client.notes}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-6">
            <h3 className="font-bold text-slate-900 mb-4">Statistiques</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Réparations</span>
                <span className="font-bold text-slate-900">{client.repairsCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total dépensé</span>
                <span className="font-bold text-emerald-600">{euro(client.totalSpent)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Historique des réparations</h3>
            </div>
            {client.repairs.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Smartphone className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <p>Aucune réparation pour ce client.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {client.repairs.map((repair: any) => {
                  const repairTotal = (repair.invoices || []).reduce((s: number, i: any) => s + i.totalTtc, 0);
                  return (
                    <div key={repair.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <Link href={`/repairs?id=${repair.id}`} className="font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-2">
                            <Smartphone className="w-5 h-5" />
                            {repair.brandModel}
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                          <p className="text-sm text-slate-500 mt-1">{repair.deviceType} • {repair.issue}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[repair.status] || "bg-slate-100"}`}>
                          {repair.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {repair.createdAt}
                        </span>
                        {repair.technicianName && (
                          <span className="flex items-center gap-1">
                            <Wrench className="w-4 h-4" />
                            {repair.technicianName}
                          </span>
                        )}
                        {repairTotal > 0 && (
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                            <Euro className="w-4 h-4" />
                            {euro(repairTotal)}
                          </span>
                        )}
                      </div>
                      {repair.warranty && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                          <Shield className="w-4 h-4" />
                          Garantie jusqu'au {repair.warranty.warrantyEnd}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
