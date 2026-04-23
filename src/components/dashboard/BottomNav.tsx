"use client";

/**
 * ============================================================
 * BottomNav — Optimized Mobile Navigation
 * ─────────────────────────────────────────────────────────────
 * Provides high-fidelity navigation for mobile/touch devices.
 * Consistency Update: Using var(--surface) for docked feel
 * and adjusted z-index for backdrop compliance.
 * ============================================================
 */

import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: "Feed", href: "/dashboard" },
    { icon: Briefcase, label: "Cases", href: "/dashboard/cases" },
    { icon: Users, label: "Clients", href: "/dashboard/clients" },
    { icon: Calendar, label: "Dockets", href: "/dashboard/hearings" },
    { icon: Settings, label: "Config", href: "/dashboard/settings" },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 h-20 sm:h-24 px-4 flex items-center justify-between z-[50] border-t pb-safe"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center gap-1.5 h-full relative group"
          >
            {isActive && (
              <motion.div
                layoutId="nav-active"
                className="absolute inset-x-2 inset-y-2 rounded-2xl z-0"
                style={{ background: "var(--surface-2)" }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            <item.icon
              className={cn(
                "w-5 h-5 transition-all z-10",
                isActive ? "scale-110" : "opacity-60"
              )}
              style={{ color: isActive ? "var(--foreground)" : "var(--muted)" }}
            />
            
            <span
              className={cn(
                "text-[9px] font-black uppercase tracking-widest z-10 transition-all",
                isActive ? "opacity-100" : "opacity-40"
              )}
              style={{ color: isActive ? "var(--foreground)" : "var(--muted)" }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
