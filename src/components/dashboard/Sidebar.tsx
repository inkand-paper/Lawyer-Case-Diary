"use client";

/**
 * ============================================================
 * Sidebar — Navigation
 * ─────────────────────────────────────────────────────────────
 * Fixed desktop navigation.
 * ============================================================
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  Settings,
  Scale,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Zap,
  Star,
  Crown,
  LogOut,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", desc: "View status and stats" },
  { icon: Briefcase, label: "Cases", href: "/dashboard/cases", desc: "Manage your case files" },
  { icon: Users, label: "Clients", href: "/dashboard/clients", desc: "Manage your clients" },
  { icon: Calendar, label: "Hearings", href: "/dashboard/hearings", desc: "View court dates" },
  { icon: Users, label: "My Team", href: "/dashboard/team", desc: "Collaborate with lawyers", plan: "ULTIMATE" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings", desc: "Account settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>("ESSENTIAL");

  useEffect(() => {
    fetch("/api/me")
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setRole(res.data.role);
          setPlan(res.data.plan || "ESSENTIAL");
        }
      })
      .catch(() => {});
  }, []);

  const isAdmin = role === "ADMIN";

  return (
    <aside
      className="hidden lg:flex w-80 h-screen sticky top-0 flex-col z-50 border-r"
      style={{ background: "var(--background)", borderColor: "var(--border)" }}
    >
      {/* Branding */}
      <Link href="/" className="p-10 pb-12 flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
        <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-xl border" style={{ background: "var(--foreground)", borderColor: "var(--border)" }}>
          <Scale className="w-6 h-6" style={{ color: "var(--background)" }} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-black tracking-tighter uppercase leading-none" style={{ color: "var(--foreground)" }}>
            Lawyer Diary
          </h1>
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] mt-1" style={{ color: "var(--muted)" }}>
            Go to Landing
          </span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-6 space-y-1.5">
        {menuItems.filter(item => {
          // 1. If no plan is required, everyone sees it
          if (!item.plan) return true;
          // 2. Admins see everything
          if (isAdmin) return true;
          // 3. Otherwise, must match the plan exactly
          return item.plan === plan;
        }).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-4 px-6 py-4.5 rounded-[1.5rem] transition-all relative overflow-hidden",
                isActive ? "shadow-md border" : "hover:bg-[var(--surface)]"
              )}
              style={isActive ? { background: "var(--surface)", borderColor: "var(--border)" } : {}}
            >
              <div
                className={cn(
                  "p-2.5 rounded-xl transition-all",
                  isActive ? "bg-[var(--foreground)]" : "bg-[var(--surface-2)] group-hover:bg-[var(--foreground)]"
                )}
              >
                <item.icon
                  className={cn("w-4 h-4 transition-colors", isActive ? "text-[var(--background)]" : "text-[var(--muted)] group-hover:text-[var(--background)]")}
                />
              </div>
              
              <div className="flex-1">
                <p className={cn("text-xs font-black uppercase tracking-widest", isActive ? "text-[var(--foreground)]" : "text-[var(--muted)] group-hover:text-[var(--foreground)]")}>
                  {item.label}
                </p>
                <p className="text-[9px] font-medium opacity-50 truncate max-w-[140px]" style={{ color: "var(--muted)" }}>
                  {item.desc}
                </p>
              </div>

              {isActive && (
                <ChevronRight className="w-3 h-3" style={{ color: "var(--foreground)" }} />
              )}
            </Link>
          );
        })}

        {/* Admin Command Center — Revealed only to Elite Practitioners */}
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "group flex items-center gap-4 px-6 py-4.5 rounded-[1.5rem] transition-all relative overflow-hidden mt-6",
              pathname === "/admin" ? "shadow-md border" : "hover:bg-[var(--surface)] border border-dashed border-[var(--border)]"
            )}
            style={pathname === "/admin" ? { background: "var(--surface)", borderColor: "var(--border)" } : {}}
          >
            <div
              className={cn(
                "p-2.5 rounded-xl transition-all shadow-lg",
                pathname === "/admin" ? "bg-red-500" : "bg-red-500/10 group-hover:bg-red-500"
              )}
            >
              <ShieldAlert
                className={cn("w-4 h-4 transition-colors", pathname === "/admin" ? "text-white" : "text-red-500 group-hover:text-white")}
              />
            </div>
            
            <div className="flex-1">
              <p className={cn("text-xs font-black uppercase tracking-widest", pathname === "/admin" ? "text-[var(--foreground)]" : "text-red-500 group-hover:text-[var(--foreground)]")}>
                Admin Hub
              </p>
              <p className="text-[9px] font-bold opacity-50 uppercase tracking-[0.1em]" style={{ color: "var(--muted)" }}>
                Admin tools
              </p>
            </div>
          </Link>
        )}
      </nav>

      {/* UPGRADE PROMPT (Only for non-ultimate users) */}
      {!isAdmin && plan !== "ULTIMATE" && (
        <div className="mx-6 mb-6 p-6 rounded-[2rem] bg-zinc-900/40 border border-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-20%] w-20 h-20 bg-blue-500/10 blur-2xl group-hover:bg-blue-400/20 transition-all" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                  {plan === "ESSENTIAL" ? <Zap className="w-3 h-3 text-blue-500" /> : <Star className="w-3 h-3 text-purple-500" />}
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400/70">Plan: {plan}</span>
              </div>
              <h4 className="text-[11px] font-black text-white leading-tight uppercase tracking-tight">Unlock more features</h4>
              <Link 
                href="/pricing"
                className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest text-center rounded-xl shadow-lg transition-all border border-blue-400/30"
              >
                Upgrade Plan
              </Link>
            </div>
        </div>
      )}

      {/* Footer / Guard */}
      <div className="p-8 border-t space-y-4" style={{ borderColor: "var(--border)" }}>
        <button 
          onClick={async () => {
            try {
              await fetch("/api/auth/logout", { method: "POST" });
            } catch {}
            window.location.href = "/";
          }}
          className="w-full p-5 rounded-[2rem] flex items-center gap-4 border hover:bg-red-500/10 hover:border-red-500/30 transition-all group" 
          style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
        >
          <div className="p-2.5 rounded-xl bg-red-500/10 group-hover:bg-red-500 transition-all">
            <LogOut className="w-4 h-4 text-red-500 group-hover:text-white" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Sign Out</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>End Session</p>
          </div>
        </button>

        <div className="p-5 rounded-[2rem] flex items-center gap-4 border" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
          <div className="p-2.5 rounded-xl" style={{ background: "var(--foreground)" }}>
            <ShieldCheck className="w-4 h-4" style={{ color: "var(--background)" }} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--foreground)" }}>Secure Core</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>TLS 1.3 Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
