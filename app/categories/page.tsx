"use client";

import { useState } from "react";
import { useStore } from "../store/StoreProvider";
import { Tags, Plus, Edit, Trash2, Smartphone, Laptop, Watch, Gamepad2, Tablet } from "lucide-react";

const ICONS: Record<string, any> = {
  smartphone: Smartphone, laptop: Laptop, watch: Watch, tablet: Tablet, gamepad: Gamepad2
};

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", icon: "smartphone", color: COLORS[0] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCat) {
      await updateCategory(editingCat.id, formData);
    } else {
      await addCategory(formData);
    }
    setShowForm(false);
    setEditingCat(null);
    setFormData({ name: "", icon: "smartphone", color: COLORS[0] });
  };

  const handleEdit = (cat: any) => {
    setEditingCat(cat);
    setFormData({ name: cat.name, icon: cat.icon || "smartphone", color: cat.color || COLORS[0] });
    setShowForm(true);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
              <Tags className="w-6 h-6" />
            </div>
            Catégories d'appareils
          </h2>
          <p className="text-slate-500">{categories.length} catégorie{categories.length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingCat(null); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-sm">
          <Plus className="w-5 h-5" />
          Nouvelle catégorie
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{editingCat ? "Modifier la catégorie" : "Nouvelle catégorie"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Nom *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Icône</label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {Object.entries(ICONS).map(([key, Icon]) => (
                    <button key={key} type="button" onClick={() => setFormData({...formData, icon: key})} className={`p-3 rounded-lg ${formData.icon === key ? "bg-indigo-100 ring-2 ring-indigo-400" : "bg-slate-100"}`}>
                      <Icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
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
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700">{editingCat ? "Modifier" : "Ajouter"}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingCat(null); }} className="px-6 py-2 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Tags className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Aucune catégorie. Créez-en une pour organiser vos appareils.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(cat => {
            const Icon = ICONS[cat.icon || "smartphone"] || Smartphone;
            return (
              <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{backgroundColor: cat.color ? `${cat.color}20` : "#3B82F620"}}>
                    <Icon className="w-6 h-6" style={{color: cat.color || "#3B82F6"}} />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(cat)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => deleteCategory(cat.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900">{cat.name}</h3>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
