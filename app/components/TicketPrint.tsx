import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { IntakeRecord } from "../store/StoreProvider";

type TicketProps = { ticketData: IntakeRecord | null };

const detectGender = (name: string): string => {
  const firstName = name.trim().split(" ")[0].toLowerCase();
  
  const femaleEndings = ["a", "e", "ie", "ine", "anne", "enne", "ette", "elle", "ion", "cie", "cie", "ny", "ly", "ty", "gy", "py", "my", "ry", "vy", "xy", "zy", "don", "ron", "ton", "non", "son", "lin", "dine", "lane", "rane", "vane", "nane"];
  const maleEndings = ["e", "ien", "on", "an", "and", "aud", "eau", "ier", "oux", "oux", "ard", "ert", "ort", "ain", "ein", "oin", "uel", "uel", "ric", "lic", "nic", "mic", "dic", "vic", "ric"];
  
  const femaleNames = ["marie", "sophie", "nathalie", "caroline", "marine", "ludivine", "catherine", "valerie", "stephanie", "sandrine", "emilie", "julie", "charlotte", "amandine", "camille", "justine", "alexandra", "sandra", "patricia", "corinne", "isabelle", "martine", "brigitte", "danielle", "francoise", "monique", "bernadette", "anne", "nicole", "hélène", "sylvie", "laurence", "muriel", "florence", "celine", "audrey", "kim", "lina", "mia", "zoe", "emma", "lena", "lea", "chloe", "alice", "clara", "anna", "sofia", "lola", "nina", "mia", "lucy", "diana", "elena", "ines", "lisa", "zoe", "eva", "iris", "lily", "noa", "luna", "mila", "nora", "luna", "mila", "nora", "luna", "mila", "nora", "ayana", "lucia", "lucie", "amy", "estelle", "erika", "sara", "melissa", "nadia", "fanny", "clementine", "adeline", "angelique", "claire", "margaux", "manon", "amelie", "melanie", "eleonore", "eleonora", "roxy", "elsa", "elisa", "lise", "lise", "celia", "lara", "nour", "fatima", "imene", "djeneba", "aicha", "fatou", "khady", "mareme", "耦合"];
  
  const maleNames = ["jean", "pierre", "michel", "andre", "jean-luc", "philippe", "patrick", "stephane", "nicolas", "frederic", "thomas", "olivier", "alexandre", "antoine", "sebastien", "vincent", "ludovic", "arnaud", "david", "julien", "michael", "jerome", "franck", "pascal", "gilles", "yves", "christophe", "bruno", "denis", "jacques", "robert", "paul", "henri", "georges", "albert", "emile", "louis", "alexis", "eddy", "edouard", "ahmed", "brahim", "youssef", "mamadou", "ousmane", "ibrahima", "abdou", "moussa", "bakary", "ali", "modou", "abdoulaye", "ibrahima", "moustapha", "souleymane", "issaga", "abdoul", "hamidou", "boubacar", "seydou", "drissa", "brahim", "abdoulaye", "lassana", "mamadou", "oumar", "birama", "sadibou", "oumou", "fatou", "kadiatou", "mariam", "aminata", "fatoumata", "aissata", "mariama", "fanta", "djeneba", "kadiatou", "moussa", "mamadou", "abdoulaye", "ibrahima", "ousmane", "souleymane", "ali", "ahmed", "moustapha", "modou", "abdou", "babacar", "saliou", "papis", "moussa", "abdoul", "hamidou", "boubacar", "sadibou", "lassana", "drissa", "seydou", "brahim", "bakary"];
  
  if (femaleNames.includes(firstName)) return "Mme";
  if (maleNames.includes(firstName)) return "Mr";
  
  return "";
};

export const TicketPrint = forwardRef<HTMLDivElement, TicketProps>(({ ticketData }, ref) => {
  if (!ticketData) return null;

  const gender = detectGender(ticketData.clientName);
  const greeting = gender ? `Bonjour ${gender}. ${ticketData.clientName.split(" ")[0]}` : `Bonjour ${ticketData.clientName.split(" ")[0]}`;

  return (
    <div ref={ref} className="p-6 w-[80mm] bg-gradient-to-b from-white to-gray-50 font-sans text-black mx-auto" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 mb-3 shadow-lg">
          <span className="text-white text-2xl font-black">R</span>
        </div>
        <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Repair Pro</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold">Atelier de Réparation</p>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 mb-5 text-white text-center shadow-lg">
        <div className="text-[10px] uppercase tracking-widest opacity-80 mb-1">N° Facture</div>
        <div className="text-3xl font-black">{ticketData.invoiceRef || `RP-${new Date().getFullYear()}-${String(ticketData.id).padStart(5, "0")}`}</div>
      </div>

      <div className="bg-white rounded-xl p-4 mb-4 shadow-md border border-gray-100">
        <p className="text-sm font-bold text-center mb-4 text-gray-800">{greeting},</p>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-600 font-bold text-xs">📱</span>
            </div>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Appareil</div>
              <div className="font-bold text-gray-900">{ticketData.brandModel}</div>
              <div className="text-xs text-gray-500">{ticketData.deviceType}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-600 font-bold text-xs">⚠</span>
            </div>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Problème</div>
              <div className="text-sm text-gray-700 leading-snug">{ticketData.issue}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-xs">📞</span>
            </div>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Téléphone</div>
              <div className="font-semibold text-gray-800">{ticketData.phone}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <div className="p-2 bg-white rounded-xl shadow-md border border-gray-100">
          <QRCodeSVG value={`${typeof window !== 'undefined' ? window.location.origin : 'https://repairpro.app'}/suivi?ref=${ticketData.invoiceRef}`} size={120} level="M" fgColor="#4F46E5" bgColor="#FFFFFF" includeMargin={true} />
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-gray-500 leading-relaxed mb-2">
          Scannez le QR code pour suivre<br />l&apos;avancement de votre réparation
        </p>
      </div>

      <div className="mt-5 pt-4 border-t-2 border-dashed border-gray-200">
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="text-gray-400">Date</span>
          <span className="font-bold text-gray-700">{ticketData.createdAt}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">Statut</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
            {ticketData.status}
          </span>
        </div>
      </div>

      <div className="mt-5 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-[10px] font-bold">
          <span>✨</span> Merci pour votre confiance <span>✨</span>
        </div>
      </div>
    </div>
  );
});

TicketPrint.displayName = "TicketPrint";
