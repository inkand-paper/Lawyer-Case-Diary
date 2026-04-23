"use client";

/**
 * ============================================================
 * CasesPage — Advanced Legal Repository
 * ─────────────────────────────────────────────────────────────
 * Primary interface for managing judicial files.
 * SYNC: Integrated with Global Search via SearchContext.
 * ============================================================
 */

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Briefcase,
  MapPin,
  Scale,
  MoreHorizontal,
  Filter,
  Loader2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { CaseEditorDrawer } from "@/components/dashboard/CaseEditorDrawer";
import { useSearch } from "@/context/SearchContext";

export default function CasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Global Search & Local Filter State
  const { searchQuery, setSearchQuery } = useSearch();
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "CLOSED">("ALL");

  const fetchCases = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cases");
      const json = await res.json();
      if (json.success) {
        setCases(json.data);
      } else {
        setError(json.error?.message || "Failed to load judicial records.");
      }
    } catch {
      setError("Network protocol synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.client?.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [cases, searchQuery, statusFilter]);

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>
            Case Repository
          </h1>
          <p className="font-medium" style={{ color: "var(--muted)" }}>
            Manage and monitor all legal proceedings in one location.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCaseId(null);
            setDrawerOpen(true);
          }}
          className="h-14 px-8 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all hover:opacity-80 shadow-lg"
          style={{ background: "var(--foreground)", color: "var(--background)" }}
        >
          <Plus className="w-5 h-5" />
          New Case
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-foreground" style={{ color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="Search within cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none transition-all font-medium"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-full px-5 rounded-2xl font-bold text-xs uppercase tracking-widest outline-none appearance-none cursor-pointer"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            <option value="ALL">All States</option>
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed</option>
          </select>
          <button
            className="h-full px-6 rounded-2xl flex items-center gap-2 font-bold text-xs uppercase tracking-widest border"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted)" }}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
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
              <p className="text-[10px] font-black uppercase tracking-widest text-muted">Recovering Records...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-4 opacity-40">
              <Briefcase className="w-10 h-10 text-muted" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted">No matching records found.</p>
            </div>
          ) : (
            filteredCases.map((c) => (
              <motion.div
                key={c.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedCaseId(c.id);
                  setDrawerOpen(true);
                }}
                className="p-5 rounded-3xl border surface flex flex-col gap-4 shadow-sm active:bg-[var(--surface-2)] transition-colors"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center shrink-0">
                      <Scale className="w-4 h-4 text-background" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold leading-tight text-foreground">{c.title}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted mt-0.5">{c.caseNumber}</p>
                    </div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0"
                    style={c.status === "ACTIVE" 
                      ? { background: "var(--foreground)", color: "var(--background)", borderColor: "var(--foreground)" }
                      : { background: "var(--surface-2)", color: "var(--muted)", borderColor: "var(--border)" }
                    }
                  >
                    {c.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-base">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted">Client Entity</span>
                    <span className="text-xs font-bold text-foreground">{c.client?.name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col gap-1 items-end text-right">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted">Presiding Judge</span>
                    <span className="text-xs font-bold text-foreground truncate max-w-[120px]">{c.judgeName || "Assigned"}</span>
                  </div>
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
                  {["Case Profile", "Client Entity", "Presiding Judge", "Status", "Actions"].map((h, i) => (
                    <th key={h} className="px-8 py-5 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>
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
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>Recovering Records...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <Briefcase className="w-10 h-10" style={{ color: "var(--muted)" }} />
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>No matching records found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="cursor-pointer group hover:bg-[var(--surface)] transition-colors"
                      style={{ borderBottom: "1px solid var(--border)" }}
                      onClick={() => {
                        setSelectedCaseId(c.id);
                        setDrawerOpen(true);
                      }}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl transition-all group-hover:scale-110" style={{ background: "var(--foreground)" }}>
                            <Scale className="w-4 h-4" style={{ color: "var(--background)" }} />
                          </div>
                          <div>
                            <p className="text-sm font-bold tracking-tight" style={{ color: "var(--foreground)" }}>{c.title}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "var(--muted)" }}>{c.caseNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--border)" }} />
                          <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{c.client?.name || "System Record"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--muted)" }}>
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{c.judgeName || "Assigned by Court"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                          style={c.status === "ACTIVE" 
                            ? { background: "var(--foreground)", color: "var(--background)", borderColor: "var(--foreground)" }
                            : { background: "var(--surface-2)", color: "var(--muted)", borderColor: "var(--border)" }
                          }
                        >
                          {c.status}
                        </span>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CaseEditorDrawer
        isOpen={drawerOpen}
        caseId={selectedCaseId}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => {
          fetchCases();
          setDrawerOpen(false);
        }}
      />
    </div>
  );
}
