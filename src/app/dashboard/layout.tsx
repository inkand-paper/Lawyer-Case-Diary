"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { User, Bell, Search } from "lucide-react";
import { ThemeGlider } from "@/components/dashboard/ThemeGlider";
import { QuickCaseForm } from "@/components/dashboard/QuickCaseForm";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { cn } from "@/lib/utils";

/**
 * Professional Dashboard Layout
 * Enforces "Constant Shape" (rounded-[2.5rem]) and strict vertical alignment in the Header.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-black min-h-screen selection:bg-indigo-500/30 font-inter overflow-x-hidden relative">
      {/* Sidebar hidden on mobile */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden py-0 lg:py-6 lg:pr-6 gap-6 relative">
        {/* Main Content Area with Constant Shape Container */}
        <div className="flex-1 flex flex-col bg-zinc-950/50 border-0 lg:border border-white/5 rounded-0 lg:rounded-[2.5rem] backdrop-blur-xl overflow-hidden relative shadow-2xl">
          
          {/* Header Internal to the Constant Shape Container */}
          <header className="h-20 lg:h-24 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 relative z-40 bg-white/[0.01]">
            {/* Standardized Search Bar with Proper Alignment */}
            <div className={cn(
              "hidden sm:flex items-center gap-4 bg-zinc-900/40 border border-white/5 px-6 py-3 rounded-2xl w-96 group transition-all focus-within:border-indigo-600/50 focus-within:bg-zinc-900/60"
            )}>
              <div className="w-5 flex justify-center items-center">
                <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Search registry files..." 
                className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder:text-zinc-600 font-medium"
              />
            </div>

            <div className="flex items-center gap-4 lg:gap-8 ml-auto">
              {/* Theme Switcher with Vertical Alignment */}
              <div className="hidden md:flex items-center gap-2">
                <ThemeGlider />
              </div>
              
              {/* Notification Protocol */}
              <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group">
                <Bell className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-black" />
              </button>

              {/* Professional User Access Unit */}
              <div className="flex items-center gap-4 pl-4 lg:pl-8 border-l border-white/10">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-black text-white tracking-tight">Adv. Abir Ahmed</p>
                  <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Counselor</p>
                </div>
                <div className="w-10 lg:w-12 h-10 lg:h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center border border-white/10 shadow-lg group hover:scale-105 transition-transform cursor-pointer">
                  <User className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
                </div>
              </div>
            </div>
          </header>

          {/* Unified Content main area */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-12 pb-32 lg:pb-12 custom-scrollbar">
            {children}
          </main>

          {/* Procedural Live Testing UI */}
          <QuickCaseForm onCaseCreated={() => { window.location.reload(); }} />

          {/* Mobile Bottom Navigation Access */}
          <BottomNav />

          {/* Decorative Corner Glow */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/5 blur-[120px] pointer-events-none rounded-full" />
        </div>
      </div>
    </div>
  );
}
