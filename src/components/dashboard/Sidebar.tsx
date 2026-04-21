"use client";

import { Scale, LayoutDashboard, Briefcase, Users, Calendar, Settings, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Professional Elite Sidebar
 * Enforces "Constant Shape" (rounded-[2.5rem]) and pixel-perfect icon/text alignment.
 */
export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "Intelligence", href: "/dashboard" },
    { icon: Briefcase, label: "Active Cases", href: "/cases" },
    { icon: Users, label: "Client Records", href: "/clients" },
    { icon: Calendar, label: "Court Dates", href: "/hearings" },
    { icon: Settings, label: "Preferences", href: "/settings" },
  ];

  return (
    <div className="w-80 h-screen p-6 flex flex-col gap-6 z-50">
      {/* Brand Identity Container */}
      <div className="bg-zinc-950/50 border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-center gap-3 backdrop-blur-xl group">
        <div className="bg-indigo-600 p-2.5 rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-indigo-600/20">
          <Scale className="w-6 h-6 text-white" />
        </div>
        <span className="text-white font-black tracking-tighter text-xl">LAWYER ID</span>
      </div>

      {/* Navigation Container */}
      <div className="flex-1 bg-zinc-950/50 border border-white/5 rounded-[2.5rem] p-4 flex flex-col gap-2 backdrop-blur-xl overflow-y-auto custom-scrollbar">
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-6 py-4">Registry Access</p>
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "group relative flex items-center h-14 px-4 rounded-3xl transition-all duration-300 overflow-hidden",
                  isActive ? "bg-indigo-600 shadow-lg shadow-indigo-600/20" : "hover:bg-white/5"
                )}
              >
                {/* Fixed-Width Icon Container for Perfect Alignment */}
                <div className="w-10 flex justify-center items-center">
                  <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-zinc-500 group-hover:text-white")} />
                </div>
                
                {/* Text Label */}
                <span className={cn(
                  "text-sm font-bold tracking-tight transition-colors ml-1",
                  isActive ? "text-white" : "text-zinc-500 group-hover:text-white"
                )}>
                  {item.label}
                </span>

                {/* Active Indicator Chevron */}
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute right-4"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </motion.div>
                )}

                {!isActive && (
                  <ChevronRight className="absolute right-4 w-4 h-4 text-zinc-800 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Exit Protocol Container */}
      <div className="bg-zinc-950/50 border border-white/5 rounded-[2.5rem] p-4 backdrop-blur-xl">
        <button className="w-full flex items-center h-14 px-4 rounded-3xl hover:bg-red-500/10 group transition-all">
          <div className="w-10 flex justify-center items-center">
            <LogOut className="w-5 h-5 text-zinc-600 group-hover:text-red-500 transition-colors" />
          </div>
          <span className="text-sm font-bold text-zinc-500 group-hover:text-red-500 transition-colors ml-1">
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );
}
