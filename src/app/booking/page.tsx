"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Printer, Music2, Download, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/firebase";
import { Badge } from "@/components/ui/badge";
import { generateInvoice, getInvoicePreviewUrl } from "@/app/utils/generateInvoice";
import { useTranslation } from "@/context/TranslationContext";

const STEPS = ["Items", "Details", "Checkout"];

const PACKAGE_ITEMS = {
  silver: [
    { id: "spk", label: "Top Speakers (2x)", compulsory: true, image: "/silver-package/top_speaker_silver-package-removebg-preview.png" },
    { id: "sub", label: "18-Inch Subwoofers (2x)", compulsory: true, image: "/common4packages/bass_speaker_both-package.png" },
    { id: "light", label: "Pargon Lights (4x)", compulsory: true, image: "/common4packages/par_lighr-Photoroom.png" },
    { id: "smoke", label: "Smoke Machine (1x)", compulsory: true, image: "/silver-package/smoke-machine-removebg-preview.png" },
    { id: "moving", label: "LED Mini Moving Light (1x)", compulsory: true, image: "/silver-package/moving-head-led-light-removebg-preview.png" },
    { id: "laser", label: "Mini Laser (2x)", compulsory: true, image: "/silver-package/mini_laser_silver-package.png" },
    { id: "player", label: "DJ Player (1x)", compulsory: true, image: "/common4packages/roland-dj202-removebg-preview.png" },
    { id: "station", label: "DJ Station (1x)", compulsory: true, image: "/common4packages/roland-dj202-removebg-preview.png" },
  ],
  gold: [
    { id: "spk", label: "Top Speakers (2x)", compulsory: true, image: "/gold-package/top_speaker_gold-package-removebg-preview.png" },
    { id: "sub", label: "Premium Subwoofers (2x)", compulsory: true, image: "/common4packages/bass_speaker_both-package.png" },
    { id: "light", label: "Pargon Lights (6x)", compulsory: true, image: "/common4packages/par_lighr-Photoroom.png" },
    { id: "smoke", label: "Industrial Smoker (1x)", compulsory: true, image: "/common4packages/smoke-machine-removebg-preview.png" },
    { id: "laser", label: "High-Power Laser (1x)", compulsory: true, image: "/gold-package/lasr_light_gold-package.webp" },
    { id: "player", label: "Pro DJ Player (1x)", compulsory: true, image: "/common4packages/roland-dj202-removebg-preview.png" },
    { id: "station", label: "DJ Station (1x)", compulsory: true, image: "/common4packages/roland-dj202-removebg-preview.png" },
  ],
  custom: [
    { id: "custom_eq", label: "Tailored Sound System", compulsory: true, image: "/common4packages/bass_speaker_both-package.png" },
    { id: "custom_dj", label: "Premium DJ Console", compulsory: true, image: "/common4packages/roland-dj202-removebg-preview.png" },
    { id: "custom_fx", label: "Custom Lighting & FX", compulsory: true, image: "/common4packages/par_lighr-Photoroom.png" },
  ]
};

