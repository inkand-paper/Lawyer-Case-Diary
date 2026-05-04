"use client";

/**
 * ============================================================
 * ClientEditorDrawer
 * ─────────────────────────────────────────────────────────────
 * Hub for managing client records and contact intelligence.
 * RESPONSIVENESS: Optimized for mobile with improved z-index
 * and bottom padding to account for navigation bars.
 * ============================================================
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Trash2,
  Loader2,
  AlertCircle,
  Fingerprint,
} from "lucide-react";
import { Client } from "@/lib/types";
import { fetchJson } from "@/lib/fetch-json";

interface ClientEditorDrawerProps {
  isOpen: boolean;
  clientId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const inputStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
} as React.CSSProperties;

export function ClientEditorDrawer({
  isOpen,
  clientId,
  onClose,
  onSuccess,
}: ClientEditorDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [clientData, setClientData] = useState<Partial<Client> | null>(null);

  useEffect(() => {
    let ignore = false;
    if (isOpen) {
      const init = async () => {
        try {
          if (clientId) {
            setLoading(true);
            const json = await fetchJson<{ success: boolean; data: Partial<Client>; error?: { message: string } }>(`/api/clients/${clientId}`);
            if (!ignore) {
              if (json?.success) setClientData(json.data);
              else setError(json?.error?.message || "Failed to load client.");
            }
          } else {
            if (!ignore) {
              setClientData({ name: "", email: "", phone: "", address: "" });
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
  }, [isOpen, clientId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const method = clientId ? "PUT" : "POST";
    const endpoint = clientId ? `/api/clients/${clientId}` : `/api/clients`;

    const payload = {
      name: formData.get("name"),
      email: formData.get("email") || undefined,
      phone: formData.get("phone") || undefined,
      address: formData.get("address") || undefined,
    };

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
        setError(json.error?.message || "Record validation failed.");
      }
    } catch {
      setError("Critical network sync failure.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!clientId || !confirm("Are you certain? Deleting a client will orphan all their active case files."))
      return;

    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        onSuccess();
        onClose();
      } else {
        setError(json.error?.message || "Deletion sequence failed.");
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
                  <User className="w-5 h-5" style={{ color: "var(--background)" }} />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight uppercase" style={{ color: "var(--foreground)" }}>
                    {clientId ? "Client Protocol" : "Client Intake"}
                  </h2>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                    {clientId ? "Modify relationship registry" : "Register new legal entity"}
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
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Retrieving Records...</p>
                </div>
              ) : clientData ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2" style={{ color: "var(--muted)" }}>
                      <Fingerprint className="w-3 h-3" />
                      Legal Identity *
                    </label>
                    <input
                      name="name"
                      defaultValue={clientData.name}
                      required
                      placeholder="e.g. Mr. Kamal Hossain"
                      className="w-full rounded-2xl px-6 py-5 text-sm focus:outline-none font-medium"
                      style={inputStyle}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2" style={{ color: "var(--muted)" }}>
                        <Mail className="w-3 h-3" />
                        Chamber Email
                      </label>
                      <input
                        name="email"
                        type="email"
                        defaultValue={clientData.email || ""}
                        placeholder="client@example.com"
                        className="w-full rounded-2xl px-6 py-5 text-sm focus:outline-none font-medium"
                        style={inputStyle}
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2" style={{ color: "var(--muted)" }}>
                        <Phone className="w-3 h-3" />
                        Primary Contact
                      </label>
                      <input
                        name="phone"
                        defaultValue={clientData.phone || ""}
                        placeholder="+880 1700..."
                        className="w-full rounded-2xl px-6 py-5 text-sm focus:outline-none font-medium"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2" style={{ color: "var(--muted)" }}>
                      <MapPin className="w-3 h-3" />
                      Judicial Address
                    </label>
                    <textarea
                      name="address"
                      defaultValue={clientData.address || ""}
                      rows={4}
                      placeholder="Enter full judicial residence..."
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
                    {clientId && (
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
