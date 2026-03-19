"use client";

import { useState, useRef } from "react";
import { Check, X, AlertTriangle, Shield, FileText, Printer, User } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";

interface ConditionReportProps {
  clientName: string;
  clientTitle: string;
  deviceType: string;
  brandModel: string;
  onComplete: (data: ConditionReportData) => void;
  onCancel: () => void;
}

export interface ConditionReportData {
  clientTitle: string;
  clientName: string;
  deviceType: string;
  brandModel: string;
  checklist: Record<string, boolean>;
  preExistingIssues: string[];
  customPreExistingIssues: string;
  generalConditions: string;
  termsAccepted: boolean;
  clientSignature: string;
  technicianSignature: string;
  createdAt: string;
  reportNumber: string;
}

const INITIAL_CHECKLIST = {
  // État de l'écran
  screenCracked: "Écran cassé/fissuré",
  screenScratched: "Écran rayé",
  screenDeadPixels: "Pixels morts identifiés",
  screenDiscoloration: "Décoloration de l'écran",
  screenNotResponding: "Écran tactile ne répond plus",
  screenBacklight: "Problème rétroéclairage",
  
  // Boutons
  buttonsVolume: "Boutons volume HS",
  buttonsPower: "Bouton power HS",
  buttonsHome: "Bouton home HS",
  
  // Connecteurs
  chargingPort: "Port de charge défaillant",
  headphoneJack: "Prise casque HS",
  usbPort: "Port USB HS",
  
  // Audio
  speakersNotWorking: "Haut-parleurs ne fonctionnent pas",
  microphoneNotWorking: "Microphone ne fonctionne pas",
  noSoundCalls: "Pas de son en appel",
  
  // Caméras
  cameraFront: "Caméra avant HS",
  cameraBack: "Caméra arrière HS",
  flashNotWorking: "Flash/Led HS",
  
  // Connectivité
  wifiNotWorking: "WiFi ne fonctionne pas",
  bluetoothNotWorking: "Bluetooth ne fonctionne pas",
  noCellular: "Réseau cellulaire ne marche pas",
  simNotDetected: "SIM non détectée",
  
  // Batterie/Alimentation
  batterySwollen: "Batterie gonflée",
  batteryDraining: "Batterie se décharge rapidement",
  notCharging: "Ne charge pas",
  notTurningOn: "Ne s'allume plus",
  randomlyShutsOff: "S'éteint tout seul",
  
  // Biométrie/Sécurité
  touchIdNotWorking: "Touch ID HS",
  faceIdNotWorking: "Face ID HS",
  passcodeNotWorking: "Code/Pattern ne marche pas",
  
  // Autre
  overheating: "Surchauffe",
  waterDamage: "Traces d'oxydation/eau",
  speakerRattle: "Haut-parleur grésille",
  wifiAntenna: "Antenne WiFi",
  nfcNotWorking: "NFC HS",
  
  // État général
  overallScratched: "Coque/boîtier rayé",
  overallDented: "Coque/boîtier enfoncé",
  overallBroken: "Coque/boîtier cassé",
  screenBurn: "Burn-in OLED",
  falseTouches: "Faux contacts tactiles",
};

const GENERAL_CONDITIONS = `
CONDITIONS GÉNÉRALES DE PRISE EN CHARGE

1. ÉTAT DE L'APPAREIL
Le client reconnaît que l'appareil a été inspecté en sa présence et que l'état décrit ci-dessus correspond à la réalité. Toute anomalie non mentionnée ne pourra être imputée à l'atelier.

2. GARANTIE
- La garantie de 3 mois couvre uniquement la réparation effectuée et les pièces remplacées.
- La garantie ne couvre pas : les dommages accidentels, l'oxydation, les chutes, les contacts liquides post-réparation.
- L'appareil doit être récupéré dans un délai de 30 jours après notification de disponibilité. Passé ce délai, l'atelier décline toute responsabilité.

3. RESPONSABILITÉ
- L'atelier n'est pas responsable des données présentes sur l'appareil. Le client doit effectuer une sauvegarde avant dépose.
- L'atelier n'est pas responsable si l'appareil présente des problèmes non déclarés (oxydation cachée, etc.).
- Si l'appareil est irréparable ou si le client renonce à la réparation, des frais de diagnostic de 15€ à 30€ peuvent être appliqués.

4. PRIX ET PAIEMENT
- Un devis est fourni avant toute réparation. Le client doit l'approuver.
- Le paiement s'effectue à la récupération de l'appareil.
- En cas de non-récupération après 60 jours, l'appareil pourra être vendu pour couvrir les frais.

5. PROTECTION DES DONNÉES
Les données personnelles sont traitées conformément au RGPD. L'atelier s'engage à ne pas divulguer les informations du client.

6. LITIGES
En cas de litige, le tribunal de commerce de Paris sera compétent.
`;

