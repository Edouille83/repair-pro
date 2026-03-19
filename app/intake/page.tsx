"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useStore } from "../store/StoreProvider";
import { PenTool, Smartphone, User, Phone, AlertTriangle, Camera, Laptop, Gamepad2, Watch, Tablet, Shield, Printer, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { DEVICE_CATEGORIES, DEVICE_DATA } from "../lib/devices";
import AddressAutocomplete from "../components/AddressAutocomplete";
import ConditionReport, { ConditionReportData } from "../components/ConditionReport";
import { ConditionReportPrint } from "../components/ConditionReportPrint";
import { detectGender, getGenderedGreeting } from "../lib/gender";
import { createElement } from "react";

const DEVICE_ICONS: Record<string, any> = {
  "Smartphone": Smartphone,
  "Ordinateur portable": Laptop,
  "Console de jeux": Gamepad2,
  "Montre connectée": Watch,
  "Tablette": Tablet,
};

const CIVILITY_OPTIONS = [
  { value: "Mr", label: "Monsieur" },
  { value: "Mme", label: "Madame" },
  { value: "Mlle", label: "Mademoiselle" },
];

export default function IntakePage() {
  const { addRecord } = useStore();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<"info" | "report">("info");
  const [clientName, setClientName] = useState("");
  const [clientTitle, setClientTitle] = useState("Mr");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deviceType, setDeviceType] = useState(DEVICE_CATEGORIES[0]);
  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [customBrandModel, setCustomBrandModel] = useState("");
  const [issue, setIssue] = useState("");
  const [error, setError] = useState("");

  const [photos, setPhotos] = useState<string[]>([]);
  const [conditionReportData, setConditionReportData] = useState<ConditionReportData | null>(null);

  const availableBrands = deviceType && deviceType !== "Autre" ? Object.keys(DEVICE_DATA[deviceType] || {}) : [];
  const availableModels = deviceBrand && deviceBrand !== "Autre" && deviceType !== "Autre" ? (DEVICE_DATA[deviceType]?.[deviceBrand] || []) : [];
  const DeviceIcon = DEVICE_ICONS[deviceType] || Smartphone;

  const firstName = clientName.trim().split(" ")[0] || "";
  const { title: detectedTitle } = detectGender(firstName);
  const effectiveTitle = detectedTitle || clientTitle;
  const greeting = firstName ? getGenderedGreeting(effectiveTitle, firstName) : "";

  useEffect(() => {
    if (firstName && !detectedTitle) {
      const { title } = detectGender(firstName);
      if (title) setClientTitle(title);
    }
  }, [firstName, detectedTitle]);

  const handleDeviceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDeviceType(e.target.value);
    setDeviceBrand("");
    setDeviceModel("");
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDeviceBrand(e.target.value);
    setDeviceModel("");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setPhotos(prev => [...prev, ev.target!.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const validateInfo = () => {
    const { title } = detectGender(clientName.trim().split(" ")[0]);
    const finalBrandModel = deviceType === "Autre" || deviceBrand === "Autre" || deviceModel === "Autre"
      ? customBrandModel.trim()
      : `${deviceBrand} ${deviceModel}`.trim();

    if (!clientName.trim()) {
      setError("Le nom du client est obligatoire.");
      return false;
    }
    if (!phone.trim()) {
      setError("Le numéro de téléphone est obligatoire.");
      return false;
    }
    if (!finalBrandModel) {
      setError("La marque et le modèle sont obligatoires.");
      return false;
    }
    if (!issue.trim()) {
      setError("La description du problème est obligatoire.");
      return false;
    }
    setError("");
    return true;
  };

  const proceedToReport = () => {
    if (validateInfo()) {
      setStep("report");
    }
  };

  const handleReportComplete = (data: ConditionReportData) => {
    setConditionReportData(data);
    
    const finalBrandModel = deviceType === "Autre" || deviceBrand === "Autre" || deviceModel === "Autre"
      ? customBrandModel.trim()
      : `${deviceBrand} ${deviceModel}`.trim();

    const record: any = {
      clientName: clientName.trim(),
      clientTitle: effectiveTitle,
      phone: phone.trim(),
      address: address.trim(),
      deviceType,
      brandModel: finalBrandModel,
      issue: issue.trim(),
      status: "Diagnostic",
      priority: "Normale",
      photos: JSON.stringify(photos),
      conditionReport: JSON.stringify(data),
      warrantyMonths: 0,
      createdAt: new Date().toLocaleString("fr-FR"),
    };

    addRecord(record);
  };

  const handleReportCancel = () => {
    setStep("info");
  };

  const handlePrint = useCallback(() => {
    if (conditionReportData) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Rapport d'État - ${conditionReportData.reportNumber}</title>
              <style>
                @media print {
                  body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                  .page-break { page-break-after: always; }
                }
                body { font-family: Arial, sans-serif; }
              </style>
            </head>
            <body>
              <div id="print-content"></div>
              <script>
                const content = document.getElementById('print-content');
                const data = ${JSON.stringify(conditionReportData)};
                content.innerHTML = \`
                  <div style="padding: 20px;">
                    <h1 style="text-align: center;">RAPPORT D'ÉTAT DE L'APPAREIL</h1>
                    <p style="text-align: center;">N° \${data.reportNumber}</p>
                    <hr/>
                    <h2>EXEMPLAIRE CLIENT</h2>
                    <p><strong>Client:</strong> \${data.clientTitle} \${data.clientName}</p>
                    <p><strong>Appareil:</strong> \${data.deviceType} - \${data.brandModel}</p>
                    <p><strong>Date:</strong> \${data.createdAt}</p>
                    \${data.preExistingIssues.length > 0 ? \`<h3 style="color: red;">Problèmes constatés:</h3><ul>\${data.preExistingIssues.map(i => \`<li>\${i}</li>\`).join('')}</ul>\` : '<p style="color: green;">Aucun problème préexistant constaté</p>'}
                    \${data.customPreExistingIssues ? \`<p><em>\${data.customPreExistingIssues}</em></p>\` : ''}
                    <br/><br/>
                    <p><strong>Conditions:</strong> Garantie 3 mois. L'atelier n'est pas responsable des données. Récupération sous 30 jours.</p>
                    <br/><br/>
                    <p><strong>Signature Client:</strong></p>
                    <img src="\${data.clientSignature}" style="height: 60px; border: 1px solid #ccc;"/>
                    <p><strong>Signature Atelier:</strong></p>
                    <img src="\${data.technicianSignature}" style="height: 60px; border: 1px solid #ccc;"/>
                  </div>
                  <div style="page-break-before: always; padding: 20px;">
                    <h1 style="text-align: center;">RAPPORT D'ÉTAT DE L'APPAREIL</h1>
                    <p style="text-align: center;">N° \${data.reportNumber} - EXEMPLAIRE ATELIER</p>
                    <hr/>
                    <h2>À CONSERVER PAR REPAIR PRO</h2>
                    <p><strong>Client:</strong> \${data.clientTitle} \${data.clientName}</p>
                    <p><strong>Appareil:</strong> \${data.deviceType} - \${data.brandModel}</p>
                    <p><strong>Date:</strong> \${data.createdAt}</p>
                    \${data.preExistingIssues.length > 0 ? \`<h3 style="color: red;">Problèmes constatés:</h3><ul>\${data.preExistingIssues.map(i => \`<li>\${i}</li>\`).join('')}</ul>\` : '<p style="color: green;">Aucun problème préexistant constaté</p>'}
                    \${data.customPreExistingIssues ? \`<p><em>\${data.customPreExistingIssues}</em></p>\` : ''}
                    <br/>
                    <h3>Conditions complètes:</h3>
                    <p>1. L'appareil a été inspecté en présence du client.</p>
                    <p>2. Garantie 3 mois: couvre uniquement la réparation/pièces. Exclusions: dommages accidentels, oxydation, chutes.</p>
                    <p>3. Récupération sous 30 jours après notification.</p>
                    <p>4. L'atelier n'est pas responsable des données. Sauvegarde obligatoire avant dépose.</p>
                    <p>5. Frais de diagnostic 15-30€ si irréparable.</p>
                    <p>6. Non-récupération après 60 jours = vente pour couvrir les frais.</p>
                    <br/><br/>
                    <p><strong>Signature Client:</strong></p>
                    <img src="\${data.clientSignature}" style="height: 60px; border: 1px solid #ccc;"/>
                    <p><strong>Signature Atelier (Louis):</strong></p>
                    <img src="\${data.technicianSignature}" style="height: 60px; border: 1px solid #ccc;"/>
                  </div>
                \`;
                window.print();
                window.close();
              <\/script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  }, [conditionReportData]);

  useEffect(() => {
    if (conditionReportData) {
      router.push("/repairs");
    }
  }, [conditionReportData, router]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <PenTool className="w-6 h-6" />
          </div>
          Nouvelle Prise en charge
        </h2>
        <p className="text-slate-500">
          {step === "info" 
            ? "Étape 1/2 : Informations client et appareil"
            : "Étape 2/2 : Rapport d'état de l'appareil (protection légale)"
          }
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-6">
          {/* Civilité et Nom */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Civilité *
              </label>
              <select
                value={effectiveTitle}
                onChange={(e) => setClientTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none bg-white font-medium"
              >
                {CIVILITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                Nom complet du client *
                {detectedTitle && (
                  <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                    Détecté: {detectedTitle}
                  </span>
                )}
              </label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Marie Dupont"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              Téléphone *
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: 06 12 34 56 78"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Adresse Postale (Facturation)
            </label>
            <AddressAutocomplete
              value={address}
              onChange={setAddress}
              placeholder="Commencez à écrire une adresse..."
            />
          </div>

          {/* Appareil */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <DeviceIcon className="w-4 h-4 text-slate-400" />
                Catégorie *
              </label>
              <select
                value={deviceType}
                onChange={handleDeviceTypeChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none font-medium bg-slate-50"
              >
                {DEVICE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            
            {deviceType !== "Autre" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Marque *</label>
                <select
                  value={deviceBrand}
                  onChange={handleBrandChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none font-medium bg-slate-50"
                >
                  <option value="" disabled>Choisir...</option>
                  {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            )}

            {deviceType !== "Autre" && deviceBrand !== "" && deviceBrand !== "Autre" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Modèle *</label>
                <select
                  value={deviceModel}
                  onChange={e => setDeviceModel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none font-medium bg-slate-50"
                >
                  <option value="" disabled>Choisir...</option>
                  {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}
            
            {(deviceType === "Autre" || deviceBrand === "Autre" || deviceModel === "Autre") && (
              <div className={deviceType === "Autre" ? "md:col-span-2" : ""}>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Précisez *</label>
                <input
                  value={customBrandModel}
                  onChange={e => setCustomBrandModel(e.target.value)}
                  placeholder="Ex: OnePlus 9 Pro..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none font-medium"
                />
              </div>
            )}
          </div>

          {/* Problème */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-slate-400" />
              Problème déclaré *
            </label>
            <textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="Décrivez le problème constaté par le client..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Photos */}
          <div>
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-500" />
              Photos de l&apos;appareil (optionnel)
            </h4>
            <div className="flex flex-wrap gap-4">
              {photos.map((photo, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-slate-200">
                  <img src={photo} alt={`Photo ${i + 1}`} className="object-cover w-full h-full" />
                  <button 
                    onClick={() => setPhotos(photos.filter((_, index) => index !== i))} 
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 border-2 border-dashed border-indigo-300 rounded-lg flex flex-col items-center justify-center text-indigo-500 cursor-pointer hover:bg-indigo-50 transition-colors">
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold uppercase text-center leading-tight">Ajouter<br/>Photo</span>
                <input type="file" accept="image/*" capture="environment" multiple onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border-2 border-red-200 text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-4 pt-4">
            {step === "report" ? (
              <>
                <button
                  onClick={handleReportCancel}
                  className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  ← Retour
                </button>
                <button
                  onClick={proceedToReport}
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex justify-center items-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Passer au Rapport d&apos;État
                </button>
              </>
            ) : (
              <button
                onClick={proceedToReport}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex justify-center items-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Continuer vers le Rapport d&apos;État (Protection Légale)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Condition Report Modal */}
      {step === "report" && (
        <ConditionReport
          clientName={clientName}
          clientTitle={effectiveTitle}
          deviceType={deviceType}
          brandModel={deviceType === "Autre" || deviceBrand === "Autre" || deviceModel === "Autre"
            ? customBrandModel
            : `${deviceBrand} ${deviceModel}`.trim()}
          onComplete={handleReportComplete}
          onCancel={handleReportCancel}
        />
      )}
    </div>
  );
}
