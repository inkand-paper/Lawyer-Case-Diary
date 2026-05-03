"use client";

/**
 * ============================================================
 * HearingsPage — Professional Judicial Timeline
 * ─────────────────────────────────────────────────────────────
 * Displays all scheduled hearings with advanced filtering.
 * SYNC: Integrated with Global Search via SearchContext.
 * ============================================================
 */

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Calendar, 
  MapPin, 
  MoreHorizontal, 
  Scale, 
  Clock, 
  Edit2, 
  AlertCircle,
  Search,
  Filter,
  Loader2
} from "lucide-react";
import { HearingEditorDrawer } from "@/components/dashboard/HearingEditorDrawer";
import { useSearch } from "@/context/SearchContext";

export default function HearingsPage() {
  const [hearings, setHearings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedHearingId, setSelectedHearingId] = useState<string | null>(null);

  // Global Search & Local Filter State
  const { searchQuery, setSearchQuery } = useSearch();
  const [timeFilter, setTimeFilter] = useState<"ALL" | "UPCOMING" | "PAST">("ALL");

  const fetchHearings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/hearings");
      const json = await res.json();
      if (json.success) {
        setHearings(json.data);
      } else {
        setError(json.error?.message || "Failed to load hearings.");
      }
    } catch {
      setError("Network protocol synchronization failure.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHearings();
  }, []);

  const filteredHearings = useMemo(() => {
    return hearings.filter(h => {
      const matchesSearch = 
        h.case?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.case?.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isUp = new Date(h.hearingDate) > new Date();
      const matchesTime = 
        timeFilter === "ALL" || 
        (timeFilter === "UPCOMING" && isUp) || 
        (timeFilter === "PAST" && !isUp);

      return matchesSearch && matchesTime;
    });
  }, [hearings, searchQuery, timeFilter]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const isUpcoming = (iso: string) => new Date(iso) > new Date();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-24 lg:pb-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>
            Hearings
          </h1>
          <p className="font-medium" style={{ color: "var(--muted)" }}>
            Track and manage your upcoming procedural session timeline.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedHearingId(null);
            setDrawerOpen(true);
          }}
          className="h-14 px-8 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all hover:opacity-80 shadow-lg"
          style={{ background: "var(--foreground)", color: "var(--background)" }}
        >
          <Plus className="w-5 h-5" />
          Schedule Session
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-foreground" style={{ color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="Search within dockets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none transition-all font-medium"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="h-full px-5 rounded-2xl font-bold text-xs uppercase tracking-widest outline-none appearance-none cursor-pointer"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            <option value="ALL">All Timeline</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="PAST">History</option>
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

      {/* Registry Display (Card Stack) */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5">
        {loading ? (
          <div className="p-20 text-center rounded-[2.5rem] flex flex-col items-center gap-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--muted)" }} />
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>Synchronizing Timeline...</p>
          </div>
        ) : filteredHearings.length === 0 ? (
          <div className="p-20 text-center rounded-[2.5rem] flex flex-col items-center gap-4 opacity-40" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <Calendar className="w-10 h-10" style={{ color: "var(--muted)" }} />
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>No docket entries match your query.</p>
          </div>
        ) : (
          filteredHearings.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-[2rem] p-5 sm:p-6 lg:p-8 transition-all hover:scale-[1.01] cursor-pointer group active:scale-[0.98]"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              onClick={() => {
                setSelectedHearingId(h.id);
                setDrawerOpen(true);
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Date Block (Desktop/Tablet) */}
                  <div className="hidden sm:flex flex-col items-center justify-center min-w-[6rem] pr-6" style={{ borderRight: "1px solid var(--border)" }}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-center" style={{ color: "var(--muted)" }}>{formatDate(h.hearingDate)}</p>
                    <p className="text-2xl font-black mt-1" style={{ color: "var(--foreground)" }}>{formatTime(h.hearingDate)}</p>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span
                        className="px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest"
                        style={isUpcoming(h.hearingDate)
                          ? { background: "var(--foreground)", color: "var(--background)" }
                          : { background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }
                        }
                      >
                        {isUpcoming(h.hearingDate) ? "Upcoming Session" : "Past Procedural"}
                      </span>
                      <span className="sm:hidden text-[10px] font-bold text-muted">{formatDate(h.hearingDate)} @ {formatTime(h.hearingDate)}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2.5 truncate" style={{ color: "var(--foreground)" }}>
                      <Scale className="w-5 h-5 shrink-0" style={{ color: "var(--muted)" }} />
                      <span className="truncate">{h.case?.title || "Case Record"}</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold" style={{ color: "var(--muted)" }}>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{h.case?.courtName || "Chambers"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full" style={{ background: "var(--border)" }} />
                        <span className="uppercase tracking-widest text-[10px]">Ref: {h.case?.caseNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions (Responsive) */}
                <div className="flex items-center gap-3 justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-base">
                  <button className="flex-1 sm:flex-none h-11 px-5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm border" style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Docket
                  </button>
                  <button className="h-11 w-11 flex items-center justify-center rounded-xl transition-all hover:bg-[var(--surface-2)]" style={{ color: "var(--muted)" }}>
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {h.notes && (
                <div className="mt-6 p-4 sm:p-5 rounded-2xl text-[10px] sm:text-[11px] font-medium italic border-l-2 leading-relaxed" style={{ background: "var(--surface-2)", borderColor: "var(--foreground)", color: "var(--muted)" }}>
                  "{h.notes}"
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <HearingEditorDrawer
        isOpen={drawerOpen}
        hearingId={selectedHearingId}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => {
          fetchHearings();
          setDrawerOpen(false);
        }}
      />
    </div>
  );
}
