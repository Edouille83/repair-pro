"use client";

import { useState } from "react";
import { useStore } from "../store/StoreProvider";
import { Package, Plus, Search, Edit, Trash2, TrendingUp, TrendingDown, AlertTriangle, X, Printer, Filter } from "lucide-react";

function euro(value: number) {
  return value.toFixed(2).replace(".", ",") + " €";
}

export default function PartsPage() {
  const { parts, addPart, updatePart, deletePart, updatePartStock } = useStore();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState<any>(null);
  const [quickStockId, setQuickStockId] = useState<number | null>(null);
  const [quickStockValue, setQuickStockValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formData, setFormData] = useState({
    reference: "", name: "", description: "", category: "",
    purchasePrice: "", sellingPrice: "", stock: "", minStock: "5", supplier: "", location: ""
  });

  const categories = ["all", ...new Set(parts.map(p => p.category || "").filter(c => c !== ""))];

  const filteredParts = parts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.reference.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockParts = parts.filter(p => p.isLowStock);
  const totalStock = parts.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = parts.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);
  const totalCost = parts.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
  const potentialProfit = totalValue - totalCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      reference: formData.reference,
      name: formData.name,
      description: formData.description || null,
      category: formData.category || null,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      stock: parseInt(formData.stock) || 0,
      minStock: parseInt(formData.minStock) || 5,
      supplier: formData.supplier || null,
      location: formData.location || null,
    };
    if (editingPart) {
      await updatePart(editingPart.id, data);
    } else {
      await addPart(data);
    }
    setShowForm(false);
    setEditingPart(null);
    setFormData({ reference: "", name: "", description: "", category: "", purchasePrice: "", sellingPrice: "", stock: "", minStock: "5", supplier: "", location: "" });
  };

  const handleEdit = (part: any) => {
    setEditingPart(part);
    setFormData({
      reference: part.reference, name: part.name, description: part.description || "",
      category: part.category || "", purchasePrice: part.purchasePrice.toString(),
      sellingPrice: part.sellingPrice.toString(), stock: part.stock.toString(),
      minStock: part.minStock.toString(), supplier: part.supplier || "", location: part.location || ""
    });
    setShowForm(true);
  };

  const handleStockUpdate = async (id: number, delta: number) => {
    await updatePartStock(id, delta);
  };

  const handleQuickStockSet = async (partId: number) => {
    const value = parseInt(quickStockValue);
    if (!isNaN(value) && value >= 0) {
      const part = parts.find(p => p.id === partId);
      if (part) {
        const delta = value - part.stock;
        await updatePartStock(partId, delta);
      }
    }
    setQuickStockId(null);
    setQuickStockValue("");
  };

  const printStockReport = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Inventaire - ${new Date().toLocaleDateString("fr-FR")}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
          .low { background: #fff3cd; }
          @media print { body { padding: 0; } }
        </style></head><body>
        <h1>📦 Inventaire Pièces - ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</h1>
        <table>
          <tr><th>Réf</th><th>Nom</th><th>Catégorie</th><th>Stock</th><th>Min</th><th>Prix achat</th><th>Prix vente</th></tr>
          ${filteredParts.map(p => `
            <tr class="${p.isLowStock ? 'low' : ''}">
              <td>${p.reference}</td><td>${p.name}</td><td>${p.category || '-'}</td>
              <td>${p.stock}</td><td>${p.minStock}</td>
              <td>${euro(p.purchasePrice)}</td><td>${euro(p.sellingPrice)}</td>
            </tr>
          `).join('')}
        </table>
        <p><strong>Total références:</strong> ${parts.length} | <strong>Stock total:</strong> ${totalStock} | <strong>Valeur:</strong> ${euro(totalValue)}</p>
        ${lowStockParts.length > 0 ? `<p style="color:red;"><strong>⚠ Alertes stock bas:</strong> ${lowStockParts.map(p => `${p.name} (${p.stock}/${p.minStock})`).join(', ')}</p>` : ''}
        <script>window.print();</script>
        </body></html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            Catalogue Pièces
          </h2>
          <p className="text-slate-500">{parts.length} références • {totalStock} unités en stock</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingPart(null); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-sm">
          <Plus className="w-5 h-5" />
          Nouvelle pièce
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-sm text-slate-500">Total références</div>
          <div className="text-2xl font-bold text-slate-900">{parts.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-sm text-slate-500">Stock total</div>
          <div className="text-2xl font-bold text-slate-900">{totalStock}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-sm text-slate-500">Valeur stock</div>
          <div className="text-2xl font-bold text-emerald-600">{euro(totalValue)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 text-sm text-amber-700 mb-1">
            <AlertTriangle className="w-4 h-4" />
            Stock bas
          </div>
          <div className="text-2xl font-bold text-amber-700">{lowStockParts.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-sm text-slate-500">Coût total</div>
          <div className="text-2xl font-bold text-slate-700">{euro(totalCost)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50">
          <div className="text-sm text-emerald-700">Profit potentiel</div>
          <div className="text-2xl font-bold text-emerald-700">{euro(potentialProfit)}</div>
        </div>
      </div>

      {/* Alertes stock bas */}
      {lowStockParts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-amber-800">Alertes Stock Bas ({lowStockParts.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockParts.map(p => (
              <span key={p.id} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                {p.name}: {p.stock}/{p.minStock}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stock Modal */}
      {quickStockId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Définir le stock</h3>
              <button onClick={() => setQuickStockId(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center mb-4">
              <p className="text-slate-500 mb-2">{parts.find(p => p.id === quickStockId)?.name}</p>
              <p className="text-sm text-slate-400">Stock actuel: {parts.find(p => p.id === quickStockId)?.stock}</p>
            </div>
            <div className="flex gap-3">
              <input
                type="number"
                min="0"
                placeholder="Nouveau stock"
                value={quickStockValue}
                onChange={e => setQuickStockValue(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none text-center text-xl font-bold"
                autoFocus
                onKeyDown={e => e.key === "Enter" && handleQuickStockSet(quickStockId)}
              />
              <button
                onClick={() => handleQuickStockSet(quickStockId)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{editingPart ? "Modifier la pièce" : "Nouvelle pièce"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Référence *</label>
                  <input type="text" required value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Nom *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Catégorie</label>
                  <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Fournisseur</label>
                  <input type="text" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Prix d'achat</label>
                  <input type="number" step="0.01" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Prix de vente *</label>
                  <input type="number" step="0.01" required value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Stock actuel</label>
                  <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Stock minimum</label>
                  <input type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Emplacement</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700">
                  {editingPart ? "Modifier" : "Ajouter"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingPart(null); }} className="px-6 py-2 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input type="text" placeholder="Rechercher une pièce..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none" />
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === "all" ? "Toutes catégories" : cat}</option>
            ))}
          </select>
          <button
            onClick={printStockReport}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-medium"
          >
            <Printer className="w-5 h-5" />
            <span className="hidden md:inline">Imprimer</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredParts.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Package className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p>Aucune pièce trouvée.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4">Référence</th>
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4 hidden md:table-cell">Catégorie</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4 text-right">P. achat</th>
                <th className="px-6 py-4 text-right">P. vente</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParts.map(part => (
                <tr key={part.id} className={`hover:bg-slate-50 ${part.isLowStock ? "bg-amber-50/50" : ""}`}>
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">{part.reference}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{part.name}</div>
                    {part.description && <div className="text-xs text-slate-500">{part.description}</div>}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-slate-600">{part.category || "-"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleStockUpdate(part.id, -1)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600">
                        <TrendingDown className="w-3 h-3" />
                      </button>
                      <span className={`font-bold ${part.isLowStock ? "text-amber-600" : "text-slate-900"}`}>{part.stock}</span>
                      <button onClick={() => handleStockUpdate(part.id, 1)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600">
                        <TrendingUp className="w-3 h-3" />
                      </button>
                      {part.isLowStock && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">{euro(part.purchasePrice)}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">{euro(part.sellingPrice)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleEdit(part)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deletePart(part.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
