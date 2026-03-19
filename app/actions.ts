"use server";

import { PrismaClient } from "@prisma/client";
import { sendSMS } from "./lib/sms";
import { sendEmail, formatRepairStatusEmail } from "./lib/email";
import { onlineBookingSchema } from "./lib/validation";

const prisma = new PrismaClient();

// --- REPAIRS ---
export async function getRepairsAction() {
  const repairs = await prisma.repair.findMany({
    include: { client: true, technician: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return repairs.map((r: any) => ({
    id: r.id,
    clientId: r.clientId,
    clientName: r.client.name,
    phone: r.client.phone,
    email: r.client.email,
    address: r.client.address,
    deviceType: r.deviceType,
    brandModel: r.brandModel,
    serialNumber: r.serialNumber,
    issue: r.issue,
    diagnosis: r.diagnosis,
    solution: r.solution,
    status: r.status as any,
    priority: r.priority,
    technicianId: r.technicianId,
    technicianName: r.technician?.name,
    categoryId: r.categoryId,
    categoryName: r.category?.name,
    estimatedCost: r.estimatedCost,
    finalCost: r.finalCost,
    warrantyMonths: r.warrantyMonths,
    createdAt: r.createdAt.toLocaleString("fr-FR"),
    completedAt: r.completedAt?.toLocaleString("fr-FR"),
    retrievedAt: r.retrievedAt?.toLocaleString("fr-FR"),
    reminderSent: r.reminderSent,
    conditionReport: r.conditionReport,
  }));
}

export async function createRepairAction(data: {
  clientName: string;
  phone: string;
  email?: string;
  address?: string;
  deviceType: string;
  brandModel: string;
  serialNumber?: string;
  issue: string;
  diagnosis?: string;
  solution?: string;
  priority?: string;
  estimatedCost?: number;
  warrantyMonths?: number;
  technicianId?: number;
  categoryId?: number;
  conditionReport?: string;
  preChecklist?: string;
  photos?: string;
  signature?: string;
}) {
  let client = await prisma.client.findFirst({ where: { phone: data.phone } });
  if (!client) {
    client = await prisma.client.create({
      data: { name: data.clientName, phone: data.phone, email: data.email || null, address: data.address || null },
    });
  } else {
    if (data.address && !client.address) {
      client = await prisma.client.update({
        where: { id: client.id },
        data: { address: data.address, email: data.email || client.email }
      });
    }
    await prisma.client.update({
      where: { id: client.id },
      data: { repairsCount: { increment: 1 } }
    });
  }

  const repair = await prisma.repair.create({
    data: {
      clientId: client.id,
      deviceType: data.deviceType,
      brandModel: data.brandModel,
      serialNumber: data.serialNumber || null,
      issue: data.issue,
      status: "Diagnostic",
      priority: data.priority || "Normale",
      technicianId: data.technicianId || null,
      categoryId: data.categoryId || null,
      preChecklist: data.preChecklist || null,
      photos: data.photos || null,
      signature: data.signature || null,
      estimatedCost: data.estimatedCost || null,
      conditionReport: data.conditionReport || null,
    },
    include: { client: true, technician: true, category: true },
  });

  const year = new Date().getFullYear();
  const count = await prisma.repair.count();
  const invoiceRef = `RP-${year}-${String(count).padStart(5, "0")}`;

  const updatedRepair = await prisma.repair.update({
    where: { id: repair.id },
    data: { invoiceRef },
    include: { client: true, technician: true, category: true },
  });

  return {
    id: updatedRepair.id,
    invoiceRef: updatedRepair.invoiceRef,
    clientId: updatedRepair.clientId,
    clientName: updatedRepair.client.name,
    phone: updatedRepair.client.phone,
    email: updatedRepair.client.email,
    address: updatedRepair.client.address,
    deviceType: updatedRepair.deviceType,
    brandModel: updatedRepair.brandModel,
    serialNumber: updatedRepair.serialNumber,
    issue: updatedRepair.issue,
    diagnosis: updatedRepair.diagnosis,
    solution: updatedRepair.solution,
    status: updatedRepair.status as any,
    priority: updatedRepair.priority,
    technicianId: updatedRepair.technicianId,
    technicianName: updatedRepair.technician?.name,
    categoryId: updatedRepair.categoryId,
    categoryName: updatedRepair.category?.name,
    estimatedCost: updatedRepair.estimatedCost,
    finalCost: updatedRepair.finalCost,
    warrantyMonths: updatedRepair.warrantyMonths,
    preChecklist: updatedRepair.preChecklist,
    photos: updatedRepair.photos,
    signature: updatedRepair.signature,
    conditionReport: updatedRepair.conditionReport,
    reminderSent: updatedRepair.reminderSent,
    completedAt: updatedRepair.completedAt?.toLocaleString("fr-FR"),
    retrievedAt: updatedRepair.retrievedAt?.toLocaleString("fr-FR"),
    createdAt: updatedRepair.createdAt.toLocaleString("fr-FR"),
  };
}

export async function updateRepairAction(id: number, data: any) {
  const repair = await prisma.repair.update({
    where: { id },
    data: {
      ...data,
      completedAt: data.status === "Terminée" && data.completedAt === undefined ? new Date() : data.completedAt,
    },
    include: { client: true, technician: true, category: true },
  });

  if (data.status === "Terminée" && repair.warrantyMonths > 0) {
    const warrantyEnd = new Date();
    warrantyEnd.setMonth(warrantyEnd.getMonth() + repair.warrantyMonths);
    await prisma.warranty.upsert({
      where: { repairId: id },
      create: { repairId: id, warrantyEnd },
      update: { warrantyEnd, status: "Active", claims: 0 },
    });
  }

  return {
    id: repair.id,
    clientId: repair.clientId,
    clientName: repair.client.name,
    phone: repair.client.phone,
    deviceType: repair.deviceType,
    brandModel: repair.brandModel,
    status: repair.status as any,
    priority: repair.priority,
    technicianId: repair.technicianId,
    technicianName: repair.technician?.name,
    createdAt: repair.createdAt.toLocaleString("fr-FR"),
  };
}

export async function updateRepairStatusAction(id: number, status: string) {
  const data: any = { status };
  if (status === "Terminée") {
    data.completedAt = new Date();
  }
  await prisma.repair.update({
    where: { id },
    data,
  });
  return { success: true };
}

// --- TECHNICIANS ---
export async function getTechniciansAction() {
  const technicians = await prisma.technician.findMany({
    orderBy: { name: "asc" },
  });
  return technicians;
}

export async function createTechnicianAction(data: any) {
  const technician = await prisma.technician.create({ data });
  return {
    id: technician.id,
    name: technician.name,
    email: technician.email,
    phone: technician.phone,
    specialty: technician.specialty,
    color: technician.color,
    active: technician.active,
  };
}

export async function updateTechnicianAction(id: number, data: any) {
  const technician = await prisma.technician.update({ where: { id }, data });
  return {
    id: technician.id,
    name: technician.name,
    email: technician.email,
    phone: technician.phone,
    specialty: technician.specialty,
    color: technician.color,
    active: technician.active,
  };
}

export async function deleteTechnicianAction(id: number) {
  await prisma.technician.delete({ where: { id } });
  return { success: true };
}

// --- CATEGORIES ---
export async function getCategoriesAction() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return categories;
}

export async function createCategoryAction(data: any) {
  const category = await prisma.category.create({ data });
  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    color: category.color,
  };
}

export async function updateCategoryAction(id: number, data: any) {
  const category = await prisma.category.update({ where: { id }, data });
  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    color: category.color,
  };
}

