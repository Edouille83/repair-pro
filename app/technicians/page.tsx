"use client";

import { useState } from "react";
import { useStore } from "../store/StoreProvider";
import { UserCog, Plus, Edit, Trash2, Mail, Phone } from "lucide-react";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

export default function TechniciansPage() {
  const { technicians, addTechnician, updateTechnician, deleteTechnician, records } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingTech, setEditingTech] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", specialty: "", color: COLORS[0] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      specialty: formData.specialty || null,
      color: formData.color,
    };
    if (editingTech) {
      await updateTechnician(editingTech.id, data);
    } else {
      await addTechnician(data);
    }
    setShowForm(false);
    setEditingTech(null);
    setFormData({ name: "", email: "", phone: "", specialty: "", color: COLORS[0] });
  };

  const handleEdit = (tech: any) => {
    setEditingTech(tech);
    setFormData({
      name: tech.name,
      email: tech.email || "",
      phone: tech.phone || "",
      specialty: tech.specialty || "",
      color: tech.color,
    });
    setShowForm(true);
  };

  const activeTechs = technicians.filter(t => t.active);
  const inactiveTechs = technicians.filter(t => !t.active);

  const getTechRepairCount = (techId: number) => records.filter(r => r.technicianId === techId).length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <div className="p-2 bg-cyan-100 text-cyan-600 rounded-lg">
              <UserCog className="w-6 h-6" />
            </div>
            Techniciens
          </h2>
          <p className="text-slate-500">{activeTechs.length} technicien{activeTechs.length > 1 ? "s" : ""} actif{activeTechs.length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingTech(null); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-sm">
          <Plus className="w-5 h-5" />
          Nouveau technicien
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{editingTech ? "Modifier le technicien" : "Nouveau technicien"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Nom *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Téléphone</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Spécialité</label>
                <input type="text" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} placeholder="Ex: Smartphone, Console..." className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Couleur</label>
                <div className="flex gap-2 mt-2">
                  {COLORS.map(color => (
                    <button key={color} type="button" onClick={() => setFormData({...formData, color})} className={`w-8 h-8 rounded-full ${formData.color === color ? "ring-2 ring-offset-2 ring-slate-400" : ""}`} style={{backgroundColor: color}} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700">{editingTech ? "Modifier" : "Ajouter"}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingTech(null); }} className="px-6 py-2 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeTechs.map(tech => (
          <div key={tech.id} className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white" style={{backgroundColor: tech.color}}>
                {tech.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(tech)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><Edit className="w-4 h-4" /></button>
                <button onClick={() => deleteTechnician(tech.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">{tech.name}</h3>
            {tech.specialty && <div className="text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full inline-block mb-3">{tech.specialty}</div>}
            <div className="space-y-2 text-sm">
              {tech.email && <div className="flex items-center gap-2 text-slate-600"><Mail className="w-4 h-4 text-slate-400" />{tech.email}</div>}
              {tech.phone && <div className="flex items-center gap-2 text-slate-600"><Phone className="w-4 h-4 text-slate-400" />{tech.phone}</div>}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-sm text-slate-500">{getTechRepairCount(tech.id)} réparation{getTechRepairCount(tech.id) > 1 ? "s" : ""}</div>
            </div>
          </div>
        ))}
      </div>

      {inactiveTechs.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 opacity-50">Inactifs ({inactiveTechs.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveTechs.map(tech => (
              <div key={tech.id} className="bg-white rounded-2xl border border-slate-200 p-6 opacity-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white" style={{backgroundColor: tech.color}}>
                    {tech.name.charAt(0).toUpperCase()}
                  </div>
                  <button onClick={() => handleEdit(tech)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><Edit className="w-4 h-4" /></button>
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{tech.name}</h3>
                {tech.specialty && <div className="text-sm text-slate-500">{tech.specialty}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
