"use client";

import { useStore, RepairStatus } from "../store/StoreProvider";
import { Wrench, Clock, AlertCircle, CheckCircle, Printer, ShieldCheck, Bell, Mail, X, Send, Smartphone, Tag, FileText, Shield } from "lucide-react";
import clsx from "clsx";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { TicketPrint } from "../components/TicketPrint";
import { DeviceLabel } from "../components/DeviceLabel";

const detectGender = (name: string): string => {
  const firstName = name.trim().split(" ")[0].toLowerCase();
  const femaleNames = ["marie", "sophie", "nathalie", "caroline", "marine", "ludivine", "catherine", "valerie", "stephanie", "sandrine", "emilie", "julie", "charlotte", "amandine", "camille", "justine", "alexandra", "sandra", "patricia", "corinne", "isabelle", "martine", "brigitte", "danielle", "francoise", "monique", "anne", "nicole", "helene", "sylvie", "laurence", "muriel", "florence", "celine", "audrey", "kim", "lina", "mia", "zoe", "emma", "lena", "lea", "chloe", "alice", "clara", "anna", "sofia", "lola", "nina", "lucy", "diana", "elena", "ines", "lisa", "eva", "iris", "lily", "noa", "luna", "mila", "nora", "amy", "estelle", "erika", "sara", "melissa", "nadia", "fanny", "clementine", "adeline", "angelique", "claire", "margaux", "manon", "amelie", "melanie", "eleonore", "roxy", "elsa", "elisa", "lise", "celia", "lara", "nour", "fatima", "imene", "djeneba", "aicha", "fatou", "khady", "mareme", "lucia", "lucie", "djeneba", "kadiatou", "mariama", "aminata", "fatoumata", "aissata", "oumou", "yasmine", "jade", "ruby", "louise", "romane", "agathe", "capucine", "daphne", "roxane", "sarah", "ludivine", "oceane", "johanna", "sabrina", "angela", "angeline", "mireille", "nathalie"];
  const maleNames = ["jean", "pierre", "michel", "andre", "jean-luc", "philippe", "patrick", "stephane", "nicolas", "frederic", "thomas", "olivier", "alexandre", "antoine", "sebastien", "vincent", "ludovic", "arnaud", "david", "julien", "michael", "jerome", "franck", "pascal", "gilles", "yves", "christophe", "bruno", "denis", "jacques", "robert", "paul", "henri", "georges", "albert", "emile", "louis", "alexis", "eddy", "edouard", "ahmed", "brahim", "youssef", "mamadou", "ousmane", "ibrahima", "abdou", "moussa", "bakary", "ali", "modou", "abdoulaye", "moustapha", "souleymane", "issaga", "abdoul", "hamidou", "boubacar", "seydou", "drissa", "papis", "babacar", "saliou", "lassana", "oumar", "birama", "sadibou", "fouad", "karim", "samir", "nabil", "hicham", "rachid", "younes", "imad", "hakim", "amir", "lucas", "mathis", "theo", "maxime", "alexis", "gabriel", "ethan", "arthur", "nathan", "hugo", "enzo", "axel", "yanis", "mehdi", "wassim", "sami", "rayan", "adam", "moshe", "david", "daniel", "michael", "joseph", "samuel", "dylan", "etienne", "loic", "guillaume", "romain", "nicolas", "antoine", "florent", "jonathan", "kevin", "benoit"];
  
  if (femaleNames.includes(firstName)) return "Mme";
  if (maleNames.includes(firstName)) return "Mr";
  return "";
};

