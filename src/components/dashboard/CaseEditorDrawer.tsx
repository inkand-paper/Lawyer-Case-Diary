"use client";

/**
 * ============================================================
 * CaseEditorDrawer
 * ─────────────────────────────────────────────────────────────
 * Slide-in drawer for creating, editing, and deleting a Case.
 * Also exposes a Quick Schedule widget for adding Hearings
 * directly within the case context.
 *
 * RESPONSIVENESS: Added significant bottom padding to ensure
 * elements aren't hidden behind the mobile BottomNav.
 * ============================================================
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  X,
  Briefcase,
  MapPin,
  Scale,
  Users,
  Loader2,
  Save,
  Trash2,
  Calendar,
  Plus,
  AlertCircle,
  Crown,
} from "lucide-react";
import { Case, Client, Hearing } from "@/lib/types";
import { fetchJson } from "@/lib/fetch-json";

interface CaseEditorDrawerProps {
  isOpen: boolean;
  caseId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const inputStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
} as React.CSSProperties;

export function CaseEditorDrawer({
  isOpen,
  caseId,
  onClose,
  onSuccess,
}: CaseEditorDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [schedulingHearing, setSchedulingHearing] = useState(false);
  const [caseData, setCaseData] = useState<Partial<Case> | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState("");

  const quickDateRef = useRef<HTMLInputElement>(null);
  const quickNotesRef = useRef<HTMLInputElement>(null);



  const fetchCase = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const json = await fetchJson<{ success: boolean; data: Partial<Case>; error?: { message: string } }>(`/api/cases/${id}`);
      if (json?.success) {
        setCaseData(json.data);
      } else {
        setError(json?.error?.message || "Failed to load case record.");
      }
    } catch {
      setError("Network error — unable to load case.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    if (isOpen) {
      const init = async () => {
        try {
          // fetch clients
          const cJson = await fetchJson<{ success: boolean; data: Client[] }>("/api/clients");
          if (!ignore && cJson?.success) setClients(cJson.data);

          if (caseId) {
            setLoading(true);
            const json = await fetchJson<{ success: boolean; data: Partial<Case>; error?: { message: string } }>(`/api/cases/${caseId}`);
            if (!ignore) {
              if (json?.success) setCaseData(json.data);
              else setError(json?.error?.message || "Failed to load case.");
            }
          } else {
            if (!ignore) {
              setCaseData({
                title: "",
                caseNumber: "",
                courtName: "",
                judgeName: "",
                clientId: "",
                status: "ACTIVE",
              });
              setError("");
            }
          }
        } catch {
          if (!ignore) setError("Network error.");
        } finally {
          if (!ignore) setLoading(false);
        }
      };
      init();
    }
    return () => { ignore = false; };
  }, [isOpen, caseId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const method = caseId ? "PUT" : "POST";
    const endpoint = caseId ? `/api/cases/${caseId}` : `/api/cases`;

    const payload: Record<string, string | number | boolean | undefined | null> = {
      title: formData.get("title"),
      caseNumber: formData.get("caseNumber"),
      courtName: formData.get("courtName"),
      judgeName: formData.get("judgeName") || undefined,
      status: formData.get("status"),
    };

    const clientId = formData.get("clientId");
    if (clientId) payload.clientId = clientId;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        onSuccess();
        onClose();
      } else {
        setError(json.error?.message || "Failed to save case.");
      }
    } catch {
      setError("Network sync failure.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!caseId || !confirm("Delete this case and all associated history?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        onSuccess();
        onClose();
      } else {
        setError(json.error?.message || "Deletion failed.");
      }
    } catch {
      setError("Network error — deletion aborted.");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickSchedule = async () => {
    if (!caseId) return;
    const dateVal = quickDateRef.current?.value;
    const notesVal = quickNotesRef.current?.value;

    if (!dateVal) {
      setError("Please select a hearing date.");
      return;
    }

    setSchedulingHearing(true);
    setError("");

    try {
      const res = await fetch(`/api/hearings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          hearingDate: dateVal,
          notes: notesVal || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        if (quickDateRef.current) quickDateRef.current.value = "";
        if (quickNotesRef.current) quickNotesRef.current.value = "";
        await fetchCase(caseId);
      } else {
        setError(json.error?.message || "Failed to schedule hearing.");
      }
    } catch {
      setError("Network error — hearing enrollment failed.");
    } finally {
      setSchedulingHearing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[120]" // Increased z-index
            style={{ background: "rgba(0,0,0,0.55)" }}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-[130] flex flex-col shadow-2xl overflow-y-auto custom-scrollbar"
            style={{
              background: "var(--background)",
              borderLeft: "1px solid var(--border)",
            }}
          >
            {/* Header - Sticky */}
            <div
              className="sticky top-0 p-6 flex items-center justify-between z-10 shadow-sm"
              style={{
                background: "var(--surface)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2.5 rounded-xl"
                  style={{ background: "var(--foreground)" }}
                >
                  <Briefcase className="w-5 h-5" style={{ color: "var(--background)" }} />
                </div>
                <div>
                  <h2
                    className="text-lg font-black tracking-tight uppercase"
                    style={{ color: "var(--foreground)" }}
                  >
                    {caseId ? "Case Protocol" : "Initialize Case"}
                  </h2>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                    {caseId ? "Modify judicial file" : "Enroll new litigation"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-full transition-all"
                style={{ background: "var(--surface-2)", color: "var(--muted)" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="p-6 lg:p-8 flex-1 pb-32 lg:pb-12"> {/* Added heavy bottom padding for mobile */}
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--muted)" }} />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Recovering Registry File...
                  </p>
                </div>
              ) : caseData ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Status Banner */}
                  <div
                    className="flex items-center justify-between p-5 rounded-2xl"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full" style={{ background: "var(--foreground)" }}>
                        <Scale className="w-4 h-4" style={{ color: "var(--background)" }} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Current State</p>
                        <p className="text-sm font-black" style={{ color: "var(--foreground)" }}>{caseData.status}</p>
                      </div>
                    </div>
                    <select
                      name="status"
                      defaultValue={caseData.status}
                      className="rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                      style={inputStyle}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>

                  {/* Client Selector */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2" style={{ color: "var(--muted)" }}>
                      <Users className="w-3 h-3" />
                      Client {!caseId && <span style={{ color: "#ef4444" }}>*</span>}
                    </label>
                    {caseId ? (
                      <div className="flex items-center gap-4 px-6 py-5 rounded-2xl" style={inputStyle}>
                        <UserIcon className="w-4 h-4" style={{ color: "var(--muted)" }} />
                        <span className="text-sm font-bold">{caseData.client?.name || "Unspecified Entity"}</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
                        <select
                          name="clientId"
                          required
                          defaultValue=""
                          className="w-full rounded-2xl pl-14 pr-6 py-5 text-sm focus:outline-none font-medium appearance-none cursor-pointer"
                          style={inputStyle}
                        >
                          <option value="" disabled>-- Select Client --</option>
                          {clients.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Case Info */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: "var(--muted)" }}>Litigation Title *</label>
                    <input
                      name="title"
                      defaultValue={caseData.title}
                      required
                      placeholder="e.g. State vs. Doe"
                      className="w-full rounded-2xl px-6 py-5 text-sm focus:outline-none font-medium"
                      style={inputStyle}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: "var(--muted)" }}>Registry Ref *</label>
                      <input
                        name="caseNumber"
                        defaultValue={caseData.caseNumber}
                        required
                        placeholder="#REF-001"
                        className="w-full rounded-2xl px-6 py-5 text-sm focus:outline-none font-medium"
                        style={inputStyle}
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: "var(--muted)" }}>Court Tier *</label>
                      <input
                        name="courtName"
                        defaultValue={caseData.courtName}
                        required
                        placeholder="e.g. Supreme Court"
                        className="w-full rounded-2xl px-6 py-5 text-sm focus:outline-none font-medium"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Judge */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: "var(--muted)" }}>Judge</label>
                    <input
                      name="judgeName"
                      defaultValue={caseData.judgeName || ""}
                      placeholder="e.g. Hon. Justice X"
                      className="w-full rounded-2xl px-6 py-5 text-sm focus:outline-none font-medium"
                      style={inputStyle}
                    />
                  </div>

                  {/* Error Banner */}
                  {error && (
                    <div
                      className="p-6 rounded-[2rem] space-y-4"
                      style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      <div className="flex items-start gap-4 text-[11px] font-black uppercase tracking-widest" style={{ color: "#ef4444" }}>
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                      </div>
                      
                      {error.toLowerCase().includes("limit reached") && (
                        <Link 
                          href="/pricing"
                          className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                        >
                          <Crown className="w-4 h-4" />
                          Upgrade to Pro Now
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Quick Schedule Section */}
                  {caseId && (
                    <div className="pt-8 space-y-6" style={{ borderTop: "1px solid var(--border)" }}>
                      <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: "var(--foreground)" }}>
                        Procedural History ({caseData.hearings?.length || 0})
                      </h3>

                      <div className="space-y-3">
                        {caseData.hearings?.map((h: Hearing) => (
                          <div
                            key={h.id}
                            className="p-4 rounded-2xl flex items-center justify-between"
                            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                          >
                            <div className="flex items-center gap-4">
                              <Calendar className="w-4 h-4" style={{ color: "var(--muted)" }} />
                              <span className="text-xs font-bold">
                                {new Date(h.hearingDate).toLocaleDateString()} — {new Date(h.hearingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Quick Enrollment Card */}
                      <div className="p-6 rounded-[2rem] space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                        <p className="text-[10px] font-black uppercase tracking-widest">Enroll Next Session</p>
                        <div className="space-y-3">
                          <input
                            ref={quickDateRef}
                            type="datetime-local"
                            className="w-full rounded-xl px-4 py-3 text-xs font-medium focus:outline-none"
                            style={inputStyle}
                          />
                          <input
                            ref={quickNotesRef}
                            type="text"
                            placeholder="Optional session notes..."
                            className="w-full rounded-xl px-4 py-3 text-xs font-medium focus:outline-none"
                            style={inputStyle}
                          />
                          <button
                            type="button"
                            onClick={handleQuickSchedule}
                            disabled={schedulingHearing}
                            className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:opacity-80 active:scale-[0.98]"
                            style={{ background: "var(--foreground)", color: "var(--background)" }}
                          >
                            {schedulingHearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Enroll Session</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Primary Actions */}
                  <div className="pt-8 flex items-center gap-4" style={{ borderTop: "1px solid var(--border)" }}>
                    {caseId && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={saving}
                        className="px-6 h-16 rounded-2xl font-black flex items-center justify-center transition-all shadow-sm"
                        style={{ background: "rgba(239,68,68,0.05)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:opacity-80 transition-all shadow-xl"
                      style={{ background: "var(--foreground)", color: "var(--background)" }}
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Commit Record</>}
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