export default function ConditionReport({
  clientName,
  clientTitle,
  deviceType,
  brandModel,
  onComplete,
  onCancel,
}: ConditionReportProps) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [customIssues, setCustomIssues] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showConditions, setShowConditions] = useState(false);
  const clientSigCanvas = useRef<SignatureCanvas>(null);
  const techSigCanvas = useRef<SignatureCanvas>(null);
  const [step, setStep] = useState<"checklist" | "conditions" | "signatures">("checklist");
  
  const reportNumber = `RAP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`;
  const currentDate = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const checkedItemsCount = Object.values(checklist).filter(Boolean).length;
  const totalItems = Object.keys(INITIAL_CHECKLIST).length;

  const handleChecklistChange = (key: string, checked: boolean) => {
    setChecklist(prev => ({ ...prev, [key]: checked }));
  };

  const handleSubmit = () => {
    if (!clientSigCanvas.current?.isEmpty() && !techSigCanvas.current?.isEmpty()) {
      const data: ConditionReportData = {
        clientTitle,
        clientName,
        deviceType,
        brandModel,
        checklist,
        preExistingIssues: Object.entries(checklist)
          .filter(([_, v]) => v)
          .map(([k]) => INITIAL_CHECKLIST[k as keyof typeof INITIAL_CHECKLIST]),
        customPreExistingIssues: customIssues,
        generalConditions: GENERAL_CONDITIONS,
        termsAccepted,
        clientSignature: clientSigCanvas.current?.getTrimmedCanvas().toDataURL("image/png") || "",
        technicianSignature: techSigCanvas.current?.getTrimmedCanvas().toDataURL("image/png") || "",
        createdAt: currentDate,
        reportNumber,
      };
      onComplete(data);
    }
  };

  const canProceedToNext = () => {
    if (step === "checklist") return true;
    if (step === "conditions") return termsAccepted;
    if (step === "signatures") {
      return !clientSigCanvas.current?.isEmpty() && !techSigCanvas.current?.isEmpty();
    }
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Rapport d&apos;État de l&apos;Appareil</h2>
                <p className="text-white/80 text-sm">Document officiel de prise en charge</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/70">N° Document</p>
              <p className="font-mono font-bold">{reportNumber}</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-4">
            {["checklist", "conditions", "signatures"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step === s ? "bg-indigo-600 text-white" :
                  (s === "checklist" || (s === "conditions" && step === "signatures")) ? "bg-emerald-500 text-white" :
                  "bg-slate-200 text-slate-500"
                }`}>
                  {i + 1}
                </div>
                <span className={`text-sm font-medium ${
                  step === s ? "text-indigo-600" : "text-slate-500"
                }`}>
                  {s === "checklist" ? "Inventaire" : s === "conditions" ? "Conditions" : "Signatures"}
                </span>
                {i < 2 && <div className="w-12 h-0.5 bg-slate-200 ml-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Client Info Banner */}
          <div className="bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl p-4 mb-6 border border-slate-200">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-slate-500">Client :</span>
                <span className="font-bold text-slate-800 ml-2">{clientTitle} {clientName}</span>
              </div>
              <div>
                <span className="text-slate-500">Appareil :</span>
                <span className="font-bold text-slate-800 ml-2">{deviceType}</span>
              </div>
              <div>
                <span className="text-slate-500">Modèle :</span>
                <span className="font-bold text-slate-800 ml-2">{brandModel}</span>
              </div>
              <div>
                <span className="text-slate-500">Date :</span>
                <span className="font-bold text-slate-800 ml-2">{currentDate}</span>
              </div>
            </div>
          </div>

          {/* STEP 1: Checklist */}
          {step === "checklist" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  État actuel de l&apos;appareil (cochez les problèmes constatés)
                </h3>
                <span className="text-sm text-slate-500">
                  {checkedItemsCount} / {totalItems} problèmes identifiés
                </span>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-amber-800 text-sm font-medium">
                  ⚠️ IMPORTANT : Cette liste doit être complétée en présence du client. Cochez TOUT ce qui est constaté sur l&apos;appareil. 
                  Cela nous protège mutuellement en cas de réclamation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(INITIAL_CHECKLIST).map(([key, label]) => (
                  <label
                    key={key}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      checklist[key]
                        ? "bg-red-50 border-red-300 checked:bg-red-50"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      checklist[key] ? "bg-red-500" : "bg-slate-200"
                    }`}>
                      {checklist[key] && <X className="w-4 h-4 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={checklist[key] || false}
                      onChange={(e) => handleChecklistChange(key, e.target.checked)}
                      className="sr-only"
                    />
                    <span className={`font-medium ${
                      checklist[key] ? "text-red-700" : "text-slate-700"
                    }`}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Problèmes supplémentaires constatés (à décrire) :
                </label>
                <textarea
                  value={customIssues}
                  onChange={(e) => setCustomIssues(e.target.value)}
                  placeholder="Décrivez tout autre problème constaté..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Conditions */}
          {step === "conditions" && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-indigo-500" />
                Conditions Générales de Prise en Charge
              </h3>
              
              <div className={`bg-slate-50 rounded-xl p-6 border border-slate-200 max-h-80 overflow-y-auto mb-4 ${
                !showConditions ? "blur-sm" : ""
              }`}>
                <pre className="text-sm text-slate-600 whitespace-pre-wrap font-sans">
                  {GENERAL_CONDITIONS}
                </pre>
              </div>
              
              {!showConditions && (
                <button
                  onClick={() => setShowConditions(true)}
                  className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Cliquez ici pour lire les conditions
                </button>
              )}

              <label className="flex items-start gap-4 mt-6 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-6 h-6 mt-0.5 rounded text-indigo-600"
                />
                <div>
                  <p className="font-semibold text-indigo-800">
                    Je reconnais avoir lu et accepté les conditions générales
                  </p>
                  <p className="text-sm text-indigo-600 mt-1">
                    J&apos;accepte que l&apos;appareil soit pris en charge selon les conditions ci-dessus et que les problèmes 
                    identifiés lors de l&apos;inspection soient les seuls couverts par la garantie.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* STEP 3: Signatures */}
          {step === "signatures" && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-indigo-500" />
                Signatures (Client + Technicien)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Signature */}
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                      C
                    </div>
                    Signature du Client
                  </h4>
                  <p className="text-sm text-blue-600 mb-3">
                    {clientTitle} {clientName}
                  </p>
                  <div className="relative bg-white rounded-xl border-2 border-blue-200 overflow-hidden">
                    <SignatureCanvas
                      ref={clientSigCanvas}
                      penColor="#1e40af"
                      canvasProps={{ className: "w-full h-32" }}
                    />
                    <button
                      onClick={() => clientSigCanvas.current?.clear()}
                      className="absolute top-2 right-2 px-2 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-200"
                    >
                      Effacer
                    </button>
                  </div>
                </div>

                {/* Technician Signature */}
                <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                      T
                    </div>
                    Signature du Technicien
                  </h4>
                  <p className="text-sm text-purple-600 mb-3">
                    Louis - Technicien Repair Pro
                  </p>
                  <div className="relative bg-white rounded-xl border-2 border-purple-200 overflow-hidden">
                    <SignatureCanvas
                      ref={techSigCanvas}
                      penColor="#7c3aed"
                      canvasProps={{ className: "w-full h-32" }}
                    />
                    <button
                      onClick={() => techSigCanvas.current?.clear()}
                      className="absolute top-2 right-2 px-2 py-1 bg-purple-100 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-200"
                    >
                      Effacer
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-emerald-800 text-sm font-medium flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-500" />
                  En signant, le client confirme que les informations ci-dessus sont exactes et qu&apos;il accepte les conditions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={step === "checklist" ? onCancel : () => {
              if (step === "signatures") setStep("conditions");
              else if (step === "conditions") setStep("checklist");
            }}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors"
          >
            {step === "checklist" ? "Annuler" : "Retour"}
          </button>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (step === "checklist") setStep("conditions");
                else if (step === "conditions") setStep("signatures");
                else handleSubmit();
              }}
              disabled={!canProceedToNext()}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {step === "signatures" ? (
                <>
                  <Check className="w-5 h-5" />
                  Confirmer et Enregistrer
                </>
              ) : (
                <>
                  Continuer
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
