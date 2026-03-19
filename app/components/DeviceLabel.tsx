"use client";

import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

interface DeviceLabelProps {
  invoiceRef: string;
  clientName: string;
  clientPhone: string;
  deviceType: string;
  brandModel: string;
  createdAt: string;
  status: string;
}

export const DeviceLabel = forwardRef<HTMLDivElement, DeviceLabelProps>(({
  invoiceRef,
  clientName,
  clientPhone,
  deviceType,
  brandModel,
  createdAt,
  status,
}, ref) => {
  const trackingUrl = `https://repairpro.app/suivi?ref=${invoiceRef}`;

  return (
    <div ref={ref} className="bg-white p-3">
      {/* Étiquette principale */}
      <div className="border-2 border-dashed border-indigo-400 rounded-xl p-3 bg-gradient-to-br from-indigo-50 to-purple-50">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-indigo-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">RP</span>
            </div>
            <div>
              <p className="text-xs font-black text-indigo-700">REPAIR PRO</p>
              <p className="text-[9px] text-slate-500">Atelier de Réparation</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500">N° Ticket</p>
            <p className="font-black text-indigo-700 text-sm">{invoiceRef}</p>
          </div>
        </div>

        {/* QR Code et Info */}
        <div className="flex gap-3 mb-2">
          <div className="flex-shrink-0">
            <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-200">
              <QRCodeSVG 
                value={trackingUrl} 
                size={64} 
                level="M" 
                fgColor="#4F46E5" 
                bgColor="#FFFFFF" 
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="space-y-1">
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-wide">Client</p>
                <p className="font-bold text-slate-800 text-sm truncate">{clientName}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-wide">Téléphone</p>
                <p className="font-semibold text-slate-700 text-xs">{clientPhone}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-wide">Statut</p>
                <p className="font-bold text-indigo-600 text-xs">{status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appareil */}
        <div className="bg-white rounded-lg p-2 mb-2 border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">📱</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate">{brandModel}</p>
              <p className="text-[10px] text-slate-500">{deviceType}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[9px] text-slate-500 pt-2 border-t border-indigo-100">
          <span>📅 {createdAt}</span>
          <span className="text-indigo-600 font-semibold">Scannez pour suivre</span>
        </div>
      </div>

      {/* Petite étiquette de suivi (optionnelle - à coller sur l'appareil) */}
      <div className="mt-3 pt-3 border-t border-dashed border-slate-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white px-2 py-1 rounded font-black text-xs">
              {invoiceRef.split("-")[2]}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs">{clientName}</p>
              <p className="text-[9px] text-slate-500">{clientPhone}</p>
            </div>
          </div>
          <QRCodeSVG 
            value={`${invoiceRef}`} 
            size={40} 
            level="L" 
            fgColor="#4F46E5" 
            bgColor="#FFFFFF" 
          />
        </div>
      </div>
    </div>
  );
});

DeviceLabel.displayName = "DeviceLabel";

// Étiquettes multiples pour impression
export function DeviceLabelPrint({ repairs }: { repairs: DeviceLabelProps[] }) {
  return (
    <div className="p-4">
      <style>{`
        @media print {
          @page { size: 80mm 50mm; margin: 0; }
          body { margin: 0; padding: 0; }
        }
      `}</style>
      <div className="grid grid-cols-1 gap-4">
        {repairs.map((repair) => (
          <DeviceLabel key={repair.invoiceRef} {...repair} />
        ))}
      </div>
    </div>
  );
}
