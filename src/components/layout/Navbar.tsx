"use client";

import Link from "next/link";
import { Instagram, MessageCircle, Phone, LogIn, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase";
import { useTranslation } from "@/context/TranslationContext";

const SOCIALS = [
  { icon: Phone, href: "tel:9962205244" },
  { icon: MessageCircle, href: "https://wa.me/9962205244" },
  { icon: Instagram, href: "https://instagram.com/dj_sharky_official" },
];

export function Navbar() {
  const { user } = useUser();
  const { language, setLanguage, t } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass h-16 flex items-center px-6 md:px-12 border-b border-white/5">
      <div className="flex-1">
        <Link href="/" className="flex items-center space-x-3 text-xl md:text-2xl font-headline font-black tracking-tighter text-white">
          <img src="/DJ_SANJAY_LOGO.png" alt="DJ Sanjay Logo" className="h-8 w-auto" />
          <span>DJ SANJAY</span>
        </Link>
      </div>

      <div className="flex items-center space-x-6 md:space-x-8">
        <div className="hidden md:flex items-center space-x-6 text-zinc-500">
          {user && SOCIALS.map((social, i) => (
            <Link 
              key={i}
              href={social.href} 
              target="_blank" 
              className="hover:text-primary transition-all hover:scale-110"
            >
              <social.icon size={18} />
            </Link>
          ))}
        </div>

        <button 
          onClick={toggleLanguage} 
          className="flex items-center space-x-2 bg-black/50 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors text-xs font-bold text-zinc-300"
        >
          <Globe size={14} className={language === 'ta' ? "text-primary" : "text-zinc-400"} />
          <span>{language === 'ta' ? "தமிழ்" : "English"}</span>
        </button>

        {!user ? (
          <Button variant="default" size="sm" className="bg-primary text-black font-bold px-6 rounded-full h-10 text-sm shadow-xl" asChild>
            <Link href="/settings">
              <LogIn className="mr-2 h-4 w-4" />
              {t('Sign In')}
            </Link>
          </Button>
        ) : (
          <Link href="/settings" className="w-10 h-10 rounded-full bg-zinc-950 border border-primary/40 flex items-center justify-center text-primary hover:bg-zinc-900 transition-colors professional-shadow" title={t('Settings')}>
            <User size={20} />
          </Link>
        )}
      </div>
    </nav>
  );
}
