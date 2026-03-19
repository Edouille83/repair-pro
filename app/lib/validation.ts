import { z } from "zod";

export const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const siretRegex = /^\d{3}\s?\d{3}\s?\d{3}\s?\d{5}$/;

export const createRepairSchema = z.object({
  clientName: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  phone: z.string().regex(phoneRegex, "Numéro de téléphone invalide (format français attendu)").transform(v => v.replace(/\s/g, "")),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  deviceType: z.string().min(2, "Type d'appareil requis"),
  brandModel: z.string().min(2, "Modèle requis"),
  serialNumber: z.string().max(50).optional(),
  issue: z.string().min(5, "Décrivez le problème (minimum 5 caractères)"),
  diagnosis: z.string().optional(),
  solution: z.string().optional(),
  priority: z.enum(["Basse", "Normale", "Haute", "Urgente"]).optional(),
  estimatedCost: z.number().positive().optional(),
  warrantyMonths: z.number().int().min(0).max(60).optional(),
  technicianId: z.number().int().positive().optional(),
  categoryId: z.number().int().positive().optional(),
  conditionReport: z.string().optional(),
  preChecklist: z.string().optional(),
  photos: z.string().optional(),
  signature: z.string().optional(),
});

export const createInvoiceSchema = z.object({
  repairId: z.number().int().positive("Réparation requise"),
  laborLabel: z.string().min(1, "Libellé main d'œuvre requis").max(200),
  laborAmount: z.number().min(0, "Montant invalide"),
  partLabel: z.string().min(1, "Libellé pièce requis").max(200),
  partAmount: z.number().min(0, "Montant invalide"),
  vatRate: z.number().min(0).max(100).default(20),
  totalHt: z.number().min(0),
  totalVat: z.number().min(0),
  totalTtc: z.number().min(0),
  notes: z.string().max(1000).optional(),
});

export const createClientSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  phone: z.string().regex(phoneRegex, "Numéro de téléphone invalide").transform(v => v.replace(/\s/g, "")),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const createPartSchema = z.object({
  reference: z.string().max(50).optional().or(z.literal("")),
  name: z.string().min(2, "Nom requis").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  category: z.string().max(50).optional().or(z.literal("")),
  purchasePrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0, "Prix de vente requis"),
  stock: z.number().int().min(0).default(0),
  minStock: z.number().int().min(0).default(5),
  supplier: z.string().max(100).optional().or(z.literal("")),
  location: z.string().max(50).optional().or(z.literal("")),
});

export const createTechnicianSchema = z.object({
  name: z.string().min(2, "Nom requis").max(100),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().regex(phoneRegex, "Numéro invalide").optional().or(z.literal("")),
  specialty: z.string().max(100).optional().or(z.literal("")),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadécimale requise").default("#6366f1"),
  active: z.boolean().default(true),
});

export const onlineBookingSchema = z.object({
  clientName: z.string().min(2, "Nom requis"),
  phone: z.string().regex(phoneRegex, "Numéro invalide").transform(v => v.replace(/\s/g, "")),
  address: z.string().max(200).optional(),
  deviceType: z.string().min(2, "Type requis"),
  brandModel: z.string().min(2, "Modèle requis"),
  issue: z.string().min(5, "Décrivez le problème"),
  priority: z.enum(["Basse", "Normale", "Haute", "Urgente"]).optional(),
});

export const publicTrackingSchema = z.object({
  phone: z.string().regex(phoneRegex, "Numéro invalide").transform(v => v.replace(/\s/g, "")),
});

export const settingsSchema = z.object({
  shopName: z.string().min(2).max(100),
  shopAddress: z.string().max(200).optional(),
  shopCity: z.string().max(100).optional(),
  shopPhone: z.string().regex(phoneRegex, "Numéro invalide").optional().or(z.literal("")),
  shopEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  shopSiret: z.string().regex(siretRegex, "SIRET invalide").optional().or(z.literal("")),
  defaultWarrantyMonths: z.coerce.number().int().min(0).max(60).default(3),
  lowStockAlert: z.coerce.number().int().min(0).default(5),
  reminderDays: z.coerce.number().int().min(1).max(90).default(14),
});

export type CreateRepairInput = z.infer<typeof createRepairSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type CreatePartInput = z.infer<typeof createPartSchema>;
export type CreateTechnicianInput = z.infer<typeof createTechnicianSchema>;
export type OnlineBookingInput = z.infer<typeof onlineBookingSchema>;
export type PublicTrackingInput = z.infer<typeof publicTrackingSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
