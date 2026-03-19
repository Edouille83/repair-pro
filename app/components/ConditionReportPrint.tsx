"use client";

import React, { forwardRef } from "react";
import { ConditionReportData } from "./ConditionReport";

type ConditionReportPrintProps = { reportData: ConditionReportData | null };

const INITIAL_CHECKLIST_LABELS: Record<string, string> = {
  screenCracked: "Écran cassé/fissuré",
  screenScratched: "Écran rayé",
  screenDeadPixels: "Pixels morts identifiés",
  screenDiscoloration: "Décoloration de l'écran",
  screenNotResponding: "Écran tactile ne répond plus",
  screenBacklight: "Problème rétroéclairage",
  buttonsVolume: "Boutons volume HS",
  buttonsPower: "Bouton power HS",
  buttonsHome: "Bouton home HS",
  chargingPort: "Port de charge défaillant",
  headphoneJack: "Prise casque HS",
  usbPort: "Port USB HS",
  speakersNotWorking: "Haut-parleurs ne fonctionnent pas",
  microphoneNotWorking: "Microphone ne fonctionne pas",
  noSoundCalls: "Pas de son en appel",
  cameraFront: "Caméra avant HS",
  cameraBack: "Caméra arrière HS",
  flashNotWorking: "Flash/Led HS",
  wifiNotWorking: "WiFi ne fonctionne pas",
  bluetoothNotWorking: "Bluetooth ne fonctionne pas",
  noCellular: "Réseau cellulaire ne marche pas",
  simNotDetected: "SIM non détectée",
  batterySwollen: "Batterie gonflée",
  batteryDraining: "Batterie se décharge rapidement",
  notCharging: "Ne charge pas",
  notTurningOn: "Ne s'allume plus",
  randomlyShutsOff: "S'éteint tout seul",
  touchIdNotWorking: "Touch ID HS",
  faceIdNotWorking: "Face ID HS",
  passcodeNotWorking: "Code/Pattern ne marche pas",
  overheating: "Surchauffe",
  waterDamage: "Traces d'oxydation/eau",
  speakerRattle: "Haut-parleur grésille",
  wifiAntenna: "Antenne WiFi",
  nfcNotWorking: "NFC HS",
  overallScratched: "Coque/boîtier rayé",
  overallDented: "Coque/boîtier enfoncé",
  overallBroken: "Coque/boîtier cassé",
  screenBurn: "Burn-in OLED",
  falseTouches: "Faux contacts tactiles",
};

