"use client";

/**
 * ============================================================
 * Dashboard — Central Intelligence Command
 * ─────────────────────────────────────────────────────────────
 * Real-time synthesis of the legal ecosystem.
 * Aggregates statistics, recent registry activity, and system health.
 * ============================================================
 */

import { useEffect, useState } from "react";
import {
  Scale,
  Briefcase,
  Users,
  Calendar,
  Activity,
  TrendingUp,
  Clock,
  ShieldCheck,
  Plus,
  Database,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CaseEditorDrawer } from "@/components/dashboard/CaseEditorDrawer";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (err) {
      console.error("Live feed failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--muted)" }} />
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          Synchronizing Intelligence...
        </p>
      </div>
    );
  }

  const stats = [
    { label: "Active Litigations", value: data?.stats?.activeCases || "0", icon: Briefcase, trend: "Live Tracker" },
    { label: "Verified Clients", value: data?.stats?.verifiedClients || "0", icon: Users, trend: "Registry Records" },
    { label: "Upcoming Hearings", value: data?.stats?.upcomingHearings || "0", icon: Calendar, trend: "Docket Monitor" },
    { label: "System Fidelity", value: data?.stats?.uptime || "99.9%", icon: ShieldCheck, trend: "Encrypted" },
  ];

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter" style={{ color: "var(--foreground)" }}>
            Command Intelligence
          </h1>
          <p className="font-bold text-base" style={{ color: "var(--muted)" }}>
            Real-time status of your legal ecosystem.
          </p>
        </div>
        <button
          onClick={() => { setSelectedCaseId(null); setDrawerOpen(true); }}
          className="px-6 py-4 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all hover:opacity-80 shadow-lg"
          style={{ background: "var(--foreground)", color: "var(--background)" }}
        >
          <Plus className="w-4 h-4" />
          Initialize New Case
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-8 rounded-[2.5rem] flex flex-col gap-6 hover:scale-[1.02] transition-transform cursor-default"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between items-start">
              <div
                className="p-4 rounded-2xl"
                style={{ background: "var(--surface-2)" }}
              >
                <stat.icon className="w-6 h-6" style={{ color: "var(--foreground)" }} />
              </div>
              <div className="flex flex-col items-end">
                <TrendingUp className="w-4 h-4" style={{ color: "var(--border)" }} />
                <span className="text-[10px] font-black uppercase tracking-tighter mt-1" style={{ color: "var(--muted)" }}>
                  {stat.trend}
                </span>
              </div>
            </div>
            <div>
              <p className="text-4xl font-black tracking-tighter" style={{ color: "var(--foreground)" }}>
                {stat.value}
              </p>
              <p className="text-xs font-black uppercase tracking-[0.2em] mt-1" style={{ color: "var(--muted)" }}>
                {stat.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black tracking-tighter" style={{ color: "var(--foreground)" }}>
              Recent Registry Activity
            </h3>
            <Link href="/dashboard/cases" className="text-[10px] font-black uppercase tracking-widest underline underline-offset-4" style={{ color: "var(--muted)" }}>
              View Repository
            </Link>
          </div>
          <div
            className="rounded-[2.5rem] overflow-hidden min-h-[400px]"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <AnimatePresence mode="wait">
              {data?.recentActions?.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>Ref</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>Case File</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>Client</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentActions.map((item: any, i: number) => (
                      <tr
                        key={item.id}
                        style={{ borderBottom: "1px solid var(--border)" }}
                        className="group transition-colors cursor-pointer"
                        onClick={() => { setSelectedCaseId(item.id); setDrawerOpen(true); }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <td className="px-8 py-6">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md" style={{ background: "var(--surface-2)", color: "var(--foreground)" }}>
                            {item.caseNumber}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-black tracking-tight" style={{ color: "var(--foreground)" }}>{item.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3" style={{ color: "var(--muted)" }} />
                            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>Active Protocol</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-bold" style={{ color: "var(--muted)" }}>{item.client?.name || "Private Entity"}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all" style={{ color: "var(--foreground)" }}>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center p-16 text-center gap-6 h-full"
                >
                  <div className="w-20 h-20 rounded-[2.5rem] flex items-center justify-center" style={{ background: "var(--foreground)" }}>
                    <Database className="w-8 h-8" style={{ color: "var(--background)" }} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black uppercase tracking-tighter" style={{ color: "var(--foreground)" }}>
                      Registry is Standby
                    </h4>
                    <p className="text-sm font-medium max-w-xs mx-auto" style={{ color: "var(--muted)" }}>
                      No recent actions detected. Initialize your first case record to begin intelligence aggregation.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Registry Health */}
        <div className="space-y-4">
          <h3 className="text-xl font-black tracking-tighter px-2" style={{ color: "var(--foreground)" }}>
            Registry Health
          </h3>
          <div
            className="p-8 rounded-[2.5rem] h-full space-y-8 flex flex-col"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              >
                <Activity className="w-6 h-6" style={{ color: "var(--foreground)" }} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest" style={{ color: "var(--foreground)" }}>
                  Protocol Sync
                </p>
                <p className="text-[10px] font-bold uppercase mt-1 flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--foreground)" }} />
                  Secure Link Active
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  Database Load
                </span>
                <span className="text-[10px] font-black" style={{ color: "var(--foreground)" }}>
                  {data?.stats?.activeCases ? "Optimal" : "Idle"}
                </span>
              </div>
              <div className="h-2 w-full rounded-full" style={{ background: "var(--surface-2)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: data?.stats?.activeCases ? "42%" : "5%" }}
                  className="h-full rounded-full"
                  style={{ background: "var(--foreground)" }}
                />
              </div>
            </div>

            <div
              className="p-5 rounded-2xl space-y-4 mt-auto"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                Registry Summary
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span style={{ color: "var(--muted)" }}>Node.js Tier</span>
                  <span style={{ color: "var(--foreground)" }}>v20.x_STABLE</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span style={{ color: "var(--muted)" }}>Encryption</span>
                  <span style={{ color: "var(--foreground)" }}>AES_256_ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CaseEditorDrawer
        isOpen={drawerOpen}
        caseId={selectedCaseId}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => { fetchStats(); setDrawerOpen(false); }}
      />
    </div>
  );
}
