"use client";

/**
 * ============================================================
 * HearingEditorDrawer
 * ─────────────────────────────────────────────────────────────
 * Slide-in drawer for scheduling and modifying court sessions.
 * RESPONSIVENESS: Improved z-index and bottom padding for
 * reliable mobile accessibility.
 * ============================================================
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Scale,
  Loader2,
  Save,
  Trash2,
  AlertCircle,
  Clock,
  FileText,
  Briefcase,
} from "lucide-react";
import { Hearing, Case } from "@/lib/types";
import { fetchJson } from "@/lib/fetch-json";

interface HearingEditorDrawerProps {
  isOpen: boolean;
  hearingId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const inputStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
} as React.CSSProperties;

export function HearingEditorDrawer({
  isOpen,
  hearingId,
  onClose,
  onSuccess,
}: HearingEditorDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cases, setCases] = useState<Case[]>([]);
  const [hearingData, setHearingData] = useState<Partial<Hearing> | null>(null);

  useEffect(() => {
    let ignore = false;
    if (isOpen) {
      const init = async () => {
        try {
          // fetch cases
          const cJson = await fetchJson<{ success: boolean; data: Case[] }>("/api/cases");
          if (!ignore && cJson?.success) setCases(cJson.data);

          if (hearingId) {
            setLoading(true);
            const json = await fetchJson<{ success: boolean; data: Hearing; error?: { message: string } }>(`/api/hearings/${hearingId}`);
            if (!ignore) {
              if (json?.success) setHearingData(json.data);
              else setError(json?.error?.message || "Failed to load hearing.");
            }
          } else {
            if (!ignore) {
              setHearingData({ caseId: "", hearingDate: "", notes: "" });
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
    return () => { ignore = true; };
  }, [isOpen, hearingId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const method = hearingId ? "PUT" : "POST";
    const endpoint = hearingId ? `/api/hearings/${hearingId}` : `/api/hearings`;

    try {
      // Ensure the date is treated as LOCAL time by the browser before converting to ISO for the server
      const localDateStr = formData.get("hearingDate") as string;
      const isoDate = localDateStr ? new Date(localDateStr).toISOString() : undefined;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: formData.get("caseId"),
          hearingDate: isoDate,
          notes: formData.get("notes") || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        onSuccess();
        onClose();
      } else {
        setError(json.error?.message || "Failed to save hearing.");
      }
    } catch {
      setError("Network error — synchronization failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!hearingId || !confirm("Permanently remove this hearing from the docket?"))
      return;

    setSaving(true);
    try {
      const res = await fetch(`/api/hearings/${hearingId}`, { method: "DELETE" });
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[120]"
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
            {/* Header */}
            <div
              className="sticky top-0 p-6 flex items-center justify-between z-10 shadow-sm"
              style={{
                background: "var(--surface)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl" style={{ background: "var(--foreground)" }}>
                  <Calendar className="w-5 h-5" style={{ color: "var(--background)" }} />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight uppercase" style={{ color: "var(--foreground)" }}>
                    {hearingId ? "Hearing Protocol" : "Schedule Session"}
                  </h2>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                    {hearingId ? "Modify judicial appointment" : "Initialize court docket"}
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

            {/* Content Area */}
            <div className="p-6 lg:p-8 flex-1 pb-32 lg:pb-12">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--muted)" }} />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Recovering docket data...</p>
                </div>
              ) : hearingData ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2" style={{ color: "var(--muted)" }}>
                      <Briefcase className="w-3 h-3" />
                      Associated Case Entity *
                    </label>
                    <div className="relative">
                      <Scale className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
                      <select
                        name="caseId"
                        required
                        defaultValue={hearingData.caseId}
                        className="w-full rounded-2xl pl-14 pr-6 py-5 text-sm focus:outline-none font-medium appearance-none cursor-pointer"
                        style={inputStyle}
                      >
                        <option value="" disabled>-- Choose Registry Entry --</option>
                        {cases.map((c) => (
                          <option key={c.id} value={c.id}>{c.title} ({c.caseNumber})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2" style={{ color: "var(--muted)" }}>
                      <Clock className="w-3 h-3" />
                      Docket Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="hearingDate"
                      required
                      defaultValue={
                        hearingData.hearingDate 
                          ? (() => {
                              const d = new Date(hearingData.hearingDate);
                              // Manually adjust for local timezone offset to get the correct "datetime-local" string
                              const offset = d.getTimezoneOffset() * 60000;
                              return new Date(d.getTime() - offset).toISOString().slice(0, 16);
                            })()
                          : ""
                      }
                      className="w-full rounded-2xl px-6 py-5 text-sm focus:outline-none font-medium"
                      style={inputStyle}
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2" style={{ color: "var(--muted)" }}>
                      <FileText className="w-3 h-3" />
                      Judicial Briefing
                    </label>
                    <textarea
                      name="notes"
                      rows={6}
                      defaultValue={hearingData.notes || ""}
                      placeholder="Enter session notes..."
                      className="w-full rounded-2xl px-6 py-5 text-sm focus:outline-none font-medium resize-none"
                      style={inputStyle}
                    />
                  </div>

                  {error && (
                    <div className="p-5 rounded-2xl flex items-start gap-4 text-[11px] font-black uppercase tracking-widest" style={{ background: "rgba(239,68,68,0.05)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="pt-8 flex items-center gap-4" style={{ borderTop: "1px solid var(--border)" }}>
                    {hearingId && (
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
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> {hearingId ? "Commit Docket" : "Schedule Session"}</>}
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
