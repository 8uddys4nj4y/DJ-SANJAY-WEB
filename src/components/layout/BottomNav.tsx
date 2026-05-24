"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Search, Settings } from "lucide-react";
import { JogWheel } from "@/components/ui/JogWheel";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/context/TranslationContext";

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Packages", icon: Package, href: "/packages" },
  { label: "Track", icon: Search, href: "/track" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 pointer-events-none px-4">
      <div className="glass h-16 w-full max-w-lg rounded-full px-4 md:px-8 flex items-center justify-between pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10">
        <div className="flex items-center justify-around flex-1">
          <NavItem item={NAV_ITEMS[0]} label={t("Home")} isActive={pathname === NAV_ITEMS[0].href} />
          <NavItem item={NAV_ITEMS[1]} label={t("Packages")} isActive={pathname === NAV_ITEMS[1].href} />
        </div>

        <div className="flex-shrink-0 -mt-1 mx-4">
          <JogWheel />
        </div>

        <div className="flex items-center justify-around flex-1">
          <NavItem item={NAV_ITEMS[2]} label={t("Track")} isActive={pathname === NAV_ITEMS[2].href} />
          <NavItem item={NAV_ITEMS[3]} label={t("Settings")} isActive={pathname === NAV_ITEMS[3].href} />
        </div>
      </div>
    </div>
  );
}

function NavItem({ item, label, isActive }: { item: typeof NAV_ITEMS[0]; label: string; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link 
      href={item.href} 
      className={cn(
        "flex flex-col items-center justify-center transition-all duration-300",
        isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-white"
      )}
    >
      <Icon size={24} />
      <span className="text-[10px] mt-1.5 font-bold uppercase tracking-widest">{label}</span>
    </Link>
  );
}
