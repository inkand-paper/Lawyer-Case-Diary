"use client";

/**
 * ============================================================
 * DashboardLayout — Optimized Professional Workspace
 * ─────────────────────────────────────────────────────────────
 * Adaptive architecture for desktop and mobile.
 * Injects practitioners' identity and real-time alerts.
 * Features:
 *   - Responsive Sidebar (Desktop) / Bottom Nav (Mobile)
 *   - Global Search Synchronization via SearchProvider
 *   - High-fidelity Header with Notifications
 * ============================================================
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { Search, Shield, Zap, X, Scale } from "lucide-react";
import { NotificationDropdown } from "@/components/dashboard/NotificationDropdown";
import { ThemeGlider } from "@/components/dashboard/ThemeGlider";
import { SearchProvider, useSearch } from "@/context/SearchContext";
import { User as UserType } from "@/lib/types";

function HeaderContent() {
  const [user, setUser] = useState<UserType | null>(null);
  const { searchQuery, setSearchQuery } = useSearch();

  useEffect(() => {
    let ignore = false;
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const json = await res.json();
        if (!ignore && json.success) setUser(json.data);
      } catch {}
    };
    fetchUser();
    return () => { ignore = true; };
  }, []);

  return (
    <header
      className="h-20 sm:h-24 px-4 sm:px-6 lg:px-12 flex items-center justify-between sticky top-0 z-[50] transition-all border-b"
      style={{ background: "var(--background)", borderColor: "var(--border)" }}
    >
      {/* Identity & Search Section */}
      <div className="flex items-center gap-4 lg:gap-12 flex-1">
        {/* Desktop Brand */}
        <Link href="/" className="hidden lg:flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center shadow-lg">
            <Shield className="w-5 h-5 text-background" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-foreground">
              {user?.name || "Practitioner"}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
              Verified Identity
            </span>
          </div>
        </Link>

        {/* Mobile Brand Logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
            <Scale className="w-5 h-5 text-background" />
          </div>
        </Link>

        {/* Global Registry Search */}
        <div className="relative flex-1 max-w-[160px] sm:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-foreground" style={{ color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="Quick search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 lg:h-12 rounded-2xl pl-12 pr-10 text-xs font-bold focus:outline-none transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-[var(--surface-2)]"
            >
              <X className="w-3 h-3" style={{ color: "var(--muted)" }} />
            </button>
          )}
        </div>
      </div>

      {/* Action Hub */}
      <div className="flex items-center gap-3 lg:gap-4 ml-4">
        <div className="hidden sm:flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--foreground)" }}>System Normal</span>
            <Zap className="w-3 h-3 fill-current text-green-500" />
          </div>
          <span className="text-[8px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--muted)" }}>99.9% Uptime</span>
        </div>
        
        <ThemeGlider />
        
        <NotificationDropdown />

        <div className="lg:hidden w-12 h-12 rounded-2xl flex items-center justify-center border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--foreground)" }}>
            <span className="text-[10px] font-black" style={{ color: "var(--background)" }}>
              {user?.name?.charAt(0) || "P"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 relative">
          <HeaderContent />
          <div className="flex-1 p-4 sm:p-6 lg:p-12 overflow-x-hidden">
            {children}
          </div>
          <div className="h-20 lg:hidden shrink-0 pb-safe" style={{ background: "var(--surface)" }} />
        </main>
        <BottomNav />
      </div>
    </SearchProvider>
  );
}