const CHECKLIST_CONFIG: Record<string, { key: string; label: string }[]> = {
  "Smartphone": [
    { key: "screenOk", label: "Écran OK" },
    { key: "buttonsOk", label: "Boutons fonctionnels" },
    { key: "chargingOk", label: "Port de charge OK" },
    { key: "batteryOk", label: "Batterie OK" },
    { key: "simRemoved", label: "Carte SIM retirée" },
    { key: "accessoriesReturned", label: "Accessoires restitués" },
  ],
  "Ordinateur portable": [
    { key: "screenOk", label: "Écran OK" },
    { key: "keyboardOk", label: "Clavier OK" },
    { key: "trackpadOk", label: "Trackpad OK" },
    { key: "chargingOk", label: "Chargeur OK" },
    { key: "hingesOk", label: "Charnières OK" },
    { key: "speakersOk", label: "Haut-parleurs OK" },
    { key: "webcamOk", label: "Webcam OK" },
  ],
  "Console de jeux": [
    { key: "powerOk", label: "Console s'allume" },
    { key: "controllerOk", label: "Manette OK" },
    { key: "hdmiOk", label: "HDMI OK" },
    { key: "discDriveOk", label: "Lecteur OK" },
    { key: "usbOk", label: "USB OK" },
    { key: "fanOk", label: "Ventilateur OK" },
    { key: "controllerIncluded", label: "Manette incluse" },
  ],
  "Montre connectée": [
    { key: "screenOk", label: "Écran OK" },
    { key: "chargingOk", label: "Charge OK" },
    { key: "batteryOk", label: "Batterie OK" },
    { key: "buttonsOk", label: "Boutons OK" },
    { key: "strapRemoved", label: "Bracelet retiré" },
  ],
  "Tablette": [
    { key: "screenOk", label: "Écran OK" },
    { key: "touchOk", label: "Tactile OK" },
    { key: "buttonsOk", label: "Boutons OK" },
    { key: "chargingOk", label: "Charge OK" },
    { key: "speakersOk", label: "Haut-parleurs OK" },
    { key: "simRemoved", label: "SIM retirée" },
    { key: "accessoriesReturned", label: "Accessoires restitués" },
  ],
  "Autre": [
    { key: "powerOk", label: "Appareil s'allume" },
    { key: "generalCondition", label: "État général noté" },
    { key: "accessoriesReturned", label: "Accessoires restitués" },
  ],
};

