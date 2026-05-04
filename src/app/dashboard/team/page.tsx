"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Crown, 
  ShieldCheck, 
  Scale, 
  Loader2, 
  Plus, 
  Check, 
  X,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Chamber, Invitation } from "@/lib/types";
import { fetchJson } from "@/lib/fetch-json";

export default function TeamHub() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [chamber, setChamber] = useState<Chamber | null>(null);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [meJson, chamberJson, inviteJson] = await Promise.all([
        fetchJson<{ success: boolean; data: User }>("/api/me"),
        fetchJson<{ success: boolean; data: Chamber }>("/api/chambers"),
        fetchJson<{ success: boolean; data: Invitation[] }>("/api/chambers/invites")
      ]);

      if (meJson?.success) setUser(meJson.data);
      if (chamberJson?.success) setChamber(chamberJson.data);
      if (inviteJson?.success) setInvites(inviteJson.data);
    } catch (err) {
      setError("Failed to synchronize team data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      try {
        const [meJson, chamberJson, inviteJson] = await Promise.all([
          fetchJson<{ success: boolean; data: User }>("/api/me"),
          fetchJson<{ success: boolean; data: Chamber }>("/api/chambers"),
          fetchJson<{ success: boolean; data: Invitation[] }>("/api/chambers/invites")
        ]);

        if (!ignore) {
          if (meJson?.success) setUser(meJson.data);
          if (chamberJson?.success) setChamber(chamberJson.data);
          if (inviteJson?.success) setInvites(inviteJson.data);
        }
      } catch {
        if (!ignore) setError("Failed to synchronize team data.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    init();
    return () => { ignore = true; };
  }, []);

  const handleCreateChamber = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/chambers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      const json = await res.json();
      if (json.success) {
        setSuccess("Chamber initialized successfully!");
        fetchData();
      } else {
        setError(json.error?.message || "Creation failed.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/chambers/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail })
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(`Invitation sent to ${inviteEmail}`);
        setInviteEmail("");
        setShowInviteForm(false);
        fetchData();
      } else {
        setError(json.error?.message || "Failed to send invite.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteAction = async (inviteId: string, action: "ACCEPT" | "DECLINE") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/chambers/invites/${inviteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      } else {
        setError(json.error?.message);
      }
    } catch {
      setError("Sync failure.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-muted" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Synchronizing Team Hub...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase text-[var(--foreground)]">Team Hub</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--muted)]">Professional Collaboration Protocol</p>
            </div>
          </div>
        </div>

        {chamber && (
          <button
            onClick={() => setShowInviteForm(true)}
            className="px-8 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95"
          >
            <UserPlus className="w-4 h-4" /> Invite Lawyer
          </button>
        )}
      </div>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-500 text-[10px] font-black uppercase tracking-widest"
          >
            <AlertCircle className="w-4 h-4" /> {error}
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-4 text-green-500 text-[10px] font-black uppercase tracking-widest"
          >
            <Check className="w-4 h-4" /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Invitations (If any) */}
        {!chamber && invites.length > 0 && (
          <div className="lg:col-span-12 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
              <Mail className="w-3 h-3" /> Pending Invitations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invites.map((inv) => (
                <div key={inv.id} className="p-6 rounded-[2rem] bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <Scale className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[var(--foreground)]">{inv.chamber?.name}</p>
                      <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Invitation to join Chamber</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleInviteAction(inv.id, "ACCEPT")}
                      className="p-3 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleInviteAction(inv.id, "DECLINE")}
                      className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CENTER: Chamber Context */}
        {chamber ? (
          <>
            <div className="lg:col-span-8 space-y-8">
              {/* Chamber Identity */}
              <div className="p-10 rounded-[3rem] bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500">Chamber Identity</p>
                    <h2 className="text-4xl font-black tracking-tight uppercase text-[var(--foreground)]">{chamber.name}</h2>
                  </div>
                  <div className="p-4 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-inner">
                    <Scale className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[var(--border)]">
                   <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]">Total Members</p>
                      <p className="text-xl font-black text-[var(--foreground)]">{chamber.members?.length ?? 0}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]">Active Invites</p>
                      <p className="text-xl font-black text-[var(--foreground)]">{chamber.invites?.length ?? 0}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]">Registry Protocol</p>
                      <p className="text-xl font-black text-green-500 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Verified
                      </p>
                   </div>
                </div>
              </div>

              {/* Member List */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 flex items-center gap-2 px-2">
                  <Users className="w-3 h-3" /> Practitioner Directory
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {chamber.members?.map((member) => (
                    <div key={member.id} className="p-6 rounded-[2rem] bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between hover:border-blue-500/30 transition-all group">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl font-black text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-[var(--foreground)]">{member.name}</p>
                            {member.id === chamber.ownerId && (
                              <Crown className="w-3 h-3 text-amber-500" />
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-zinc-900 border border-zinc-800 text-[var(--muted)]">
                            {member.id === chamber.ownerId ? "Principal" : "Associate"}
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Invites Status */}
            <div className="lg:col-span-4 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 flex items-center gap-2 px-2">
                  <Mail className="w-3 h-3" /> Outgoing Requests
                </h3>
                <div className="space-y-4">
                  {(chamber.invites?.length ?? 0) === 0 && (
                    <div className="p-10 rounded-[2rem] border border-dashed border-[var(--border)] text-center space-y-3">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-30">No pending requests</p>
                    </div>
                  )}
                  {chamber.invites?.map((inv) => (
                    <div key={inv.id} className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-bold truncate max-w-[150px]">{inv.email}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-amber-500">Awaiting Response</p>
                      </div>
                      <button className="p-2 text-red-500/50 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
            </div>
          </>
        ) : (
          <div className="lg:col-span-12">
            <div className="max-w-2xl mx-auto p-12 rounded-[3rem] bg-[var(--surface)] border border-[var(--border)] shadow-2xl text-center space-y-8">
               <div className="w-24 h-24 rounded-[2rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto shadow-2xl">
                  <Scale className="w-12 h-12 text-blue-500" />
               </div>
               <div className="space-y-3">
                 <h2 className="text-3xl font-black tracking-tighter uppercase text-[var(--foreground)]">Initialize Your Chamber</h2>
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] max-w-sm mx-auto">
                    Create a shared digital infrastructure for your firm and collaborate with other practitioners.
                 </p>
               </div>

               {user?.plan === "ULTIMATE" || user?.role === "ADMIN" ? (
                 <form onSubmit={handleCreateChamber} className="space-y-4 max-w-md mx-auto">
                    <input 
                      name="name"
                      required
                      placeholder="e.g. Phoenix Legal Chambers"
                      className="w-full h-16 rounded-2xl px-6 bg-[var(--surface-2)] border border-[var(--border)] text-sm font-black focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full h-16 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:opacity-90 transition-all shadow-xl"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-4 h-4" /> Initialize Protocol</>}
                    </button>
                 </form>
               ) : (
                 <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-4">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Premium Feature Restricted</p>
                    <p className="text-xs font-medium text-[var(--muted)]">Shared access for teams requires the **Premium** plan.</p>
                    <a href="/pricing" className="inline-block px-6 py-3 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                      Upgrade to Unlock
                    </a>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteForm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowInviteForm(false)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-[var(--background)] border border-[var(--border)] rounded-[2.5rem] p-10 shadow-2xl space-y-8"
              >
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500">Recruitment</p>
                      <h3 className="text-2xl font-black uppercase tracking-tight text-[var(--foreground)]">Invite Lawyer</h3>
                   </div>
                   <button onClick={() => setShowInviteForm(false)} className="p-3 rounded-full bg-[var(--surface)] text-[var(--muted)]">
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <form onSubmit={handleSendInvite} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-[var(--muted)]">Practitioner Email</label>
                      <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                        <input 
                          type="email"
                          required
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="lawyer@example.com"
                          className="w-full h-16 rounded-2xl pl-14 pr-6 bg-[var(--surface)] border border-[var(--border)] text-sm font-medium focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                   </div>

                   <button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-xl hover:bg-blue-500 transition-all"
                   >
                     {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Send Invitation</>}
                   </button>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