export const ConditionReportPrint = forwardRef<HTMLDivElement, ConditionReportPrintProps>(({ reportData }, ref) => {
  if (!reportData) return null;

  const hasIssues = reportData.preExistingIssues.length > 0 || reportData.customPreExistingIssues;

  return (
    <div ref={ref} className="bg-white">
      {/* COPIE CLIENT */}
      <div className="p-4 mb-6 border-b-2 border-dashed border-slate-300">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
          <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">EXEMPLAIRE CLIENT</span>
          <span className="text-xs text-slate-500">À conserver par le client</span>
        </div>

        <div className="text-center mb-4">
          <h1 className="text-lg font-black text-slate-900">RAPPORT D&apos;ÉTAT DE L&apos;APPAREIL</h1>
          <p className="text-xs text-slate-500 font-medium">N° {reportData.reportNumber}</p>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 mb-3">
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="text-slate-500 font-medium w-20">Client</td>
                <td className="font-bold">{reportData.clientTitle} {reportData.clientName}</td>
              </tr>
              <tr>
                <td className="text-slate-500 font-medium">Appareil</td>
                <td className="font-bold">{reportData.deviceType} - {reportData.brandModel}</td>
              </tr>
              <tr>
                <td className="text-slate-500 font-medium">Date</td>
                <td className="font-bold">{reportData.createdAt}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {hasIssues ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
            <p className="text-xs font-bold text-red-700 mb-2">⚠️ PROBLÈMES CONSTATÉS AVANT RÉPARATION :</p>
            <ul className="text-xs text-red-800 space-y-1">
              {reportData.preExistingIssues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>{issue}</span>
                </li>
              ))}
              {reportData.customPreExistingIssues && (
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span className="italic">{reportData.customPreExistingIssues}</span>
                </li>
              )}
            </ul>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
            <p className="text-xs font-bold text-emerald-700">✓ Aucun problème préexistant constaté</p>
          </div>
        )}

        <div className="text-[10px] text-slate-600 mb-3 leading-relaxed">
          <p className="font-bold mb-1">Conditions :</p>
          <p>La garantie de 3 mois couvre uniquement la réparation effectuée. Elle ne couvre pas les dommages accidentels, l&apos;oxydation, ni les chutes. Le client doit récupérer l&apos;appareil sous 30 jours après notification. L&apos;atelier n&apos;est pas responsable des données présentes sur l&apos;appareil.</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="w-32">
            <p className="text-[10px] text-slate-500 mb-1">Signature Client :</p>
            <img src={reportData.clientSignature} alt="Signature client" className="h-12 bg-white border rounded" />
          </div>
          <div className="w-32">
            <p className="text-[10px] text-slate-500 mb-1">Signature Atelier :</p>
            <img src={reportData.technicianSignature} alt="Signature technicien" className="h-12 bg-white border rounded" />
          </div>
        </div>
      </div>

      {/* COPIE ATELIER */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
          <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">EXEMPLAIRE ATELIER</span>
          <span className="text-xs text-slate-500">À conserver par Repair Pro</span>
        </div>

        <div className="text-center mb-4">
          <h1 className="text-lg font-black text-slate-900">RAPPORT D&apos;ÉTAT DE L&apos;APPAREIL</h1>
          <p className="text-xs text-slate-500 font-medium">N° {reportData.reportNumber}</p>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 mb-3">
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="text-slate-500 font-medium w-20">Client</td>
                <td className="font-bold">{reportData.clientTitle} {reportData.clientName}</td>
              </tr>
              <tr>
                <td className="text-slate-500 font-medium">Appareil</td>
                <td className="font-bold">{reportData.deviceType} - {reportData.brandModel}</td>
              </tr>
              <tr>
                <td className="text-slate-500 font-medium">Date</td>
                <td className="font-bold">{reportData.createdAt}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {hasIssues ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
            <p className="text-xs font-bold text-red-700 mb-2">⚠️ PROBLÈMES CONSTATÉS AVANT RÉPARATION :</p>
            <ul className="text-xs text-red-800 space-y-1">
              {reportData.preExistingIssues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>{issue}</span>
                </li>
              ))}
              {reportData.customPreExistingIssues && (
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span className="italic">{reportData.customPreExistingIssues}</span>
                </li>
              )}
            </ul>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
            <p className="text-xs font-bold text-emerald-700">✓ Aucun problème préexistant constaté</p>
          </div>
        )}

        <div className="text-[10px] text-slate-600 mb-3 leading-relaxed p-3 bg-slate-100 rounded">
          <p className="font-bold mb-1">Conditions complètes acceptées par le client :</p>
          <p>1. L&apos;appareil a été inspecté en présence du client. L&apos;état ci-dessus est exact.</p>
          <p>2. Garantie 3 mois : couvre uniquement la réparation/pièces更换. Exclusions : dommages accidentels, oxydation, chutes, contacts liquides post-réparation.</p>
          <p>3. Récupération sous 30 jours après notification. Passé ce délai, l&apos;atelier décline toute responsabilité.</p>
          <p>4. L&apos;atelier n&apos;est pas responsable des données. Sauvegarde obligatoire avant dépose.</p>
          <p>5. Frais de diagnostic 15-30€ si irréparable ou renoncement.</p>
          <p>6. Non-récupération après 60 jours = vente pour couvrir les frais.</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="w-32">
            <p className="text-[10px] text-slate-500 mb-1">Signature Client :</p>
            <img src={reportData.clientSignature} alt="Signature client" className="h-12 bg-white border rounded" />
          </div>
          <div className="w-32">
            <p className="text-[10px] text-slate-500 mb-1">Signature Atelier (Louis) :</p>
            <img src={reportData.technicianSignature} alt="Signature technicien" className="h-12 bg-white border rounded" />
          </div>
        </div>
      </div>
    </div>
  );
});

ConditionReportPrint.displayName = "ConditionReportPrint";
