"use client";

import { useState } from "react";
import { Plus, X, Loader2, Scale, Briefcase, User, MapPin, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Procedural Action Panel (QuickCaseForm)
 * Two-step process:
 *   Step 1 — Register a new client (or select existing)
 *   Step 2 — Initialize a new case linked to that client
 */
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

  // Step 1: Create Client
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
        setError(result.error?.message || "Failed to register client.");
      }
    } catch {
      setError("System connectivity failure.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Create Case linked to the new client
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
        setError(result.error?.message || "Failed to commit case record.");
      }
    } catch {
      setError("Critical system sync failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-6 lg:bottom-10 lg:right-10 bg-indigo-600 text-white p-5 lg:p-6 rounded-[2rem] shadow-2xl shadow-indigo-600/40 hover:scale-110 active:scale-95 transition-all z-50 group border border-indigo-400/30"
      >
        <Plus className="w-6 h-6 lg:w-8 lg:h-8 group-hover:rotate-90 transition-transform duration-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-end lg:items-center justify-center p-4 lg:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-900" />

              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="bg-white/5 p-2 rounded-xl">
                      <Scale className="w-4 h-4 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">
                      {step === 1 ? "Register Client" : "Initialize Case"}
                    </h3>
                  </div>
                  {/* Step indicator */}
                  <div className="flex items-center gap-1 ml-12">
                    <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${step === 1 ? "text-indigo-400" : "text-zinc-600"}`}>Step 1: Client</span>
                    <ChevronRight className="w-3 h-3 text-zinc-700" />
                    <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${step === 2 ? "text-indigo-400" : "text-zinc-600"}`}>Step 2: Case</span>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-white/5 rounded-full transition-all"
                >
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>

              {/* Error State */}
              {error && (
                <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-2xl">
                  {error}
                </div>
              )}

              {/* STEP 1: Client Registration */}
              {step === 1 && (
                <form onSubmit={handleClientSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Client Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        name="clientName"
                        required
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                        placeholder="e.g. Mr. Kamal Hossain"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Phone (Optional)</label>
                    <input
                      name="clientPhone"
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                      placeholder="+880 1700 000001"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 mt-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Register & Continue <ChevronRight className="w-4 h-4" /></>}
                  </button>
                </form>
              )}

              {/* STEP 2: Case Initialization */}
              {step === 2 && (
                <form onSubmit={handleCaseSubmit} className="space-y-4">
                  <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    Linking case to: {clientName}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Case Designation</label>
                    <div className="relative group">
                      <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        name="title"
                        required
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                        placeholder="e.g. State vs. John Doe"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Registry Code</label>
                      <input
                        name="caseNumber"
                        required
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                        placeholder="#SL-2024"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Court Tier</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                        <input
                          name="courtName"
                          required
                          className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                          placeholder="High Court"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 mt-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Commit to Registry"}
                  </button>
                </form>
              )}

              <p className="mt-6 text-center text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">Authorized Access Only</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
