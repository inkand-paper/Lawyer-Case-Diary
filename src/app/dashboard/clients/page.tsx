"use client";

/**
 * ============================================================
 * ClientsPage — Clients
 * ─────────────────────────────────────────────────────────────
 * Central hub for managing judicial entities and clients.
 * SYNC: Integrated with Global Search via SearchContext.
 * ============================================================
 */

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  UserCircle2, 
  Loader2,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { ClientEditorDrawer } from "@/components/dashboard/ClientEditorDrawer";
import { useSearch } from "@/context/SearchContext";
import { Client } from "@/lib/types";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
  // Global Search State
  const { searchQuery, setSearchQuery } = useSearch();

  const fetchClients = async () => {
    setError("");
    try {
      const res = await fetch("/api/clients");
      const json = await res.json();
      if (json.success) {
        setClients(json.data);
      } else {
        setError(json.error?.message || "Failed to load client registry.");
      }
    } catch {
      setError("Network protocol failure.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      try {
        const res = await fetch("/api/clients");
        const json = await res.json();
        if (!ignore) {
          if (json.success) setClients(json.data);
          else setError(json.error?.message || "Failed to load records.");
        }
      } catch {
        if (!ignore) setError("Network protocol failure.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    init();
    return () => { ignore = true; };
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>
            Client Directory
          </h1>
          <p className="font-medium" style={{ color: "var(--muted)" }}>
            Manage your professional relationships and contact registry.
          </p>
        </div>
        <button
          onClick={() => { setSelectedClientId(null); setDrawerOpen(true); }}
          className="h-14 px-8 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all hover:opacity-80 shadow-lg"
          style={{ background: "var(--foreground)", color: "var(--background)" }}
        >
          <Plus className="w-5 h-5" />
          New Client
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-foreground" style={{ color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="Search within clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none transition-all font-medium"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
        </div>
        <button
          className="px-6 h-14 rounded-2xl flex items-center gap-2 font-bold text-xs uppercase tracking-widest border"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted)" }}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 rounded-[2rem] flex items-center gap-4" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* Registry Display (Table on Desktop, Cards on Mobile) */}
      <div className="space-y-4 lg:space-y-0">
        {/* Mobile Card View */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-muted" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted">Loading...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="py-20 text-center opacity-40">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted">No matching entities found.</p>
            </div>
          ) : (
            filteredClients.map((c) => (
              <motion.div
                key={c.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedClientId(c.id);
                  setDrawerOpen(true);
                }}
                className="p-5 rounded-3xl border surface flex flex-col gap-4 shadow-sm active:bg-[var(--surface-2)] transition-colors"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center shrink-0">
                      <UserCircle2 className="w-4 h-4 text-background" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold leading-tight text-foreground">{c.name}</h3>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted mt-0.5">UID: {c.id?.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{ background: "var(--foreground)", color: "var(--background)" }}
                  >
                    {c._count?.cases || 0}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-base">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-muted">
                    <Mail className="w-3 h-3" />
                    <span>{c.email || "No email mapped"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-muted">
                    <Phone className="w-3 h-3" />
                    <span>{c.phone || "No contact mapped"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span
                    className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border"
                    style={{ background: "var(--surface-2)", color: "var(--muted)", borderColor: "var(--border)" }}
                  >
                    {c.name?.toLowerCase().includes("inc") || c.name?.toLowerCase().includes("corp") ? "Entity" : "Individual"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted" />
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block rounded-[2.5rem] overflow-hidden shadow-sm" style={{ border: "1px solid var(--border)" }}>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                  {["Client Profile", "Contact Intelligence", "Classification", "Active Load", "Actions"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest ${i === 4 ? "text-right" : ""}`}
                      style={{ color: "var(--muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--muted)" }} />
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>Loading...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: "var(--muted)" }}>
                        No matching entities found in the registry.
                      </p>
                    </td>
                  </tr>
                ) : filteredClients.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    onClick={() => { setSelectedClientId(c.id); setDrawerOpen(true); }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="cursor-pointer group hover:bg-[var(--surface)] transition-colors"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl transition-all group-hover:scale-110" style={{ background: "var(--foreground)" }}>
                          <UserCircle2 className="w-4 h-4" style={{ color: "var(--background)" }} />
                        </div>
                        <div>
                          <p className="text-sm font-bold tracking-tight" style={{ color: "var(--foreground)" }}>{c.name}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest mt-0.5 opacity-60" style={{ color: "var(--muted)" }}>
                            UID: {c.id?.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-[11px] font-bold" style={{ color: "var(--muted)" }}>
                          <Mail className="w-3 h-3" />
                          <span>{c.email || "No email mapped"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold" style={{ color: "var(--muted)" }}>
                          <Phone className="w-3 h-3" />
                          <span>{c.phone || "No contact mapped"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                        style={{ background: "var(--surface-2)", color: "var(--muted)", borderColor: "var(--border)" }}
                      >
                        {c.name?.toLowerCase().includes("inc") || c.name?.toLowerCase().includes("corp") ? "Entity" : "Individual"}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all group-hover:scale-110"
                        style={{ background: "var(--foreground)", color: "var(--background)" }}
                      >
                        {c._count?.cases || 0}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button className="p-2 rounded-xl transition-all hover:bg-[var(--surface-2)]" style={{ color: "var(--muted)" }}>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-xl transition-all hover:bg-[var(--surface-2)]" style={{ color: "var(--muted)" }}>
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ClientEditorDrawer
        isOpen={drawerOpen}
        clientId={selectedClientId}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => { fetchClients(); setDrawerOpen(false); }}
      />
    </div>
  );
}
