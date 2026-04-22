"use client";

/**
 * ============================================================
 * QuickCaseForm — High-Fidelity Responsive Modal
 * ─────────────────────────────────────────────────────────────
 * Adaptive UI: Slides up from bottom on mobile, centers on desktop.
 * Step 1: Client Enrollment
 * Step 2: Case Initialization
 *
 * Performance: Optimized with Framer Motion for premium feel.
 * ============================================================
 */

import { useState } from "react";
import {
  Plus,
  X,
  Loader2,
  Scale,
  Briefcase,
  User,
  MapPin,
  ChevronRight,
  AlertCircle,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const inputStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
} as React.CSSProperties;

export function QuickCaseForm({ onCaseCreated }: { onCaseCreated: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");

  const resetForm = () => {
    setStep(1);
    setClientId(null);
    setClientName("");
    setError("");
    setIsOpen(false);
  };

  const handleClientSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("clientName"),
          phone: formData.get("clientPhone") || undefined,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setClientId(result.data.id);
        setClientName(result.data.name);
        setStep(2);
      } else {
        setError(result.error?.message || "Client enrollment failed.");
      }
    } catch {
      setError("Network protocol failure.");
    } finally {
      setLoading(false);
    }
  };

  const handleCaseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          caseNumber: formData.get("caseNumber"),
          courtName: formData.get("courtName"),
          clientId,
        }),
      });
      const result = await res.json();
      if (result.success) {
        resetForm();
        onCaseCreated();
      } else {
        setError(result.error?.message || "Case registration failed.");
      }
    } catch {
      setError("Network protocol failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 w-16 h-16 lg:w-20 lg:h-20 rounded-full shadow-2xl flex items-center justify-center transition-all z-[90] active:scale-90 group"
        style={{
          background: "var(--foreground)",
          color: "var(--background)",
          border: "2px solid var(--border)",
        }}
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-lg sm:rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative z-10 overflow-y-auto max-h-[90vh] custom-scrollbar"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Desktop specific top bar */}
              <div className="hidden sm:block absolute top-0 left-0 right-0 h-1 rounded-t-[2.5rem]" style={{ background: "var(--foreground)" }} />
              
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl" style={{ background: "var(--foreground)" }}>
                      <Scale className="w-5 h-5" style={{ color: "var(--background)" }} />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tighter" style={{ color: "var(--foreground)" }}>
                      {step === 1 ? "Client Intake" : "Case Registry"}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] ml-1">
                    <span style={{ color: step === 1 ? "var(--foreground)" : "var(--muted)" }}>Entity</span>
                    <ChevronRight className="w-3 h-3" style={{ color: "var(--border)" }} />
                    <span style={{ color: step === 2 ? "var(--foreground)" : "var(--muted)" }}>Protocol</span>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 rounded-full transition-all"
                  style={{ background: "var(--surface-2)", color: "var(--muted)" }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Step 1: Client */}
              {step === 1 && (
                <form onSubmit={handleClientSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: "var(--muted)" }}>Client Legal Name *</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
                      <input
                        name="clientName"
                        required
                        className="w-full rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none font-medium"
                        style={inputStyle}
                        placeholder="e.g. Adv. Kamal Hossain"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: "var(--muted)" }}>Contact Number</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
                      <input
                        name="clientPhone"
                        className="w-full rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none font-medium"
                        style={inputStyle}
                        placeholder="+880 1..."
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all hover:opacity-80 active:scale-[0.98] shadow-xl mt-4"
                    style={{ background: "var(--foreground)", color: "var(--background)" }}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Enroll & Continue <ChevronRight className="w-4 h-4" /></>}
                  </button>
                </form>
              )}

              {/* Step 2: Case */}
              {step === 2 && (
                <form onSubmit={handleCaseSubmit} className="space-y-5">
                  <div className="p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--foreground)" }} />
                    Linking record to: {clientName}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: "var(--muted)" }}>Case Title *</label>
                    <div className="relative">
                      <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
                      <input
                        name="title"
                        required
                        className="w-full rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none font-medium"
                        style={inputStyle}
                        placeholder="e.g. Litigation vs. X"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: "var(--muted)" }}>Reference Code *</label>
                      <input
                        name="caseNumber"
                        required
                        className="w-full rounded-2xl px-6 py-4 text-sm focus:outline-none font-medium"
                        style={inputStyle}
                        placeholder="#REF-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: "var(--muted)" }}>Court Tier *</label>
                      <div className="relative">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
                        <input
                          name="courtName"
                          required
                          className="w-full rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none font-medium"
                          style={inputStyle}
                          placeholder="Supreme Court"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all hover:opacity-80 active:scale-[0.98] shadow-xl mt-4"
                    style={{ background: "var(--foreground)", color: "var(--background)" }}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Commit to Repository"}
                  </button>
                </form>
              )}

              <p className="mt-8 text-center text-[8px] font-black uppercase tracking-[0.4em] opacity-40">Judicial Security Protocol Active</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