export async function deleteCategoryAction(id: number) {
  await prisma.category.delete({ where: { id } });
  return { success: true };
}

// --- QUOTES ---
export async function getQuotesAction() {
  const quotes = await prisma.quote.findMany({
    include: { repair: { include: { client: true } } },
    orderBy: { createdAt: "desc" },
  });
  return quotes.map((q: any) => ({
    ...q,
    createdAt: q.createdAt.toLocaleString("fr-FR"),
    validUntil: q.validUntil?.toLocaleString("fr-FR"),
    clientName: q.repair.client.name,
    device: `${q.repair.brandModel}`,
  }));
}

export async function createQuoteAction(data: any) {
  const quote = await prisma.quote.create({ data });
  return {
    id: quote.id,
    repairId: quote.repairId,
    label: quote.label,
    description: quote.description,
    amount: quote.amount,
    status: quote.status,
    validUntil: quote.validUntil,
    createdAt: quote.createdAt.toLocaleString("fr-FR"),
  };
}

export async function updateQuoteAction(id: number, data: any) {
  const quote = await prisma.quote.update({ where: { id }, data });
  return {
    id: quote.id,
    repairId: quote.repairId,
    label: quote.label,
    description: quote.description,
    amount: quote.amount,
    status: quote.status,
    validUntil: quote.validUntil,
    createdAt: quote.createdAt.toLocaleString("fr-FR"),
  };
}

