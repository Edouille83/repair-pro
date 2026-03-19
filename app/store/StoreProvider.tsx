"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { 
  getRepairsAction, createRepairAction, updateRepairAction, updateRepairStatusAction,
  getInvoicesAction, createInvoiceAction, updateInvoiceAction, deleteInvoiceAction,
  getPaymentsAction, createPaymentAction, deletePaymentAction,
  getClientsAction, getClientDetailsAction, updateClientAction,
  getTechniciansAction, createTechnicianAction, updateTechnicianAction, deleteTechnicianAction,
  getCategoriesAction, createCategoryAction, updateCategoryAction, deleteCategoryAction,
  getPartsAction, createPartAction, updatePartAction, deletePartAction, updatePartStockAction,
  getQuotesAction, createQuoteAction, updateQuoteAction, deleteQuoteAction, convertQuoteToInvoiceAction,
  getWarrantiesAction, createWarrantyClaimAction,
  getNotificationsAction, createNotificationAction, markNotificationReadAction, markAllNotificationsReadAction, getUnreadNotificationsCountAction,
  getStatsAction, getUnretrievedRepairsAction, markReminderSentAction, markRepairRetrievedAction,
  sendRepairNotificationAction,
  getSettingAction, setSettingAction
} from "../actions";

export type RepairStatus = "Diagnostic" | "En cours" | "Attente pièce" | "Terminée" | "Annulée";
export type RepairPriority = "Basse" | "Normale" | "Haute" | "Urgente";
export type PaymentMethod = "Carte" | "Espèces" | "PayPal" | "Virement" | "Chèque" | "Autre";

export type IntakeRecord = {
  id: number;
  invoiceRef: string;
  clientId: number;
  clientName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  deviceType: string;
  brandModel: string;
  serialNumber?: string | null;
  issue: string;
  diagnosis?: string | null;
  solution?: string | null;
  status: RepairStatus;
  priority: RepairPriority;
  technicianId?: number | null;
  technicianName?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  estimatedCost?: number | null;
  finalCost?: number | null;
  warrantyMonths: number;
  preChecklist?: string | null;
  photos?: string | null;
  signature?: string | null;
  createdAt: string;
  completedAt?: string | null;
  retrievedAt?: string | null;
  reminderSent: boolean;
  conditionReport?: string | null;
};

export type Invoice = {
  id: number;
  repairId: number;
  laborLabel: string;
  laborAmount: number;
  partLabel: string;
  partAmount: number;
  vatRate: number;
  totalHt: number;
  totalVat: number;
  totalTtc: number;
  notes?: string;
  createdAt: string;
  clientName?: string;
  clientPhone?: string;
};

export type Payment = {
  id: number;
  invoiceId: number;
  amount: number;
  method: PaymentMethod;
  note: string;
  createdAt: string;
};

export type ClientRecord = { 
  id: number; 
  name: string; 
  phone: string; 
  email: string | null;
  address: string | null;
  notes: string | null;
  repairsCount: number;
  totalSpent: number;
  createdAt: string; 
};

export type ClientDetails = ClientRecord & {
  repairs: IntakeRecord[];
};

export type Technician = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  specialty: string | null;
  color: string;
  active: boolean;
};

export type Category = {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
};

export type Part = {
  id: number;
  reference: string;
  name: string;
  description: string | null;
  category: string | null;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  supplier: string | null;
  location: string | null;
  isLowStock: boolean;
};

export type Quote = {
  id: number;
  repairId: number;
  label: string;
  description?: string;
  amount: number;
  status: string;
  validUntil?: string;
  createdAt: string;
  clientName?: string;
  device?: string;
};

export type Warranty = {
  id: number;
  repairId: number;
  warrantyEnd: string;
  terms?: string;
  status: string;
  claims: number;
  notes?: string;
  createdAt: string;
  isExpired: boolean;
  clientName: string;
  clientPhone: string;
  device: string;
};

export type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  repairId?: number;
  clientId?: number;
  read: boolean;
  sentAt?: string;
  createdAt: string;
};

export type Stats = {
  totalClients: number;
  totalRepairs: number;
  totalInvoices: number;
  totalRevenue: number;
  repairsByStatus: Record<string, number>;
  repairsByMonth: { month: string; count: number }[];
  revenueByMonth: { month: string; total: number }[];
  topDevices: { deviceType: string; brandModel: string; count: number }[];
  lowStockParts: Part[];
  activeWarranties: number;
  expiredWarranties: number;
};

