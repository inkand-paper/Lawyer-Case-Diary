"use client";

/**
 * ============================================================
 * Sidebar — Professional Judicial Navigation
 * ─────────────────────────────────────────────────────────────
 * Fixed desktop navigation hub with high-fidelity aesthetics.
 * Features:
 *   - Clear visual hierarchy for active routes
 *   - Opaque monochrome design tokens
 *   - Responsive visibility (Hidden on mobile)
 * ============================================================
 */

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
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Intelligence", href: "/dashboard", desc: "System Status & Stats" },
  { icon: Briefcase, label: "Case Registry", href: "/dashboard/cases", desc: "Judicial File Management" },
  { icon: Users, label: "Client Directory", href: "/dashboard/clients", desc: "Entity Relationship Hub" },
  { icon: Calendar, label: "Judicial Docket", href: "/dashboard/hearings", desc: "Procedural Timeline" },
  { icon: Settings, label: "System Config", href: "/dashboard/settings", desc: "Practitioner Preferences" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex w-80 h-screen sticky top-0 flex-col z-50 border-r"
      style={{ background: "var(--background)", borderColor: "var(--border)" }}
    >
      {/* Branding */}
      <div className="p-10 pb-12 flex items-center gap-4">
        <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-xl border" style={{ background: "var(--foreground)", borderColor: "var(--border)" }}>
          <Scale className="w-6 h-6" style={{ color: "var(--background)" }} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-black tracking-tighter uppercase leading-none" style={{ color: "var(--foreground)" }}>
            Lawyer Diary
          </h1>
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] mt-1" style={{ color: "var(--muted)" }}>
            SaaS Terminal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 space-y-1.5">
        {menuItems.map((item) => {
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
      </nav>

      {/* Footer / Guard */}
      <div className="p-8 border-t" style={{ borderColor: "var(--border)" }}>
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