export async function deleteQuoteAction(id: number) {
  await prisma.quote.delete({ where: { id } });
  return { success: true };
}

export async function convertQuoteToInvoiceAction(quoteId: number, invoiceData: any) {
  const quote = await prisma.quote.findUnique({ where: { id: quoteId } });
  if (!quote) throw new Error("Quote not found");

  await prisma.quote.update({ where: { id: quoteId }, data: { status: "Accepté" } });

  const invoice = await prisma.invoice.create({
    data: {
      repairId: quote.repairId,
      laborLabel: invoiceData.laborLabel || "Main d'œuvre",
      laborAmount: invoiceData.laborAmount || 0,
      partLabel: invoiceData.partLabel || quote.label,
      partAmount: invoiceData.partAmount || quote.amount,
      vatRate: invoiceData.vatRate || 0,
      totalHt: invoiceData.totalHt || quote.amount,
      totalVat: invoiceData.totalVat || 0,
      totalTtc: invoiceData.totalTtc || quote.amount,
    },
  });
  return {
    id: invoice.id,
    repairId: invoice.repairId,
    laborLabel: invoice.laborLabel,
    laborAmount: invoice.laborAmount,
    partLabel: invoice.partLabel,
    partAmount: invoice.partAmount,
    vatRate: invoice.vatRate,
    totalHt: invoice.totalHt,
    totalVat: invoice.totalVat,
    totalTtc: invoice.totalTtc,
    notes: invoice.notes,
    createdAt: invoice.createdAt.toLocaleString("fr-FR"),
  };
}

// --- PARTS ---
export async function getPartsAction() {
  const parts = await prisma.part.findMany({ orderBy: { name: "asc" } });
  return parts.map((p: any) => ({
    id: p.id,
    reference: p.reference,
    name: p.name,
    description: p.description,
    category: p.category,
    purchasePrice: p.purchasePrice,
    sellingPrice: p.sellingPrice,
    stock: p.stock,
    minStock: p.minStock,
    supplier: p.supplier,
    location: p.location,
    isLowStock: p.stock <= p.minStock,
  }));
}

export async function createPartAction(data: any) {
  const part = await prisma.part.create({ data });
  return {
    id: part.id,
    reference: part.reference,
    name: part.name,
    description: part.description,
    category: part.category,
    purchasePrice: part.purchasePrice,
    sellingPrice: part.sellingPrice,
    stock: part.stock,
    minStock: part.minStock,
    supplier: part.supplier,
    location: part.location,
    isLowStock: part.stock <= part.minStock,
  };
}

export async function updatePartAction(id: number, data: any) {
  const part = await prisma.part.update({ where: { id }, data });
  return {
    id: part.id,
    reference: part.reference,
    name: part.name,
    description: part.description,
    category: part.category,
    purchasePrice: part.purchasePrice,
    sellingPrice: part.sellingPrice,
    stock: part.stock,
    minStock: part.minStock,
    supplier: part.supplier,
    location: part.location,
    isLowStock: part.stock <= part.minStock,
  };
}

export async function deletePartAction(id: number) {
  await prisma.part.delete({ where: { id } });
  return { success: true };
}

export async function updatePartStockAction(id: number, quantity: number) {
  const part = await prisma.part.update({
    where: { id },
    data: { stock: { increment: quantity } },
  });
  return {
    id: part.id,
    reference: part.reference,
    name: part.name,
    description: part.description,
    category: part.category,
    purchasePrice: part.purchasePrice,
    sellingPrice: part.sellingPrice,
    stock: part.stock,
    minStock: part.minStock,
    supplier: part.supplier,
    location: part.location,
    isLowStock: part.stock <= part.minStock,
  };
}