function BookingPageContent() {
  const searchParams = useSearchParams();
  const { user, loading } = useUser();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [pkg, setPkg] = useState<"silver" | "gold" | "custom">((searchParams.get("package") as "silver" | "gold" | "custom") || "silver");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    district: "",
    area: "",
    eventType: "",
    location: ""
  });
  const [refNum, setRefNum] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [draftInvoiceNumber, setDraftInvoiceNumber] = useState("");
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    if (step === 3 && !draftInvoiceNumber) {
      setDraftInvoiceNumber("NS-" + Math.floor(1000 + Math.random() * 9000));
    }
  }, [step, draftInvoiceNumber]);

  // Build the invoice data object
  const getInvoiceData = useCallback(() => {
    if (pkg === "custom") return null;
    const formattedDetails = `${formData.name}\n${formData.district}\n${formData.location || formData.area}`;
    const invoiceDateStr = formData.date || new Date().toISOString().split('T')[0];
    return {
      packageType: pkg as 'silver' | 'gold',
      invoiceNumber: draftInvoiceNumber || "NS-XXXX",
      invoiceDate: invoiceDateStr,
      customerPhone: formData.phone,
      customerDetails: formattedDetails,
    };
  }, [pkg, formData, draftInvoiceNumber]);

  // Generate PDF preview when entering step 3
  useEffect(() => {
    if (step === 3 && pkg !== "custom" && draftInvoiceNumber) {
      setPdfLoading(true);
      const invoiceData = getInvoiceData();
      if (invoiceData) {
        getInvoicePreviewUrl(invoiceData)
          .then((url) => {
            setPdfPreviewUrl(url);
            setPdfLoading(false);
          })
          .catch((err) => {
            console.error('Failed to generate PDF preview:', err);
            setPdfLoading(false);
          });
      }
    }
    // Cleanup blob URL when leaving step 3
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
        setPdfPreviewUrl(null);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, draftInvoiceNumber]);

  const handleDownloadInvoice = async () => {
    const invoiceData = getInvoiceData();
    if (!invoiceData) return;
    await generateInvoice(invoiceData);
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.displayName || user.email?.split('@')[0] || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    const items = PACKAGE_ITEMS[pkg].map(i => i.id);
    setSelectedItems(items);
  }, [pkg]);

  const basePrice = pkg === "silver" ? 7500 : pkg === "gold" ? 8999 : 15000;

  const handleBooking = async () => {
    const finalRef = draftInvoiceNumber || ("NS-" + Math.floor(1000 + Math.random() * 9000));
    setRefNum(finalRef);
    setBookingError("");

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: user?.email ?? '',
          profileImage: user?.photoURL ?? '',
          date: formData.date,
          district: formData.district,
          area: formData.area,
          location: formData.location,
          address: `${formData.location || ''}, ${formData.area || ''}, ${formData.district || ''}`.trim(),
          eventType: formData.eventType,
          userId: user?.id ?? null,
          packageType: pkg,
          totalPrice: basePrice,
          refNumber: finalRef,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || `Booking failed with status ${response.status}`);
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("Booking error:", err);
      const message = err instanceof Error ? err.message : "Failed to submit booking. Please try again.";
      setBookingError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.phone && formData.date && formData.district && formData.area;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-24 pb-20 px-4 container mx-auto max-w-md text-center">
        <h2 className="text-2xl font-headline font-bold text-white mb-4">{t('Sign In Required')}</h2>
        <p className="text-zinc-400 mb-6">{t('Please sign in to book a DJ.')}</p>
        <Button asChild className="bg-primary text-black font-bold h-10 px-8 rounded-full">
          <Link href="/settings">{t('Go to Sign In')}</Link>
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 pt-24 pb-20">
        <div className="bg-zinc-900/60 p-6 rounded-3xl text-center max-w-sm border border-primary/10 backdrop-blur-md">
          <CheckCircle2 className="text-primary mx-auto mb-4" size={40} />
          <h2 className="text-xl font-headline font-bold mb-1 text-white">Booking Received</h2>
          <p className="text-zinc-500 mb-6 text-xs">Reference: <span className="text-white font-mono font-bold">{refNum}</span></p>
          <div className="space-y-2">
            <Button onClick={handleDownloadInvoice} variant="outline" className="w-full h-10 rounded-xl text-sm border-white/10 text-white">
              <Printer className="mr-2 h-4 w-4" /> Print Invoice
            </Button>
            <Button asChild className="w-full bg-primary text-black font-bold h-10 rounded-xl text-sm">
              <a href="/track">Track Status</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 container mx-auto max-w-3xl">
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur py-4 mb-6 border-b border-white/5">
        <div className="flex justify-between mb-2 px-1">
          {STEPS.map((s, i) => (
            <span key={i} className={`text-[9px] font-bold uppercase tracking-widest ${step >= i + 1 ? 'text-primary' : 'text-zinc-700'}`}>
              {t(s)}
            </span>
          ))}
        </div>
        <Progress value={(step / 3) * 100} className="h-1 bg-zinc-900" />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => setPkg("silver")} 
                className={`relative aspect-[3/4] rounded-2xl overflow-hidden border transition-all flex flex-col justify-end p-2 ${pkg === "silver" ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' : 'border-zinc-800 hover:border-zinc-700'}`}
              >
                <img src="/pamplet/silver-package-output.png" alt="Silver Package" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                <div className="z-10 text-left">
                  <div className="text-[8px] font-black text-secondary uppercase tracking-widest">Silver</div>
                  <div className="text-xs md:text-sm font-headline font-black text-primary">₹7,500</div>
                </div>
              </button>
              <button 
                onClick={() => setPkg("gold")} 
                className={`relative aspect-[3/4] rounded-2xl overflow-hidden border transition-all flex flex-col justify-end p-2 ${pkg === "gold" ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' : 'border-zinc-800 hover:border-zinc-700'}`}
              >
                <img src="/pamplet/gold-package-output.png" alt="Gold Package" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                <div className="z-10 text-left">
                  <div className="text-[8px] font-black text-accent uppercase tracking-widest">Gold</div>
                  <div className="text-xs md:text-sm font-headline font-black text-primary">₹8,999</div>
                </div>
              </button>
              <button 
                onClick={() => setPkg("custom")} 
                className={`relative aspect-[3/4] rounded-2xl border transition-all flex flex-col justify-between p-3 ${pkg === "custom" ? 'bg-zinc-900 border-primary ring-2 ring-primary/20 scale-[1.02]' : 'bg-black border-zinc-800 hover:border-zinc-700'}`}
              >
                <div className="text-left">
                  <div className="text-[8px] font-black text-primary uppercase tracking-widest">Custom</div>
                  <div className="text-xs md:text-sm font-headline font-black text-white leading-tight mt-1">Tailored Setup</div>
                </div>
                <div className="text-[10px] font-black text-primary text-left">TBD</div>
              </button>
            </div>

            <div className="bg-zinc-900/40 p-5 rounded-2xl border border-white/5 space-y-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center text-white"><Music2 className="mr-2 text-primary" size={18} /> {t('Items')}</h3>
                <Badge className="bg-destructive/10 text-destructive text-[7px] border-destructive/20 uppercase">Locked</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PACKAGE_ITEMS[pkg].map((item) => (
                  <div key={item.id} className="flex items-center p-3 bg-black/40 rounded-lg border border-white/5 opacity-80 gap-3">
                    {item.image && (
                      <div className="w-12 h-12 flex-shrink-0 relative flex items-center justify-center">
                        <img src={item.image} alt={item.label} className="max-w-full max-h-full object-contain drop-shadow-md" />
                      </div>
                    )}
                    <div className="flex-1 flex items-center space-x-2">
                      <Checkbox id={item.id} checked={true} disabled={true} className="border-primary h-3.5 w-3.5 flex-shrink-0" />
                      <Label htmlFor={item.id} className="text-[11px] font-medium text-zinc-400">{item.label}</Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-zinc-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
              <h3 className="text-base font-headline font-bold mb-4 text-primary">{t('Details')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-white">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase">{t('Name')} *</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 bg-black border-zinc-800 text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase">{t('Contact Number')} *</Label>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    minLength={10}
                    value={formData.phone}
                    onChange={e => {
                      // Only allow numbers, max 10 digits
                      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                      setFormData({ ...formData, phone: val });
                    }}
                    className="h-10 bg-black border-zinc-800 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase">Date *</Label>
                  <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="h-10 bg-black border-zinc-800 text-xs rounded-xl text-white [color-scheme:dark]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase">District *</Label>
                  <Select value={formData.district} onValueChange={v => setFormData({...formData, district: v})}>
                    <SelectTrigger className="h-10 bg-black border-zinc-800 text-xs rounded-xl text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="Chennai">Chennai</SelectItem>
                      <SelectItem value="Thiruvallur">Thiruvallur</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase">{t('Area / Address')} *</Label>
                  <Input value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="h-10 bg-black border-zinc-800 text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase">Event (Optional)</Label>
                  <Select value={formData.eventType} onValueChange={v => setFormData({...formData, eventType: v})}>
                    <SelectTrigger className="h-10 bg-black border-zinc-800 text-xs rounded-xl text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="Wedding">Wedding</SelectItem>
                      <SelectItem value="Birthday">Birthday</SelectItem>
                      <SelectItem value="Corporate">Corporate</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                <Label className="text-[10px] font-bold text-zinc-500 uppercase">Address / Hall Name</Label>
                <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="h-10 bg-black border-zinc-800 text-xs rounded-xl text-white" />
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {pkg === "custom" ? (
              <div className="bg-zinc-900/60 p-8 rounded-3xl text-center max-w-md mx-auto border border-primary/10 space-y-4 backdrop-blur-sm">
                <Music2 className="text-primary mx-auto animate-bounce" size={40} />
                <h3 className="text-lg font-headline font-bold text-white uppercase">Custom Package Invoice</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Custom setups are quoted manually based on your details, venue capacity, and duration. 
                  A detailed invoice will be shared with you post-verification.
                </p>
                <div className="bg-zinc-950 p-4 rounded-xl border border-white/5 text-left text-xs font-mono space-y-1.5 text-zinc-300">
                  <p><span className="text-zinc-500">Client:</span> {formData.name}</p>
                  <p><span className="text-zinc-500">Phone:</span> {formData.phone}</p>
                  <p><span className="text-zinc-500">Date:</span> {formData.date}</p>
                  <p><span className="text-zinc-500">District:</span> {formData.district}</p>
                  <p><span className="text-zinc-500">Area:</span> {formData.area}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Embedded PDF Preview */}
                <div className="bg-zinc-900/60 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm">
                  {pdfLoading ? (
                    <div className="flex items-center justify-center h-[500px]">
                      <Loader2 className="animate-spin text-primary" size={32} />
                      <span className="ml-3 text-zinc-400 text-sm">Generating invoice preview...</span>
                    </div>
                  ) : pdfPreviewUrl ? (
                    <iframe
                      src={pdfPreviewUrl}
                      className="w-full h-[600px] md:h-[700px] border-0 rounded-2xl bg-white"
                      title="Invoice Preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[400px] text-zinc-500 text-sm">
                      Unable to load invoice preview.
                    </div>
                  )}
                </div>
                <div className="flex justify-center pt-2">
                  <Button
                    onClick={handleDownloadInvoice}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold h-11 px-8 rounded-full text-xs shadow-lg flex items-center space-x-2 transition-all"
                  >
                    <Download size={16} />
                    <span>Download PDF Invoice</span>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex justify-between items-center max-w-2xl mx-auto">
        {step > 1 && (
          <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)} className="text-xs px-6 h-10 rounded-full border border-white/5 text-white">
            Back
          </Button>
        )}
        {step < 3 ? (
          <Button 
            onClick={() => setStep(step + 1)} 
            disabled={step === 2 && !isFormValid}
            className="ml-auto bg-primary text-black font-bold h-10 px-8 rounded-full text-xs"
          >
            Continue
          </Button>
        ) : (
          <div className="ml-auto flex flex-col items-end gap-2">
            {bookingError && (
              <p className="text-xs text-destructive text-right max-w-sm">
                {bookingError}
              </p>
            )}
            <Button
              onClick={handleBooking}
              disabled={isSubmitting}
              className="bg-destructive text-white font-bold h-10 px-8 rounded-full text-xs"
            >
              {isSubmitting ? "SUBMITTING..." : "CONFIRM BOOKING"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}
