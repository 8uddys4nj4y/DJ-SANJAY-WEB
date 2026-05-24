import React from "react";
import { ShieldAlert, Music } from "lucide-react";

interface HtmlInvoicePreviewProps {
  packageType: 'silver' | 'gold' | 'custom';
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerPhone: string;
  customerDistrict: string;
  customerArea: string;
  customerLocation: string;
  selectedItems: string[];
  packageItems: { id: string; label: string; compulsory?: boolean }[];
  totalPrice: number;
}

export function HtmlInvoicePreview({
  packageType,
  invoiceNumber,
  invoiceDate,
  customerName,
  customerPhone,
  customerDistrict,
  customerArea,
  customerLocation,
  selectedItems,
  packageItems,
  totalPrice
}: HtmlInvoicePreviewProps) {
  // Filter items that are part of this booking
  const itemsToDisplay = packageItems.filter(item => selectedItems.includes(item.id));

  // Determine packaging label and display details
  const displayPackageName = packageType.charAt(0).toUpperCase() + packageType.slice(1);

  return (
    <div className="bg-white text-zinc-900 rounded-3xl p-6 md:p-8 font-sans shadow-2xl max-w-2xl mx-auto border border-zinc-200 overflow-hidden relative">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 to-red-800" />

      {/* Invoice Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-100 pb-6 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="bg-red-600 text-white p-2 rounded-xl">
              <Music size={24} className="animate-pulse" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-zinc-950 uppercase font-headline">
              DJ SANJAY
            </h2>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 tracking-[0.25em] uppercase mt-1 pl-1">
            Premium Sound & Lights
          </p>
        </div>
        <div className="text-left md:text-right mt-4 md:mt-0 font-mono">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Invoice Ref</div>
          <div className="text-sm font-bold text-zinc-800">{invoiceNumber}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">Date</div>
          <div className="text-xs text-zinc-600">{invoiceDate}</div>
        </div>
      </div>

      {/* Client & Booking Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
          <h4 className="font-bold text-[10px] uppercase tracking-wider text-zinc-400 mb-2 border-b border-zinc-200 pb-1">
            Client Details (Bill To)
          </h4>
          <div className="space-y-1">
            <p className="font-bold text-zinc-800 uppercase">{customerName}</p>
            <p className="text-xs text-zinc-500 font-mono">{customerPhone}</p>
            <div className="text-xs text-zinc-600 mt-2 whitespace-pre-line leading-relaxed">
              District: {customerDistrict}
              {"\n"}Address: {customerLocation || customerArea}
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-[10px] uppercase tracking-wider text-zinc-400 mb-2 border-b border-zinc-200 pb-1">
              Event Details
            </h4>
            <div className="space-y-1">
              <p className="font-bold text-zinc-800 uppercase">{displayPackageName} Package</p>
              <p className="text-xs text-zinc-600">Status: <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px] uppercase">Under Verification</span></p>
            </div>
          </div>
          <div className="mt-4 text-zinc-400 text-[10px] leading-tight font-mono">
            Generated via official portal.
          </div>
        </div>
      </div>

      {/* Itemized Table */}
      <div className="border border-zinc-200 rounded-2xl overflow-hidden mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-red-600 text-white font-bold text-xs uppercase tracking-wider">
              <th className="py-3 px-4">Item Description</th>
              <th className="py-3 px-4 text-center w-20">Qty</th>
              <th className="py-3 px-4 text-right w-28">Included</th>
            </tr>
          </thead>
          <tbody className="text-xs text-zinc-700 divide-y divide-zinc-100">
            {itemsToDisplay.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-zinc-50"}>
                <td className="py-3 px-4 font-medium text-zinc-800">{item.label}</td>
                <td className="py-3 px-4 text-center font-mono">1</td>
                <td className="py-3 px-4 text-right text-emerald-600 font-bold">Yes</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transportation Alert */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl mb-6 flex items-start space-x-3">
        <ShieldAlert className="shrink-0 text-amber-600 mt-0.5" size={16} />
        <p className="text-[10px] font-semibold text-amber-800 leading-relaxed uppercase">
          Important: Transportation & logistics charges will be verified and added post-booking confirmation.
        </p>
      </div>

      {/* Totals Section */}
      <div className="border-t border-zinc-200 pt-6 flex justify-between items-center">
        <div className="text-[10px] font-mono text-zinc-400">
          Timestamp: {new Date().toLocaleString()}
        </div>
        <div className="text-right">
          <span className="text-zinc-400 font-bold mr-2 text-xs uppercase tracking-wider">Total Est. Quote</span>
          <span className="text-3xl font-black text-zinc-900 tracking-tight">
            ₹{totalPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