// --- INVOICES ---
export async function getInvoicesAction() {
  const invoices = await prisma.invoice.findMany({
    include: { repair: { include: { client: true } } },
    orderBy: { createdAt: "desc" },
  });
  return invoices.map((i: any) => ({
    ...i,
    createdAt: i.createdAt.toLocaleString("fr-FR"),
    clientName: i.repair.client.name,
    clientPhone: i.repair.client.phone,
  }));
}

export async function createInvoiceAction(data: any) {
  const invoice = await prisma.invoice.create({
    data: {
      repairId: data.repairId,
      laborLabel: data.laborLabel,
      laborAmount: data.laborAmount,
      partLabel: data.partLabel,
      partAmount: data.partAmount,
      vatRate: data.vatRate,
      totalHt: data.totalHt,
      totalVat: data.totalVat,
      totalTtc: data.totalTtc,
      notes: data.notes,
    },
    include: { repair: { include: { client: true } } },
  });

  if (data.finalCost !== undefined) {
    await prisma.repair.update({
      where: { id: data.repairId },
      data: { finalCost: data.finalCost }
    });
  }

  await prisma.client.update({
    where: { id: invoice.repair.clientId },
    data: { totalSpent: { increment: data.totalTtc } }
  });

  return {
    id: invoice.id,
    repairId: invoice.repairId,
    laborLabel: invoice.laborLabel,
    laborAmount: invoice.laborAmount,
    partLabel: invoice.partLabel,
    partAmount: invoice.partAmount,
    vatRate: invoice.vatRate,
    totalHt: invoice.totalHt,
    totalVat: invoice.totalVat,
    totalTtc: invoice.totalTtc,
    notes: invoice.notes,
    createdAt: invoice.createdAt.toLocaleString("fr-FR"),
    clientName: invoice.repair.client.name,
    clientPhone: invoice.repair.client.phone,
  };
}

export async function updateInvoiceAction(id: number, data: any) {
  const invoice = await prisma.invoice.update({ where: { id }, data });
  return {
    id: invoice.id,
    repairId: invoice.repairId,
    laborLabel: invoice.laborLabel,
    laborAmount: invoice.laborAmount,
    partLabel: invoice.partLabel,
    partAmount: invoice.partAmount,
    vatRate: invoice.vatRate,
    totalHt: invoice.totalHt,
    totalVat: invoice.totalVat,
    totalTtc: invoice.totalTtc,
    notes: invoice.notes,
    createdAt: invoice.createdAt.toLocaleString("fr-FR"),
  };
}

export async function deleteInvoiceAction(id: number) {
  await prisma.invoice.delete({ where: { id } });
  return { success: true };
}

// --- PAYMENTS ---
export async function getPaymentsAction() {
  const payments = await prisma.payment.findMany({
    include: { invoice: true },
    orderBy: { createdAt: "desc" },
  });
  return payments.map((p: any) => ({
    ...p,
    method: p.method as any,
    note: p.note || "",
    createdAt: p.createdAt.toLocaleString("fr-FR"),
  }));
}

export async function createPaymentAction(data: any) {
  const payment = await prisma.payment.create({
    data: {
      invoiceId: data.invoiceId,
      amount: data.amount,
      method: data.method,
      note: data.note,
    },
  });
  return {
    id: payment.id,
    invoiceId: payment.invoiceId,
    amount: payment.amount,
    method: payment.method as any,
    note: payment.note || "",
    createdAt: payment.createdAt.toLocaleString("fr-FR"),
  };
}

export async function deletePaymentAction(id: number) {
  await prisma.payment.delete({ where: { id } });
  return { success: true };
}

// --- WARRANTIES ---
export async function getWarrantiesAction() {
  const warranties = await prisma.warranty.findMany({
    include: { repair: { include: { client: true } } },
    orderBy: { warrantyEnd: "asc" },
  });
  return warranties.map((w: any) => ({
    ...w,
    warrantyEnd: w.warrantyEnd.toLocaleString("fr-FR"),
    createdAt: w.createdAt.toLocaleString("fr-FR"),
    isExpired: w.warrantyEnd < new Date(),
    clientName: w.repair.client.name,
    clientPhone: w.repair.client.phone,
    device: w.repair.brandModel,
    repairId: w.repairId,
  }));
}