export default function RepairsPage() {
  const { records, updateRecordStatus, sendNotification } = useStore();
  const [ticketToPrint, setTicketToPrint] = useState<any>(null);
  const [labelToPrint, setLabelToPrint] = useState<any>(null);
  const [showNotifMenu, setShowNotifMenu] = useState<number | null>(null);
  const [conditionReport, setConditionReport] = useState<any>(null);
  const [customEmail, setCustomEmail] = useState<string>("");
  const ticketRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: ticketRef,
  });

  const handlePrintLabel = useReactToPrint({
    contentRef: labelRef,
  });

  const handlePrintReport = useReactToPrint({
    contentRef: reportRef,
  });

  const viewConditionReport = (record: any) => {
    if (record.conditionReport) {
      const data = typeof record.conditionReport === "string" 
        ? JSON.parse(record.conditionReport) 
        : record.conditionReport;
      setConditionReport(data);
    } else {
      alert("Aucun rapport d'état disponible pour cette réparation.");
    }
  };

  const handleSendNotification = async (repairId: number, type: "email" | "sms" | "both") => {
    try {
      const repair = records.find(r => r.id === repairId);
      const emailToUse = type === "email" || type === "both" ? customEmail : undefined;
      const result = await sendNotification(repairId, type, emailToUse);
      setShowNotifMenu(null);
      setCustomEmail("");
      
      const gender = detectGender(repair?.clientName || "");
      const firstName = (repair?.clientName || "").split(" ")[0];
      const personalizedGreeting = gender ? `Bonjour ${gender}. ${firstName}` : `Bonjour ${firstName}`;
      
      alert(`✓ Notification envoyée avec succès !\n\n${personalizedGreeting},\n\n${result.message}`);
    } catch (err) {
      alert("Erreur lors de l'envoi de la notification");
    }
  };

  const getStatusIcon = (status: RepairStatus) => {
    switch (status) {
      case "Diagnostic": return <AlertCircle className="w-4 h-4" />;
      case "En cours": return <Clock className="w-4 h-4" />;
      case "Attente pièce": return <Wrench className="w-4 h-4" />;
      case "Terminée": return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: RepairStatus) => {
    switch (status) {
      case "Diagnostic": return "bg-slate-100 text-slate-700 border-slate-200";
      case "En cours": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Attente pièce": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Terminée": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <Wrench className="w-6 h-6" />
          </div>
          Réparations en cours
        </h2>
        <p className="text-slate-500">Gérez le statut de tous les appareils présents dans l'atelier.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {records.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Wrench className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p>Aucun appareil n'est actuellement en atelier.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {records.map((record) => (
              <div key={record.id} className="p-5 rounded-xl border border-slate-100 bg-slate-50 hover:border-indigo-100 hover:bg-white transition-all shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-bold text-lg text-slate-900">{record.clientName}</div>
                    <div className="text-indigo-600 font-medium">{record.brandModel}</div>
                  </div>
                  <div className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border", getStatusColor(record.status))}>
                    {getStatusIcon(record.status)}
                    {record.status}
                  </div>
                  <button
                    onClick={() => { setTicketToPrint(record); setTimeout(handlePrint, 100); }}
                    className="flex items-center gap-2 px-3 py-1.5 ml-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
                    title="Imprimer le ticket"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Ticket
                  </button>
                  <button
                    onClick={() => { 
                      setLabelToPrint({
                        invoiceRef: record.invoiceRef,
                        clientName: record.clientName,
                        clientPhone: record.phone,
                        deviceType: record.deviceType,
                        brandModel: record.brandModel,
                        createdAt: record.createdAt,
                        status: record.status,
                      }); 
                      setTimeout(handlePrintLabel, 100); 
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-bold transition-all border border-indigo-200"
                    title="Imprimer l'étiquette appareil"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    Étiquette
                  </button>
                  <button
                    onClick={() => viewConditionReport(record)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold transition-all border border-emerald-200"
                    title="Voir le rapport d'état signé"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Rapport
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5 text-sm">
                  <div>
                    <div className="text-slate-500 mb-1">Téléphone</div>
                    <div className="font-medium bg-white px-3 py-1.5 rounded-md border border-slate-100 inline-block">{record.phone}</div>
                  </div>
                  {record.email && (
                    <div>
                      <div className="text-slate-500 mb-1">Email</div>
                      <div className="font-medium bg-white px-3 py-1.5 rounded-md border border-slate-100 inline-block">{record.email}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-slate-500 mb-1">Type</div>
                    <div className="font-medium bg-white px-3 py-1.5 rounded-md border border-slate-100 inline-block">{record.deviceType}</div>
                  </div>
                  <div className="col-span-2 lg:col-span-3">
                    <div className="text-slate-500 mb-1">Problème déclaré</div>
                    <div className="font-medium bg-white px-3 py-1.5 rounded-md border border-slate-100 line-clamp-2">{record.issue}</div>
                  </div>
                </div>

                {/* CHECKLIST */}
                {(record.preChecklist || (record.photos && record.photos !== "[]") || record.signature) && (
                  <div className="mb-5 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 text-sm mb-3 flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-indigo-500" />
                       Checklist {record.deviceType}
                    </h4>
                    
                    {record.preChecklist && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-4">
                        {(() => {
                          try {
                            const cl = JSON.parse(record.preChecklist as string);
                            if (cl.items && typeof cl.items === 'object') {
                              const config = CHECKLIST_CONFIG[cl.deviceType] || [];
                              return Object.entries(cl.items).map(([key, checked]: [string, any]) => {
                                const item = config.find((c: any) => c.key === key);
                                const label = item?.label || key.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase());
                                return (
                                  <div key={key} className="flex items-center gap-1.5">
                                    <CheckCircle className={`w-3 h-3 ${checked ? 'text-indigo-500' : 'text-red-400'}`}/>
                                    <span className={checked ? "text-slate-700" : "text-red-500"}>
                                      {label}
                                    </span>
                                  </div>
                                );
                              });
                            }
                            return null;
                          } catch(e) { return null; }
                        })()}
                      </div>
                    )}

                    <div className="flex gap-4 items-end">
                      {record.photos && record.photos !== "[]" && (() => {
                        try {
                          const photosArr = JSON.parse(record.photos as string);
                          if(photosArr.length === 0) return null;
                          return (
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Photos Inventaire ({photosArr.length})</p>
                              <div className="flex gap-2">
                                {photosArr.slice(0,3).map((p:string, i:number) => (
                                  <div key={i} className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-white shadow-sm">
                                    <img src={p} className="w-full h-full object-cover" />
                                  </div>
                                ))}
                                {photosArr.length > 3 && (
                                   <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                     +{photosArr.length - 3}
                                   </div>
                                )}
                              </div>
                            </div>
                          );
                        } catch(e) { return null; }
                      })()}
                      
                      {record.signature && (
                        <div className="ml-auto">
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 text-right">Accord & Signature</p>
                          <div className="w-32 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                            <img src={record.signature} className="h-full w-full object-contain mix-blend-multiply opacity-80" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                  {(["Diagnostic", "En cours", "Attente pièce", "Terminée"] as RepairStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateRecordStatus(record.id, status)}
                      className={clsx(
                        "px-4 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none flex items-center gap-2",
                        record.status === status
                          ? "bg-slate-800 text-white shadow-md transform scale-105"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {status === "Diagnostic" && <AlertCircle className="w-4 h-4" />}
                      {status === "En cours" && <Clock className="w-4 h-4" />}
                      {status === "Attente pièce" && <Wrench className="w-4 h-4" />}
                      {status === "Terminée" && <CheckCircle className="w-4 h-4" />}
                      {status}
                    </button>
                  ))}
                  <div className="relative ml-auto">
                    <button
                      onClick={() => {
                        if (showNotifMenu === record.id) {
                          setShowNotifMenu(null);
                        } else {
                          setShowNotifMenu(record.id);
                          setCustomEmail(record.email || "");
                        }
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 shadow-lg shadow-indigo-200"
                    >
                      <Bell className="w-4 h-4" />
                      Notifier
                    </button>
                    {showNotifMenu === record.id && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                  <Smartphone className="w-5 h-5" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg">Envoyer une notification</h3>
                                  <p className="text-white/80 text-sm">Personnalisez votre message</p>
                                </div>
                              </div>
                              <button onClick={() => setShowNotifMenu(null)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="p-6">
                            <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-5 mb-5 border border-indigo-100">
                              <div className="text-center mb-4">
                                <p className="text-sm text-slate-500 mb-1">Aperçu du message</p>
                                <p className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                  {(() => {
                                    const gender = detectGender(record.clientName);
                                    const firstName = record.clientName.split(" ")[0];
                                    return gender ? `Bonjour ${gender}. ${firstName}` : `Bonjour ${firstName}`;
                                  })()}
                                </p>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-600">
                                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                                  <span>Appareil : <strong>{record.brandModel}</strong></span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                  <span>Statut actuel : <strong className="text-indigo-600">{record.status}</strong></span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                  <span>N° Ticket : <strong>#{record.id}</strong></span>
                                </div>
                              </div>
                            </div>

                            <div className="text-xs text-slate-500 text-center mb-4">
                              Le message sera automatiquement adapté au statut de la réparation
                            </div>

                            <div className="mb-4">
                              <label className="block text-sm font-medium text-slate-600 mb-2">
                                Adresse email (optionnel)
                              </label>
                              <input
                                type="email"
                                value={customEmail}
                                onChange={(e) => setCustomEmail(e.target.value)}
                                placeholder={record.email || "client@exemple.com"}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm"
                              />
                              <p className="text-xs text-slate-400 mt-1">Laissez vide pour utiliser l'email du client</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                              <button
                                onClick={() => handleSendNotification(record.id, "email")}
                                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 hover:from-indigo-100 hover:to-indigo-200 transition-all"
                              >
                                <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg">
                                  <Mail className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-semibold text-indigo-700">Envoyer Email</span>
                                <span className="text-[10px] text-indigo-500">Notifier le client par email</span>
                              </button>
                            </div>

                            <div className="mt-5 flex gap-3">
                              <button
                                onClick={() => setShowNotifMenu(null)}
                                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
                              >
                                Annuler
                              </button>
                              <button
                                onClick={() => handleSendNotification(record.id, "both")}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                              >
                                Envoyer
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Rapport d'État */}
      {conditionReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Rapport d&apos;État de l&apos;Appareil</h2>
                  <p className="text-white/80 text-sm">Document signé par les deux parties</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTimeout(handlePrintReport, 100)}
                  className="px-6 py-3 bg-white text-emerald-700 rounded-xl font-bold hover:bg-white/90 flex items-center gap-2 shadow-lg"
                >
                  <Printer className="w-5 h-5" />
                  Imprimer
                </button>
                <button
                  onClick={() => setConditionReport(null)}
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Client</p>
                  <p className="font-bold text-slate-900">{conditionReport.clientTitle} {conditionReport.clientName}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Appareil</p>
                  <p className="font-bold text-slate-900">{conditionReport.deviceType} - {conditionReport.brandModel}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">N° Document</p>
                  <p className="font-bold text-slate-900 font-mono">{conditionReport.reportNumber}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Date</p>
                  <p className="font-bold text-slate-900">{conditionReport.createdAt}</p>
                </div>
              </div>

              {conditionReport.preExistingIssues && conditionReport.preExistingIssues.length > 0 ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Problèmes constatés avant réparation ({conditionReport.preExistingIssues.length})
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {conditionReport.preExistingIssues.map((issue: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-red-700">
                        <span className="font-bold">✗</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                  {conditionReport.customPreExistingIssues && (
                    <p className="mt-3 text-red-600 italic border-t border-red-200 pt-3">
                      {conditionReport.customPreExistingIssues}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 mb-6">
                  <p className="text-emerald-700 font-bold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Aucun problème préexistant constaté
                  </p>
                </div>
              )}

              <div className="border-2 border-slate-200 rounded-xl overflow-hidden mb-6">
                <div className="bg-slate-100 px-6 py-3 border-b border-slate-200">
                  <h3 className="font-bold text-slate-700">Signatures</h3>
                </div>
                <div className="grid grid-cols-2 gap-6 p-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Signature du Client</p>
                    <p className="font-bold text-slate-900 mb-3">{conditionReport.clientTitle} {conditionReport.clientName}</p>
                    <div className="bg-slate-50 rounded-xl p-3 border-2 border-slate-200">
                      <img 
                        src={conditionReport.clientSignature} 
                        alt="Signature client" 
                        className="max-h-24 mx-auto"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Signature du Technicien</p>
                    <p className="font-bold text-slate-900 mb-3">Louis - Repair Pro</p>
                    <div className="bg-slate-50 rounded-xl p-3 border-2 border-slate-200">
                      <img 
                        src={conditionReport.technicianSignature} 
                        alt="Signature technicien" 
                        className="max-h-24 mx-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
                <h4 className="font-bold text-slate-700 mb-2">Conditions acceptées :</h4>
                <p>Garantie 3 mois couvrant uniquement la réparation/pièces. Exclusions : dommages accidentels, oxydation, chutes. Récupération sous 30 jours. Sauvegarde des données obligatoire. Frais de diagnostic 15-30€ si irréparable.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Area - Hidden */}
      <div className="hidden">
        {ticketToPrint && (
          <div ref={ticketRef}>
            <TicketPrint 
              ticketData={{
                id: ticketToPrint.id,
                clientName: ticketToPrint.clientName,
                phone: ticketToPrint.phone,
                deviceType: ticketToPrint.deviceType,
                brandModel: ticketToPrint.brandModel,
                issue: ticketToPrint.issue,
                invoiceRef: ticketToPrint.invoiceRef,
                createdAt: ticketToPrint.createdAt,
                status: ticketToPrint.status,
              } as any}
            />
          </div>
        )}
        
        {labelToPrint && (
          <div ref={labelRef}>
            <DeviceLabel {...labelToPrint} />
          </div>
        )}

        {conditionReport && (
          <div ref={reportRef} className="p-8 bg-white" style={{ width: "210mm", minHeight: "297mm" }}>
            <div className="text-center mb-6 border-b-2 border-dashed border-slate-300 pb-4">
              <h1 className="text-2xl font-black text-emerald-700">RAPPORT D'ÉTAT DE L'APPAREIL</h1>
              <p className="text-slate-500 mt-1">N° {conditionReport.reportNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-slate-500">Client</p>
                <p className="font-bold">{conditionReport.clientTitle} {conditionReport.clientName}</p>
              </div>
              <div>
                <p className="text-slate-500">Appareil</p>
                <p className="font-bold">{conditionReport.deviceType} - {conditionReport.brandModel}</p>
              </div>
              <div>
                <p className="text-slate-500">Date</p>
                <p className="font-bold">{conditionReport.createdAt}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-red-700 mb-2">Problèmes constatés :</h3>
              {conditionReport.preExistingIssues && conditionReport.preExistingIssues.length > 0 ? (
                <ul className="list-disc pl-5 text-sm">
                  {conditionReport.preExistingIssues.map((issue: string, i: number) => (
                    <li key={i}>{issue}</li>
                  ))}
                  {conditionReport.customPreExistingIssues && (
                    <li className="italic">{conditionReport.customPreExistingIssues}</li>
                  )}
                </ul>
              ) : (
                <p className="text-emerald-700 font-medium">Aucun problème préexistant constaté</p>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-3">Signatures</h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-slate-500 mb-2">Client</p>
                  <img src={conditionReport.clientSignature} alt="Signature" className="h-20 border p-2" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-2">Technicien (Louis)</p>
                  <img src={conditionReport.technicianSignature} alt="Signature" className="h-20 border p-2" />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t text-xs text-slate-500">
              <p><strong>Conditions :</strong> Garantie 3 mois. L'atelier n'est pas responsable des données. Récupération sous 30 jours.</p>
              <p className="mt-2"><strong>Repair Pro</strong> - Document signé par les deux parties le {conditionReport.createdAt}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
