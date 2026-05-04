"use client";

/**
 * ============================================================
 * SettingsEditorDrawer
 * ─────────────────────────────────────────────────────────────
 * Contextual editor for practitioner preferences.
 * Added: API Key Management for mobile app connectivity.
 * ============================================================
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  X,
  Save,
  Loader2,
  User,
  Lock,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Mail,
  Fingerprint,
  Plus,
  Trash2,
  Copy,
  ShieldCheck,
  LogOut,
  Zap,
} from "lucide-react";
import { User as UserType } from "@/lib/types";

interface ApiKey {
  id: string;
  name: string;
  lastUsedAt?: string | Date | null;
}

interface SettingsEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
  currentUser?: UserType | null;
}

const inputStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
} as React.CSSProperties;

export function SettingsEditorDrawer({
  isOpen,
  onClose,
  section,
  currentUser,
}: SettingsEditorDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // API Key State
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    if (isOpen && section === "Security & Authentication") {
      const fetchKeys = async () => {
        try {
          const res = await fetch("/api/settings/keys");
          const json = await res.json();
          if (!ignore && json.success) setKeys(json.data);
        } catch {}
      };
      fetchKeys();
    }
    return () => { ignore = true; };
  }, [section, isOpen]);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/settings/keys");
      const json = await res.json();
      if (json.success) setKeys(json.data);
    } catch {}
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
    };

    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess("Profile intelligence updated successfully.");
        setTimeout(onClose, 1200);
      } else {
        setError(json.error?.message || "Failed to commit profile updates.");
      }
    } catch {
      setError("Network protocol failure.");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!newKeyName) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedKey(json.data.rawKey);
        setNewKeyName("");
        fetchKeys();
      }
    } catch {
      setError("Failed to generate key.");
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm("Revoke this access key? This will instantly disconnect any app using it.")) return;
    try {
      await fetch("/api/settings/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchKeys();
    } catch {}
  };

  const isSecurity = section === "Security & Authentication";
  const isProfile = section === "Profile & Identity";
  const isSubscription = section === "Subscription & Plan";

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
                  {isProfile ? <User className="w-5 h-5" style={{ color: "var(--background)" }} /> : 
                   isSubscription ? <CreditCard className="w-5 h-5" style={{ color: "var(--background)" }} /> :
                   <ShieldCheck className="w-5 h-5" style={{ color: "var(--background)" }} />}
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight uppercase" style={{ color: "var(--foreground)" }}>
                    {section}
                  </h2>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                    Secure Config Hub
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 rounded-full transition-all" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 lg:p-8 flex-1 pb-32">
              {success && (
                <div className="p-4 mb-6 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest" style={{ background: "rgba(34,197,94,0.05)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <CheckCircle2 className="w-4 h-4" />
                  {success}
                </div>
              )}

              {error && (
                <div className="p-4 mb-6 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest" style={{ background: "rgba(239,68,68,0.05)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {isProfile && (
                <form onSubmit={handleProfileSubmit} className="space-y-8">
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: "var(--muted)" }}>Practitioner Identity</label>
                    <div className="relative">
                      <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
                      <input
                        name="name"
                        defaultValue={currentUser?.name || ""}
                        required
                        className="w-full rounded-2xl pl-14 pr-6 py-5 text-sm focus:outline-none font-medium"
                        style={inputStyle}
                        placeholder="Adv. Abir Ahmed"
                      />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: "var(--muted)" }}>Digital Chamber (Email)</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
                      <input
                        name="email"
                        type="email"
                        defaultValue={currentUser?.email || ""}
                        required
                        className="w-full rounded-2xl pl-14 pr-6 py-5 text-sm focus:outline-none font-medium"
                        style={inputStyle}
                        placeholder="chamber@law.com"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={saving} className="w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-xl" style={{ background: "var(--foreground)", color: "var(--background)" }}>
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Sync Profile</>}
                  </button>
                </form>
              )}

              {isSecurity && (
                <div className="space-y-8">
                  {/* API Key Generation */}
                  <div className="p-6 rounded-[2rem] space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <h3 className="text-[10px] font-black uppercase tracking-widest">Generate Mobile API Key</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Key Label (e.g. My Android App)"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="flex-1 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none"
                        style={inputStyle}
                      />
                      <button
                        onClick={handleGenerateKey}
                        disabled={saving || !newKeyName}
                        className="p-3 rounded-xl transition-all"
                        style={{ background: "var(--foreground)", color: "var(--background)" }}
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </div>
                    {generatedKey && (
                      <div className="p-4 rounded-xl space-y-2" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)" }}>
                        <p className="text-[8px] font-black uppercase tracking-widest text-green-600">Key generated! Copy now, it won&apos;t be shown again.</p>
                        <div className="flex items-center justify-between bg-white/50 p-2 rounded-lg border">
                          <code className="text-[10px] font-mono break-all">{generatedKey}</code>
                          <button onClick={() => navigator.clipboard.writeText(generatedKey)} className="p-1 hover:bg-black/5 rounded"><Copy className="w-3 h-3" /></button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active Keys List */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest ml-1">Active Mobile Sessions</h3>
                    {keys.length === 0 ? (
                      <p className="text-[10px] italic opacity-40 ml-1">No active external keys found.</p>
                    ) : (
                      keys.map((key) => (
                        <div key={key.id} className="p-5 rounded-2xl flex items-center justify-between" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                          <div>
                            <p className="text-xs font-bold">{key.name}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-1">
                              Last sync: {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                            </p>
                          </div>
                          <button onClick={() => handleRevokeKey(key.id)} className="p-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {isSubscription && (
                <div className="space-y-8">
                   <div className="p-10 rounded-[3rem] bg-blue-600 text-white shadow-2xl relative overflow-hidden group">
                      <Zap className="absolute -right-8 -top-8 w-40 h-40 opacity-10 group-hover:rotate-12 transition-transform" />
                      <div className="relative z-10 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Active Protocol</p>
                        <h3 className="text-4xl font-black uppercase tracking-tight">{currentUser?.plan}</h3>
                        <div className="flex items-center gap-2 pt-4">
                           <ShieldCheck className="w-4 h-4" />
                           <span className="text-[10px] font-bold uppercase tracking-widest">Enterprise Grade Security Enabled</span>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest ml-1">Plan Management</h3>
                      <Link 
                        href="/pricing"
                        className="flex items-center justify-between p-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] hover:border-blue-500/50 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                           <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                              <Zap className="w-5 h-5 text-blue-500" />
                           </div>
                           <div>
                              <p className="text-sm font-black text-[var(--foreground)]">Upgrade Membership</p>
                              <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Explore premium tiers</p>
                           </div>
                        </div>
                        <Plus className="w-4 h-4 text-[var(--muted)] group-hover:text-blue-500 transition-colors" />
                      </Link>
                   </div>
                </div>
              )}

              {/* Other Stubs */}
              {!isProfile && !isSecurity && (
                <div className="p-8 text-center space-y-4 opacity-40">
                  <div className="p-4 rounded-full inline-block" style={{ background: "var(--surface-2)" }}>
                    <Lock className="w-8 h-8" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Configuring {section} module...</p>
                </div>
              )}

              {/* Shared Logout Protocol */}
              <div className="mt-12 pt-8 border-t" style={{ borderColor: "var(--border)" }}>
                <button 
                  onClick={async () => {
                    try {
                      await fetch("/api/auth/logout", { method: "POST" });
                    } catch {}
                    window.location.href = "/";
                  }}
                  className="w-full h-16 rounded-2xl bg-red-500/10 text-red-500 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-red-500 hover:text-white transition-all shadow-lg border border-red-500/20"
                >
                  <LogOut className="w-4 h-4" /> Sign Out from System
                </button>
                <p className="text-center text-[8px] font-bold uppercase tracking-[0.2em] mt-4 opacity-40">
                  Version 4.2.1 • Secure Session Environment
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
