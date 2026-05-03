"use client";

/**
 * ============================================================
 * NotificationDropdown — Real-time Judicial Alerts
 * ─────────────────────────────────────────────────────────────
 * Polls the system for hearings scheduled within T-minus 1 hour.
 * Provides immediate visual feedback for imminent court dates.
 * ============================================================
 */

import { useState, useEffect } from "react";
import { Bell, Clock, Scale, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Hearing } from "@/lib/types";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Hearing[]>([]);
  const [loading, setLoading] = useState(false);



  useEffect(() => {
    let ignore = false;
    const fetchAlertsInternal = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/notifications/upcoming");
        const json = await res.json();
        if (!ignore && json.success) setAlerts(json.data);
      } catch {}
      finally { if (!ignore) setLoading(false); }
    };

    fetchAlertsInternal();
    // Poll every 5 minutes for new alerts
    const interval = setInterval(fetchAlertsInternal, 5 * 60 * 1000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative group"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" style={{ color: "var(--muted)" }} />
        {alerts.length > 0 && (
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2" style={{ borderColor: "var(--surface)" }} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 rounded-[2rem] shadow-2xl z-50 overflow-hidden"
              style={{ background: "var(--background)", border: "1px solid var(--border)" }}
            >
              <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
                <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--foreground)" }}>Judicial Alerts</h4>
                <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest" style={{ background: "var(--foreground)", color: "var(--background)" }}>
                  {alerts.length} Pending
                </span>
              </div>

              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="p-10 flex flex-col items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--muted)" }} />
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">Syncing Feed...</p>
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="p-10 text-center flex flex-col items-center gap-3">
                    <div className="p-3 rounded-2xl" style={{ background: "var(--surface-2)" }}>
                      <CheckCircle className="w-5 h-5" style={{ color: "var(--muted)" }} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">All systems clear.</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <Link
                      key={alert.id}
                      href="/dashboard/hearings"
                      onClick={() => setIsOpen(false)}
                      className="p-5 flex items-start gap-4 border-b hover:bg-[var(--surface)] transition-colors group"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="p-2 rounded-xl" style={{ background: "var(--foreground)" }}>
                        <Scale className="w-3.5 h-3.5" style={{ color: "var(--background)" }} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-bold leading-tight" style={{ color: "var(--foreground)" }}>
                          Imminent Hearing: {alert.case?.title}
                        </p>
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                          <Clock className="w-3 h-3" />
                          <span>Starts in {Math.round((new Date(alert.hearingDate).getTime() - new Date().getTime()) / 60000)}m</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              <div className="p-4 text-center">
                <Link href="/dashboard/hearings" className="text-[9px] font-black uppercase tracking-widest hover:opacity-60 transition-opacity" style={{ color: "var(--muted)" }}>
                  View Full Timeline
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}