export type UnretrievedRepair = {
  id: number;
  clientName: string;
  clientPhone: string;
  deviceType: string;
  brandModel: string;
  completedAt?: string;
  daysWaiting: number;
};

type StoreContextType = {
  clients: ClientRecord[];
  records: IntakeRecord[];
  invoices: Invoice[];
  payments: Payment[];
  technicians: Technician[];
  categories: Category[];
  parts: Part[];
  quotes: Quote[];
  warranties: Warranty[];
  notifications: Notification[];
  unreadCount: number;
  stats: Stats;
  unretrievedRepairs: UnretrievedRepair[];
  addRecord: (record: any) => Promise<void>;
  updateRecord: (id: number, data: any) => Promise<void>;
  updateRecordStatus: (id: number, status: RepairStatus) => Promise<void>;
  addInvoice: (invoice: any) => Promise<void>;
  updateInvoice: (id: number, data: any) => Promise<void>;
  deleteInvoice: (id: number) => Promise<void>;
  addPayment: (payment: any) => Promise<void>;
  deletePayment: (id: number) => Promise<void>;
  getInvoicePaidTotal: (invoiceId: number) => number;
  getInvoiceByRepair: (repairId: number) => Invoice | undefined;
  resetData: () => void;
  exportData: () => void;
  refreshData: () => Promise<void>;
  refreshStats: () => Promise<void>;
  addTechnician: (data: any) => Promise<void>;
  updateTechnician: (id: number, data: any) => Promise<void>;
  deleteTechnician: (id: number) => Promise<void>;
  addCategory: (data: any) => Promise<void>;
  updateCategory: (id: number, data: any) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  addPart: (data: any) => Promise<void>;
  updatePart: (id: number, data: any) => Promise<void>;
  deletePart: (id: number) => Promise<void>;
  updatePartStock: (id: number, quantity: number) => Promise<void>;
  addQuote: (data: any) => Promise<void>;
  updateQuote: (id: number, data: any) => Promise<void>;
  deleteQuote: (id: number) => Promise<void>;
  convertQuoteToInvoice: (quoteId: number, invoiceData: any) => Promise<void>;
  createWarrantyClaim: (id: number, notes: string) => Promise<void>;
  addNotification: (data: any) => Promise<void>;
  markNotificationRead: (id: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markReminderSent: (id: number) => Promise<void>;
  markRepairRetrieved: (id: number) => Promise<void>;
  getClientDetails: (id: number) => Promise<ClientDetails | null>;
  updateClient: (id: number, data: any) => Promise<void>;
  getSetting: (key: string) => Promise<string | null>;
  setSetting: (key: string, value: string) => Promise<void>;
  sendNotification: (repairId: number, type: "email" | "sms" | "both", customEmail?: string) => Promise<{ success: boolean; message: string }>;
};

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [records, setRecords] = useState<IntakeRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    totalRepairs: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    repairsByStatus: {},
    repairsByMonth: [],
    revenueByMonth: [],
    topDevices: [],
    lowStockParts: [],
    activeWarranties: 0,
    expiredWarranties: 0,
  });
  const [unretrievedRepairs, setUnretrievedRepairs] = useState<UnretrievedRepair[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadInitialData = useCallback(async () => {
    try {
      const [clientData, repData, invData, payData, techData, catData, partsData, quotesData, warrantyData, notifData, unread, statsData, unretrieved] = await Promise.all([
        getClientsAction(),
        getRepairsAction(),
        getInvoicesAction(),
        getPaymentsAction(),
        getTechniciansAction(),
        getCategoriesAction(),
        getPartsAction(),
        getQuotesAction(),
        getWarrantiesAction(),
        getNotificationsAction(),
        getUnreadNotificationsCountAction(),
        getStatsAction(),
        getUnretrievedRepairsAction(),
      ]);
      setClients(clientData as any);
      setRecords(repData as any);
      setInvoices(invData as any);
      setPayments(payData as any);
      setTechnicians(techData as any);
      setCategories(catData as any);
      setParts(partsData as any);
      setQuotes(quotesData as any);
      setWarranties(warrantyData as any);
      setNotifications(notifData as any);
      setUnreadCount(unread);
      setStats(statsData as any);
      setUnretrievedRepairs(unretrieved as any);
    } catch (err) {
      console.error("Failed to load initial DB data", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const refreshData = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  const refreshStats = useCallback(async () => {
    const [statsData, unretrieved] = await Promise.all([
      getStatsAction(),
      getUnretrievedRepairsAction(),
    ]);
    setStats(statsData);
    setUnretrievedRepairs(unretrieved);
  }, []);

  const refreshNotifications = useCallback(async () => {
    const [notifData, unread] = await Promise.all([
      getNotificationsAction(),
      getUnreadNotificationsCountAction(),
    ]);
    setNotifications(notifData);
    setUnreadCount(unread);
  }, []);

  const addRecord = useCallback(async (data: any) => {
    const newRecord = await createRepairAction(data);
    setRecords(prev => [newRecord as any, ...prev]);
    const [clientData, statsData] = await Promise.all([getClientsAction(), getStatsAction()]);
    setClients(clientData as any);
    setStats(statsData as any);
  }, []);

  const updateRecord = useCallback(async (id: number, data: any) => {
    const updated = await updateRepairAction(id, data);
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updated } as any : r));
    await refreshStats();
  }, [refreshStats]);

  const updateRecordStatus = useCallback(async (id: number, status: RepairStatus) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    await updateRepairStatusAction(id, status);
    await refreshStats();
  }, [refreshStats]);

  const addInvoice = useCallback(async (data: any) => {
    const newInvoice = await createInvoiceAction(data);
    setInvoices(prev => [newInvoice as any, ...prev]);
    const [statsData] = await Promise.all([getStatsAction()]);
    setStats(statsData as any);
  }, []);

  const updateInvoice = useCallback(async (id: number, data: any) => {
    const updated = await updateInvoiceAction(id, data);
    setInvoices(prev => prev.map(i => i.id === id ? updated as any : i));
  }, []);

  const deleteInvoice = useCallback(async (id: number) => {
    await deleteInvoiceAction(id);
    setInvoices(prev => prev.filter(i => i.id !== id));
  }, []);

  const addPayment = useCallback(async (data: any) => {
    const newPayment = await createPaymentAction(data);
    setPayments(prev => [newPayment as any, ...prev]);
  }, []);

  const deletePayment = useCallback(async (id: number) => {
    await deletePaymentAction(id);
    setPayments(prev => prev.filter(p => p.id !== id));
  }, []);

  const getInvoicePaidTotal = useCallback((invoiceId: number) => 
    payments.filter(p => p.invoiceId === invoiceId).reduce((sum, p) => sum + p.amount, 0), [payments]);

  const getInvoiceByRepair = useCallback((repairId: number) => 
    invoices.find(i => i.repairId === repairId), [invoices]);

  const addTechnician = useCallback(async (data: any) => {
    const newTech = await createTechnicianAction(data);
    setTechnicians(prev => [...prev, newTech as any]);
  }, []);

  const updateTechnician = useCallback(async (id: number, data: any) => {
    const updated = await updateTechnicianAction(id, data);
    setTechnicians(prev => prev.map(t => t.id === id ? updated as any : t));
  }, []);

  const deleteTechnician = useCallback(async (id: number) => {
    await deleteTechnicianAction(id);
    setTechnicians(prev => prev.filter(t => t.id !== id));
  }, []);

  const addCategory = useCallback(async (data: any) => {
    const newCat = await createCategoryAction(data);
    setCategories(prev => [...prev, newCat as any]);
  }, []);

  const updateCategory = useCallback(async (id: number, data: any) => {
    const updated = await updateCategoryAction(id, data);
    setCategories(prev => prev.map(c => c.id === id ? updated as any : c));
  }, []);

  const deleteCategory = useCallback(async (id: number) => {
    await deleteCategoryAction(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const addPart = useCallback(async (data: any) => {
    const newPart = await createPartAction(data);
    setParts(prev => [...prev, newPart as any]);
    await refreshStats();
  }, [refreshStats]);

  const updatePart = useCallback(async (id: number, data: any) => {
    const updated = await updatePartAction(id, data);
    setParts(prev => prev.map(p => p.id === id ? updated as any : p));
    await refreshStats();
  }, [refreshStats]);

  const deletePart = useCallback(async (id: number) => {
    await deletePartAction(id);
    setParts(prev => prev.filter(p => p.id !== id));
    await refreshStats();
  }, [refreshStats]);

  const updatePartStock = useCallback(async (id: number, quantity: number) => {
    const updated = await updatePartStockAction(id, quantity);
    setParts(prev => prev.map(p => p.id === id ? updated as any : p));
    await refreshStats();
  }, [refreshStats]);

  const addQuote = useCallback(async (data: any) => {
    const newQuote = await createQuoteAction(data);
    setQuotes(prev => [newQuote as any, ...prev]);
  }, []);

  const updateQuote = useCallback(async (id: number, data: any) => {
    const updated = await updateQuoteAction(id, data);
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, ...updated } as any : q));
  }, []);

  const deleteQuote = useCallback(async (id: number) => {
    await deleteQuoteAction(id);
    setQuotes(prev => prev.filter(q => q.id !== id));
  }, []);

  const convertQuoteToInvoice = useCallback(async (quoteId: number, invoiceData: any) => {
    await convertQuoteToInvoiceAction(quoteId, invoiceData);
    await refreshData();
  }, [refreshData]);

  const createWarrantyClaim = useCallback(async (id: number, notes: string) => {
    await createWarrantyClaimAction(id, notes);
    const warrantyData = await getWarrantiesAction();
    setWarranties(warrantyData as any);
  }, []);

  const addNotification = useCallback(async (data: any) => {
    const newNotif = await createNotificationAction(data);
    setNotifications(prev => [newNotif as any, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const markNotificationRead = useCallback(async (id: number) => {
    await markNotificationReadAction(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } as any : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    await markAllNotificationsReadAction();
    setNotifications(prev => prev.map(n => ({ ...n, read: true } as any)));
    setUnreadCount(0);
  }, []);

  const markReminderSent = useCallback(async (id: number) => {
    await markReminderSentAction(id);
    setRecords(prev => prev.map(r => r.id === id ? { ...r, reminderSent: true } as any : r));
    setUnretrievedRepairs(prev => prev.filter(r => r.id !== id));
  }, []);

  const markRepairRetrieved = useCallback(async (id: number) => {
    await markRepairRetrievedAction(id);
    setRecords(prev => prev.map(r => r.id === id ? { ...r, retrievedAt: new Date().toLocaleString("fr-FR") } as any : r));
    setUnretrievedRepairs(prev => prev.filter(r => r.id !== id));
  }, []);

  const getClientDetails = useCallback(async (id: number) => {
    return await getClientDetailsAction(id) as any;
  }, []);

  const updateClient = useCallback(async (id: number, data: any) => {
    const updated = await updateClientAction(id, data);
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updated } as any : c));
  }, []);

  const getSetting = useCallback(async (key: string) => {
    return await getSettingAction(key);
  }, []);

  const setSetting = useCallback(async (key: string, value: string) => {
    await setSettingAction(key, value);
  }, []);

  const sendNotification = useCallback(async (repairId: number, type: "email" | "sms" | "both", customEmail?: string) => {
    const result = await sendRepairNotificationAction(repairId, type, customEmail);
    await refreshNotifications();
    return result;
  }, [refreshNotifications]);

  const resetData = () => {
    alert("Veuillez supprimer `dev.db` ou faire npx prisma migrate reset pour réinitialiser la DB.");
  };

  const exportData = () => {
    const headers = ["Date", "N° Facture", "Client", "Adresse", "Montant HT", "TVA", "Montant TTC", "Méthode de Paiement"].join(";");
    const rows = invoices.map(inv => {
      const relatedPayments = payments.filter(p => p.invoiceId === inv.id);
      const method = relatedPayments.length > 0 ? relatedPayments.map(p => p.method).join("/ ") : "En attente";
      const numeroFacture = `FAC-${inv.createdAt.slice(6,10)}${inv.createdAt.slice(3,5)}-${inv.id.toString().padStart(4, "0")}`;
      
      return [inv.createdAt.split(' ')[0], numeroFacture, `"${inv.clientName || ''}"`, `"${inv.clientPhone || ''}"`, inv.totalHt, inv.totalVat, inv.totalTtc, method].join(";");
    });
    
    const blob = new Blob([[headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Export_Comptable_RepairPro_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <StoreContext.Provider value={{
      clients, records, invoices, payments, technicians, categories, parts, quotes, warranties, notifications, unreadCount, stats, unretrievedRepairs,
      addRecord, updateRecord, updateRecordStatus,
      addInvoice, updateInvoice, deleteInvoice,
      addPayment, deletePayment,
      getInvoicePaidTotal, getInvoiceByRepair,
      resetData, exportData, refreshData, refreshStats,
      addTechnician, updateTechnician, deleteTechnician,
      addCategory, updateCategory, deleteCategory,
      addPart, updatePart, deletePart, updatePartStock,
      addQuote, updateQuote, deleteQuote, convertQuoteToInvoice,
      createWarrantyClaim,
      addNotification, markNotificationRead, markAllNotificationsRead, refreshNotifications,
      markReminderSent, markRepairRetrieved,
      getClientDetails, updateClient,
      getSetting, setSetting,
      sendNotification,
    }}>
      {isLoaded ? children : <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 font-medium"><div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4"></div>Connexion à la base de données...</div>}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
}
