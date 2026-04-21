"use client";

import { LayoutDashboard, Briefcase, Users, Calendar, Settings, Scale } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * Professional Mobile Bottom Navigation
 * Provides persistent procedural access on small viewports.
 */
export function BottomNav() {
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "Feed", href: "/dashboard" },
    { icon: Briefcase, label: "Cases", href: "/dashboard/cases" },
    { icon: Users, label: "Clients", href: "/dashboard/clients" },
    { icon: Calendar, label: "Hearings", href: "/dashboard/hearings" },
    { icon: Settings, label: "Config", href: "/dashboard/settings" },
  ];

  return (
    <div className="lg:hidden fixed bottom-6 left-6 right-6 h-20 bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex items-center justify-around px-6 z-[70] shadow-[0_-20px_40px_rgba(0,0,0,0.4)]">
      {/* Brand Center Pivot (Optional decoration) */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 p-4 rounded-2xl shadow-xl shadow-indigo-600/40 border border-indigo-400/30">
        <Scale className="w-6 h-6 text-white" />
      </div>

      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className="relative flex flex-col items-center gap-1 group">
            {isActive && (
              <motion.div 
                layoutId="nav-glow"
                className="absolute -top-4 w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]"
              />
            )}
            <item.icon className={cn(
              "w-5 h-5 transition-all duration-300",
              isActive ? "text-indigo-400 scale-110" : "text-zinc-600 hover:text-white"
            )} />
            <span className={cn(
              "text-[9px] font-black uppercase tracking-tighter transition-all",
              isActive ? "text-white" : "text-zinc-700"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