export async function createWarrantyClaimAction(id: number, notes: string) {
  const warranty = await prisma.warranty.update({
    where: { id },
    data: { claims: { increment: 1 }, notes },
  });
  return {
    id: warranty.id,
    repairId: warranty.repairId,
    warrantyEnd: warranty.warrantyEnd.toLocaleString("fr-FR"),
    terms: warranty.terms,
    status: warranty.status,
    claims: warranty.claims,
    notes: warranty.notes,
    createdAt: warranty.createdAt.toLocaleString("fr-FR"),
  };
}

// --- NOTIFICATIONS ---
export async function getNotificationsAction() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return notifications.map((n: any) => ({
    ...n,
    createdAt: n.createdAt.toLocaleString("fr-FR"),
    sentAt: n.sentAt?.toLocaleString("fr-FR"),
  }));
}

export async function createNotificationAction(data: any) {
  const notification = await prisma.notification.create({ data });
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    repairId: notification.repairId,
    clientId: notification.clientId,
    read: notification.read,
    sentAt: notification.sentAt?.toLocaleString("fr-FR"),
    createdAt: notification.createdAt.toLocaleString("fr-FR"),
  };
}

export async function markNotificationReadAction(id: number) {
  await prisma.notification.update({ where: { id }, data: { read: true } });
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  await prisma.notification.updateMany({ where: { read: false }, data: { read: true } });
  return { success: true };
}

export async function getUnreadNotificationsCountAction() {
  const count = await prisma.notification.count({ where: { read: false } });
  return count;
}

// --- CLIENTS CRM ---
export async function getClientsAction() {
  const clients = await prisma.client.findMany({
    include: { repairs: { include: { invoices: true } } },
    orderBy: { createdAt: "desc" },
  });
  return clients.map((c: any) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email || "",
    address: c.address || "",
    notes: c.notes || "",
    repairsCount: c.repairs.length,
    totalSpent: c.totalSpent,
    createdAt: c.createdAt.toLocaleString("fr-FR"),
  }));
}

export async function getClientDetailsAction(id: number) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      repairs: {
        include: {
          technician: true,
          category: true,
          invoices: { include: { payments: true } },
          warranty: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!client) return null;
  
  return {
    ...client,
    createdAt: client.createdAt.toLocaleString("fr-FR"),
    repairs: client.repairs.map((r: any) => ({
      ...r,
      createdAt: r.createdAt.toLocaleString("fr-FR"),
      completedAt: r.completedAt?.toLocaleString("fr-FR"),
      retrievedAt: r.retrievedAt?.toLocaleString("fr-FR"),
      invoices: r.invoices.map((i: any) => ({
        ...i,
        createdAt: i.createdAt.toLocaleString("fr-FR"),
      })),
      warranty: r.warranty ? {
        ...r.warranty,
        warrantyEnd: r.warranty.warrantyEnd.toLocaleString("fr-FR"),
        createdAt: r.warranty.createdAt.toLocaleString("fr-FR"),
      } : null,
    })),
  };
}

export async function updateClientAction(id: number, data: any) {
  const client = await prisma.client.update({ where: { id }, data });
  return {
    id: client.id,
    name: client.name,
    phone: client.phone,
    email: client.email,
    address: client.address,
    notes: client.notes,
  };
}

