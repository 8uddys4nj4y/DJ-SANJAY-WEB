
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Music, Calendar, Star } from "lucide-react";
import { useEffect, useState } from "react";

export function Hero() {
  const [counts, setCounts] = useState({ booked: 0, completed: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts(prev => ({
        booked: Math.min(prev.booked + 1, 14),
        completed: Math.min(prev.completed + 1, 13)
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 px-4 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-10 max-w-4xl"
      >
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-4 py-1.5 rounded-full glass border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6 inline-block"
        >
          Premium DJ Experience
        </motion.span>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-secondary drop-shadow-sm">
          The Beat of Your Best Event Starts Here!
        </h1>

        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-12">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-headline font-bold text-accent neon-text-gold">{counts.booked}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Events Booked</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-headline font-bold text-secondary neon-text-cyan">{counts.completed}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Shows Completed</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto h-14 px-10 text-lg bg-primary hover:bg-primary/90 rounded-full neon-glow-purple group transition-all">
            <Link href="/booking">
              <Calendar className="mr-2 h-5 w-5 group-hover:animate-bounce" />
              Book DJ Show
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-10 text-lg rounded-full border-secondary/50 text-secondary hover:bg-secondary/10">
            <Link href="/packages">
              View Packages
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Decorative Icons */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute bottom-20 left-10 text-primary/30 hidden md:block"
      >
        <Music size={64} />
      </motion.div>
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
        className="absolute top-40 right-20 text-secondary/30 hidden md:block"
      >
        <Star size={48} />
      </motion.div>
    </section>
  );
}
