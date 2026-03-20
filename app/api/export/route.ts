import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const [clients, repairs, invoices, parts, quotes, technicians, categories] = await Promise.all([
      prisma.client.findMany({
        include: { repairs: true }
      }),
      prisma.repair.findMany({
        include: { client: true }
      }),
      prisma.invoice.findMany({
        include: { repair: { include: { client: true } }, payments: true }
      }),
      prisma.part.findMany(),
      prisma.quote.findMany({
        include: { repair: { include: { client: true } } }
      }),
      prisma.technician.findMany(),
      prisma.category.findMany(),
    ]);

    const csvContent: Record<string, string> = {};

    if (clients.length > 0) {
      const headers = ["ID", "Nom", "Téléphone", "Email", "Adresse", "Nb Réparations", "Total dépensé", "Créé le"];
      const rows = clients.map(c => [
        c.id,
        `"${c.name.replace(/"/g, '""')}"`,
        c.phone,
        c.email || "",
        `"${(c.address || "").replace(/"/g, '""')}"`,
        c.repairsCount,
        c.totalSpent.toFixed(2),
        c.createdAt.toISOString()
      ].join(","));
      csvContent["clients"] = [headers.join(","), ...rows].join("\n");
    }

    if (repairs.length > 0) {
      const headers = ["ID", "N° Facture", "Client", "Téléphone", "Appareil", "Marque/Modèle", "Problème", "Diagnostic", "Solution", "Statut", "Coût estimé", "Coût final", "Créé le"];
      const rows = repairs.map(r => [
        r.id,
        r.invoiceRef,
        `"${(r.client?.name || "").replace(/"/g, '""')}"`,
        r.client?.phone || "",
        `"${r.deviceType.replace(/"/g, '""')}"`,
        `"${r.brandModel.replace(/"/g, '""')}"`,
        `"${r.issue.replace(/"/g, '""')}"`,
        `"${(r.diagnosis || "").replace(/"/g, '""')}"`,
        `"${(r.solution || "").replace(/"/g, '""')}"`,
        r.status,
        r.estimatedCost || "",
        r.finalCost || "",
        r.createdAt.toISOString()
      ].join(","));
      csvContent["repairs"] = [headers.join(","), ...rows].join("\n");
    }

    if (invoices.length > 0) {
      const headers = ["ID", "N° Facture", "Client", "Appareil", "Montant HT", "TVA", "Montant TTC", "Payé", "Restant", "Date"];
      const rows = invoices.map(i => {
        const paid = i.payments.reduce((sum, p) => sum + p.amount, 0);
        return [
          i.id,
          i.repair.invoiceRef,
          `"${(i.repair.client?.name || "").replace(/"/g, '""')}"`,
          `"${(i.repair.deviceType + " " + i.repair.brandModel).replace(/"/g, '""')}"`,
          i.totalHt.toFixed(2),
          i.totalVat.toFixed(2),
          i.totalTtc.toFixed(2),
          paid.toFixed(2),
          (i.totalTtc - paid).toFixed(2),
          i.createdAt.toISOString()
        ].join(",");
      });
      csvContent["invoices"] = [headers.join(","), ...rows].join("\n");
    }

    if (parts.length > 0) {
      const headers = ["ID", "Référence", "Nom", "Catégorie", "Prix achat", "Prix vente", "Stock", "Seuil min", "Fournisseur", "Emplacement"];
      const rows = parts.map(p => [
        p.id,
        p.reference,
        `"${p.name.replace(/"/g, '""')}"`,
        p.category || "",
        p.purchasePrice.toFixed(2),
        p.sellingPrice.toFixed(2),
        p.stock,
        p.minStock,
        p.supplier || "",
        p.location || ""
      ].join(","));
      csvContent["parts"] = [headers.join(","), ...rows].join("\n");
    }

    if (quotes.length > 0) {
      const headers = ["ID", "Client", "Appareil", "Description", "Montant", "Statut", "Valide jusqu'au", "Créé le"];
      const rows = quotes.map(q => [
        q.id,
        `"${(q.repair.client?.name || "").replace(/"/g, '""')}"`,
        `"${(q.repair.deviceType + " " + q.repair.brandModel).replace(/"/g, '""')}"`,
        `"${(q.description || "").replace(/"/g, '""')}"`,
        q.amount.toFixed(2),
        q.status,
        q.validUntil?.toISOString() || "",
        q.createdAt.toISOString()
      ].join(","));
      csvContent["quotes"] = [headers.join(","), ...rows].join("\n");
    }

    if (technicians.length > 0) {
      const headers = ["ID", "Nom", "Email", "Téléphone", "Spécialité", "Couleur", "Actif"];
      const rows = technicians.map(t => [
        t.id,
        `"${t.name.replace(/"/g, '""')}"`,
        t.email || "",
        t.phone || "",
        t.specialty || "",
        t.color,
        t.active ? "Oui" : "Non"
      ].join(","));
      csvContent["technicians"] = [headers.join(","), ...rows].join("\n");
    }

    if (categories.length > 0) {
      const headers = ["ID", "Nom", "Icône", "Couleur"];
      const rows = categories.map(c => [
        c.id,
        c.name,
        c.icon || "",
        c.color || ""
      ].join(","));
      csvContent["categories"] = [headers.join(","), ...rows].join("\n");
    }

    return NextResponse.json({
      success: true,
      data: csvContent,
      exportedAt: new Date().toISOString(),
      counts: {
        clients: clients.length,
        repairs: repairs.length,
        invoices: invoices.length,
        parts: parts.length,
        quotes: quotes.length,
        technicians: technicians.length,
        categories: categories.length,
      }
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'export" },
      { status: 500 }
    );
  }
}