// --- STATS & ANALYTICS ---
export async function getStatsAction() {
  const [
    totalClients,
    totalRepairs,
    totalInvoices,
    totalPayments,
    repairsByStatus,
    repairsByMonth,
    revenueByMonth,
    topDevices,
    lowStockParts,
    activeWarranties,
    expiredWarranties,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.repair.count(),
    prisma.invoice.count(),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.repair.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.$queryRaw<{month: string; count: bigint}[]>`
      SELECT TO_CHAR(createdAt, 'YYYY-MM') as month, COUNT(*)::bigint as count 
      FROM "Repair" 
      GROUP BY month 
      ORDER BY month DESC 
      LIMIT 12
    `,
    prisma.$queryRaw<{month: string; total: number}[]>`
      SELECT TO_CHAR(createdAt, 'YYYY-MM') as month, SUM("totalTtc")::float as total 
      FROM "Invoice" 
      GROUP BY month 
      ORDER BY month DESC 
      LIMIT 12
    `,
    prisma.$queryRaw<{deviceType: string; brandModel: string; count: bigint}[]>`
      SELECT "deviceType", "brandModel", COUNT(*)::bigint as count 
      FROM "Repair" 
      GROUP BY "deviceType", "brandModel" 
      ORDER BY count DESC 
      LIMIT 10
    `,
    prisma.$queryRaw<{id: number; name: string; stock: number; minStock: number; sellingPrice: number}[]>`
      SELECT id, name, stock, "minStock", "sellingPrice" 
      FROM "Part" 
      WHERE stock <= "minStock" 
      ORDER BY stock ASC
    `,
    prisma.warranty.count({ where: { status: "Active", warrantyEnd: { gt: new Date() } } }),
    prisma.warranty.count({ where: { warrantyEnd: { lt: new Date() }, status: "Active" } }),
  ]);

  return {
    totalClients,
    totalRepairs,
    totalInvoices,
    totalRevenue: totalPayments._sum.amount || 0,
    repairsByStatus: Object.fromEntries(repairsByStatus.map((s: any) => [s.status, s._count])),
    repairsByMonth: repairsByMonth.map(m => ({ month: m.month, count: Number(m.count) })).reverse(),
    revenueByMonth: revenueByMonth.map(m => ({ month: m.month, total: m.total || 0 })).reverse(),
    topDevices: topDevices.map(d => ({ deviceType: d.deviceType, brandModel: d.brandModel, count: Number(d.count) })),
    lowStockParts: lowStockParts.map((p: any) => ({ ...p, isLowStock: true })),
    activeWarranties,
    expiredWarranties,
  };
}

