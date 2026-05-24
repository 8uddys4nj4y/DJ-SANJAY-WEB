
"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PACKAGES = [
  {
    id: "silver",
    name: "Silver Package",
    price: 7500,
    description: "The Essential Party Setup",
    features: [
      { label: "Top Speakers (2x)", image: "/silver-package/top_speaker_silver-package-removebg-preview.png" },
      { label: "18-Inch Subwoofers (2x)", image: "/common4packages/bass_speaker_both-package.png" },
      { label: "Pargon Lights (4x)", image: "/common4packages/par_lighr-Photoroom.png" },
      { label: "Smoke Machine (1x)", image: "/silver-package/smoke-machine-removebg-preview.png" },
      { label: "LED Mini Moving Light (1x)", image: "/silver-package/moving-head-led-light-removebg-preview.png" },
      { label: "Mini Laser (2x)", image: "/silver-package/mini_laser_silver-package.png" },
      { label: "DJ Player (1x)", image: "/common4packages/roland-dj202-removebg-preview.png" },
      { label: "DJ Station (1x)", image: "/common4packages/roland-dj202-removebg-preview.png" },
    ],
    popular: false
  },
  {
    id: "gold",
    name: "Gold Package",
    price: 8999,
    description: "Premium Event Experience",
    features: [
      { label: "Top Speakers (2x)", image: "/gold-package/top_speaker_gold-package-removebg-preview.png" },
      { label: "Premium Subwoofers (2x)", image: "/common4packages/bass_speaker_both-package.png" },
      { label: "Pargon Lights (6x)", image: "/common4packages/par_lighr-Photoroom.png" },
      { label: "Industrial Smoker (1x)", image: "/common4packages/smoke-machine-removebg-preview.png" },
      { label: "High-Power Laser (1x)", image: "/gold-package/lasr_light_gold-package.webp" },
      { label: "Pro DJ Player (1x)", image: "/common4packages/roland-dj202-removebg-preview.png" },
      { label: "DJ Station (1x)", image: "/common4packages/roland-dj202-removebg-preview.png" },
    ],
    popular: true
  }
];

export default function PackagesPage() {
  return (
    <div className="pt-20 pb-28 px-4 container mx-auto max-w-5xl">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-2">Choose Your Pulse</h1>
        <p className="text-zinc-500 max-w-md mx-auto text-sm">
          Tailored equipment setups for every celebration in Chennai.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {PACKAGES.map((pkg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="glass border flex flex-col overflow-hidden relative border-zinc-800 rounded-3xl h-full p-6">
              {pkg.popular && (
                <Badge className="absolute top-4 right-4 bg-primary text-black font-bold z-20 text-[9px] px-2 py-0">RECOMMENDED</Badge>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-headline font-black text-white">{pkg.name}</h3>
                <p className="text-zinc-500 text-xs mt-1 font-medium">{pkg.description}</p>
                <div className="flex items-baseline space-x-1 mt-4">
                  <span className="text-3xl font-headline font-bold text-primary">₹{pkg.price.toLocaleString()}</span>
                  <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">/ Event</span>
                </div>
              </div>

              <CardContent className="p-0 flex-1 mb-6">
                <div className="space-y-2">
                  {pkg.features.map((feature, i) => (
                    <div key={i} className="flex items-center space-x-3 bg-black/40 p-2.5 rounded-xl border border-white/5">
                      {feature.image && (
                        <div className="w-10 h-10 flex-shrink-0 relative flex items-center justify-center">
                          <img src={feature.image} alt={feature.label} className="max-w-full max-h-full object-contain drop-shadow-md" />
                        </div>
                      )}
                      <span className="text-[11px] font-semibold text-zinc-300">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="p-0 mt-auto">
                <Button asChild className="w-full h-12 rounded-xl font-bold text-sm transition-all active:scale-95 bg-primary hover:bg-primary/90 text-black">
                  <Link href={`/booking?package=${pkg.id}`}>
                    Book {pkg.name}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
