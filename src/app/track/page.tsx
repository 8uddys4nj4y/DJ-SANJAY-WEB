"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, XCircle, Loader2, CalendarDays, MapPin, Phone, User, Package, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/context/TranslationContext";

const STATUS_CONFIG = {
  "under verification": { step: 1, label: "Verifying" },
  confirmed: { step: 2, label: "Confirmed" },
  dispatched: { step: 3, label: "Dispatched" },
  completed: { step: 4, label: "Completed" },
  rejected: { step: 0, label: "Rejected" },
};

const normalizeBooking = (booking: any = {}) => {
  const formData = booking.form_data && typeof booking.form_data === "object" ? booking.form_data : {};

  return {
    ...booking,
    refNumber: booking.refNumber ?? booking.reference_number ?? booking.ref_num ?? "",
    name: booking.name ?? formData.name ?? "Guest",
    phone: booking.phone ?? formData.phone ?? "N/A",
    address: booking.address ?? formData.address ?? "",
    packageType: booking.packageType ?? booking.package_type ?? "Custom",
    eventType: booking.eventType ?? booking.event_type ?? "Custom Event",
    date: booking.date ?? booking.event_date ?? "",
    area: booking.area ?? "",
    district: booking.district ?? "",
    totalPrice: booking.totalPrice ?? booking.total_price ?? null,
    status: booking.status ?? "under verification",
  };
};

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
      <Icon className="mt-0.5 text-primary" size={16} />
      <div className="space-y-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</div>
        <div className="text-sm font-semibold text-white">{value}</div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBooking, setActiveBooking] = useState<any | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedRef = searchQuery.trim();
    if (!trimmedRef) return;

    try {
      setSearchLoading(true);
      setSearchError(null);
      setActiveBooking(null);

      const response = await fetch(`/api/track?ref=${encodeURIComponent(trimmedRef)}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load booking.");
      }

      if (!payload.booking) {
        setSearchError("No Records Found");
        return;
      }

      setActiveBooking(normalizeBooking(payload.booking));
    } catch (err) {
      console.error("Error searching booking:", err);
      setSearchError(err instanceof Error ? err.message : "No Records Found");
      setActiveBooking(null);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 container mx-auto max-w-4xl space-y-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-white">{t("Track Booking")}</h1>
        <p className="text-zinc-500 text-sm">{t("Real-time status of your event")}</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("Reference (e.g. NS-1234)")}
            className="pl-10 h-11 bg-zinc-900 border-zinc-800 text-sm rounded-xl text-white placeholder-zinc-600"
          />
        </div>
        <Button type="submit" disabled={searchLoading} className="h-11 bg-primary text-black font-bold px-6 rounded-xl text-xs">
          {searchLoading ? <Loader2 className="animate-spin text-black" size={16} /> : t("SEARCH")}
        </Button>
      </form>

      {activeBooking ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/40 p-6 md:p-10 rounded-[2rem] border border-white/5 space-y-8 max-w-3xl mx-auto backdrop-blur-md professional-shadow"
        >
          <div className="flex flex-col gap-4 border-b border-white/5 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1">{t("Status")}</div>
              <div
                className={`text-2xl font-headline font-bold uppercase ${
                  activeBooking.status === "rejected" ? "text-destructive" : "text-primary"
                }`}
              >
                {activeBooking.status}
              </div>
            </div>
            <div className="text-left md:text-right">
              <div className="text-[9px] text-zinc-500 font-black tracking-widest uppercase mb-1">{t("Ref ID")}</div>
              <div className="font-mono text-xl text-white font-bold">{activeBooking.refNumber}</div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <InfoRow icon={User} label="Name" value={activeBooking.name} />
            <InfoRow icon={Phone} label="Phone" value={activeBooking.phone} />
            <InfoRow icon={CalendarDays} label="Event Date" value={activeBooking.date || "Not provided"} />
            <InfoRow icon={Package} label="Package" value={activeBooking.packageType} />
            <InfoRow
              icon={MapPin}
              label="Location"
              value={[activeBooking.area, activeBooking.district].filter(Boolean).join(", ") || "Not provided"}
            />
            <InfoRow
              icon={Wallet}
              label="Amount"
              value={activeBooking.totalPrice ? `₹${Number(activeBooking.totalPrice).toLocaleString()}` : "Pending"}
            />
          </div>

          {activeBooking.address ? (
            <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Address</div>
              <div className="text-sm text-white">{activeBooking.address}</div>
            </div>
          ) : null}

          {activeBooking.status === "rejected" ? (
            <div className="flex items-center space-x-3 bg-destructive/10 p-4 rounded-xl border border-destructive/20 text-destructive text-xs">
              <XCircle size={18} />
              <span>Your booking request was rejected. Please contact our support line at 9962205244.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <Progress value={((STATUS_CONFIG[activeBooking.status as keyof typeof STATUS_CONFIG]?.step || 1) / 4) * 100} className="h-2 bg-black" />
              <div className="grid grid-cols-4 text-[8px] font-black text-zinc-600 tracking-widest uppercase">
                <span className={`text-left ${activeBooking.status === "under verification" ? "text-primary" : ""}`}>{t("Received")}</span>
                <span className={`text-center ${activeBooking.status === "confirmed" ? "text-primary" : ""}`}>{t("Verified")}</span>
                <span className={`text-center ${activeBooking.status === "dispatched" ? "text-primary" : ""}`}>{t("Dispatched")}</span>
                <span className={`text-right ${activeBooking.status === "completed" ? "text-primary" : ""}`}>{t("Live")}</span>
              </div>
            </div>
          )}
        </motion.div>
      ) : searchQuery && !searchLoading ? (
        <div className="text-center py-12 bg-zinc-900/30 rounded-3xl border border-white/5 max-w-3xl mx-auto">
          <XCircle className="mx-auto mb-4 text-destructive/50" size={32} />
          <h3 className="text-sm font-bold text-white">{searchError || t("No Records Found")}</h3>
        </div>
      ) : null}
    </div>
  );
}