// --- REMINDERS ---
export async function getUnretrievedRepairsAction() {
  const repairs = await prisma.repair.findMany({
    where: {
      status: "Terminée",
      retrievedAt: null,
    },
    include: { client: true },
    orderBy: { completedAt: "asc" },
  });
  return repairs.map((r: any) => ({
    id: r.id,
    clientName: r.client.name,
    clientPhone: r.client.phone,
    deviceType: r.deviceType,
    brandModel: r.brandModel,
    completedAt: r.completedAt?.toLocaleString("fr-FR"),
    daysWaiting: r.completedAt ? Math.floor((Date.now() - r.completedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0,
  }));
}

export async function markReminderSentAction(id: number) {
  await prisma.repair.update({ where: { id }, data: { reminderSent: true } });
  return { success: true };
}

export async function markRepairRetrievedAction(id: number) {
  await prisma.repair.update({ where: { id }, data: { retrievedAt: new Date() } });
  return { success: true };
}

// --- PUBLIC PORTAL ACTIONS ---
export async function getPublicRepairAction(id: number) {
  const repair = await prisma.repair.findUnique({
    where: { id },
    include: { client: true },
  });
  
  if (!repair) return null;
  
  return {
    id: repair.id,
    deviceType: repair.deviceType,
    brandModel: repair.brandModel,
    status: repair.status,
    issue: repair.issue,
    createdAt: repair.createdAt.toLocaleString("fr-FR"),
    clientName: repair.client.name.substring(0, 3) + "***",
  };
}

export async function submitOnlineBookingAction(data: any) {
  const validated = onlineBookingSchema.safeParse(data);
  if (!validated.success) {
    throw new Error(validated.error.issues.map((e: any) => e.message).join(", "));
  }

  const { clientName, phone, address, deviceType, brandModel, issue, priority } = validated.data;

  let client = await prisma.client.findFirst({ where: { phone } });
  if (!client) {
    client = await prisma.client.create({
      data: { name: clientName, phone, address: address || null },
    });
  } else if (address && !client.address) {
    client = await prisma.client.update({
      where: { id: client.id },
      data: { address }
    });
  }

  const repair = await prisma.repair.create({
    data: {
      clientId: client.id,
      deviceType,
      brandModel,
      issue,
      status: "Diagnostic",
      priority: priority || "Normale",
    },
  });

  await prisma.notification.create({
    data: {
      type: "new_repair",
      title: "Nouvelle demande en ligne",
      message: `${clientName} a soumis une demande de réparation pour ${deviceType} ${brandModel}`,
      repairId: repair.id,
      clientId: client.id,
    },
  });

  return { success: true, repairId: repair.id };
}

// --- SETTINGS ---
export async function getSettingAction(key: string) {
  const setting = await prisma.settings.findUnique({ where: { key } });
  return setting?.value || null;
}

export async function setSettingAction(key: string, value: string) {
  await prisma.settings.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
  return { success: true };
}

// --- PUBLIC TRACKING ---
export async function getPublicRepairByIdAction(id: number) {
  const repair = await prisma.repair.findUnique({
    where: { id },
    include: { client: true },
  });
  
  if (!repair) return null;
  
  return {
    id: repair.id,
    deviceType: repair.deviceType,
    brandModel: repair.brandModel,
    status: repair.status,
    diagnosis: repair.diagnosis,
    solution: repair.solution,
    issue: repair.issue,
    createdAt: repair.createdAt.toLocaleString("fr-FR"),
    completedAt: repair.completedAt?.toLocaleString("fr-FR") || null,
  };
}

export async function getPublicRepairByPhoneAction(phone: string) {
  const client = await prisma.client.findFirst({
    where: { phone },
    include: {
      repairs: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
  
  if (!client) return null;
  
  return {
    clientName: client.name.charAt(0) + "***",
    repairs: client.repairs.map(r => ({
      id: r.id,
      deviceType: r.deviceType,
      brandModel: r.brandModel,
      status: r.status,
      createdAt: r.createdAt.toLocaleString("fr-FR"),
      completedAt: r.completedAt?.toLocaleString("fr-FR") || null,
    })),
  };
}

// --- SEND NOTIFICATIONS ---
export async function sendRepairNotificationAction(repairId: number, type: "email" | "sms" | "both") {
  const repair = await prisma.repair.findUnique({
    where: { id: repairId },
    include: { client: true },
  });
  
  if (!repair) throw new Error("Repair not found");
  
  const shopName = await getSettingAction("shopName") || "Repair Pro";
  const shopPhone = await getSettingAction("shopPhone") || "";
  
  let emailSent = false;
  let smsSent = false;
  let emailError: string | undefined;
  let smsError: string | undefined;
  
  const statusMessages: Record<string, { title: string; message: string }> = {
    "Diagnostic": {
      title: "📋 Diagnostic en cours",
      message: `Bonjour ${repair.client.name}, votre ${repair.deviceType} ${repair.brandModel} est en cours de diagnostic. Nous vous tiendrons informé dès que possible.`
    },
    "En cours": {
      title: "🔧 Réparation en cours",
      message: `Bonjour ${repair.client.name}, la réparation de votre ${repair.deviceType} ${repair.brandModel} a commencé. Nous vous informerons dès qu'elle sera terminée.`
    },
    "Attente pièce": {
      title: "📦 En attente de pièce",
      message: `Bonjour ${repair.client.name}, nous attendons une pièce pour votre ${repair.deviceType} ${repair.brandModel}. La réparation reprendra dès réception.`
    },
    "Terminée": {
      title: "✅ Réparation terminée !",
      message: `Bonjour ${repair.client.name}, votre ${repair.deviceType} ${repair.brandModel} est prêt ! Vous pouvez venir le récupérer.`
    },
  };
  
  const { title, message } = statusMessages[repair.status] || {
    title: "🔔 Mise à jour",
    message: `Bonjour ${repair.client.name}, une mise à jour concernant votre ${repair.deviceType} ${repair.brandModel}.`
  };
  
  const fullMessage = `${message}\n\n${shopName}\n${shopPhone}`;
  
  if (type === "sms" || type === "both") {
    if (repair.client.phone) {
      const result = await sendSMS(repair.client.phone, fullMessage);
      smsSent = result.success;
      if (!result.success) smsError = result.error;
    }
  }
  
  if (type === "email" || type === "both") {
    if (repair.client.email) {
      const { subject, html } = formatRepairStatusEmail(
        repair.client.name,
        repair.deviceType,
        repair.brandModel,
        repair.status,
        shopName,
        shopPhone
      );
      const result = await sendEmail(repair.client.email, subject, html);
      emailSent = result.success;
      if (!result.success) emailError = result.error;
    }
  }
  
  await prisma.notification.create({
    data: {
      type: "status_update",
      title: title,
      message: `Notification envoyée par ${type}: ${repair.client.phone}${repair.client.email ? " / " + repair.client.email : ""}${emailError ? ` (Email: ${emailError})` : ""}${smsError ? ` (SMS: ${smsError})` : ""}`,
      repairId: repair.id,
      clientId: repair.client.id,
      sentAt: new Date(),
    },
  });
  
  return { success: true, emailSent, smsSent, message: fullMessage, emailError, smsError };
}
