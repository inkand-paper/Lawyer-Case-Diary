"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  MoreHorizontal,
  Scale
} from "lucide-react";

export default function HearingsPage() {
  const [hearings, setHearings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHearings = async () => {
    try {
      const res = await fetch("/api/hearings");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setHearings(json.data);
        }
      }
    } catch (e) {
      console.error("Error fetching hearing schedule", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHearings();
  }, []);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Hearing Schedule</h1>
          <p className="text-zinc-500 font-medium">Track your upcoming court appearances and professional appointments.</p>
        </div>
        <button className="h-14 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all font-bold text-lg flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
          <Plus className="w-5 h-5" />
          Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
           <div className="p-10 text-center text-zinc-500 font-bold uppercase tracking-widest text-sm border border-white/5 rounded-[2rem] bg-zinc-950">
             Synchronizing Schedule...
           </div>
        ) : hearings.length === 0 ? (
           <div className="p-10 text-center text-zinc-500 font-bold uppercase tracking-widest text-sm border border-white/5 rounded-[2rem] bg-zinc-950">
             No upcoming hearings scheduled.
           </div>
        ) : hearings.map((h, i) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative bg-zinc-950 border border-white/5 rounded-[2rem] p-8 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] transition-all overflow-hidden"
          >
            {/* Top right gradient flair */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-[50px] group-hover:bg-indigo-600/20 transition-colors pointer-events-none rounded-full" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-6">
                <div className="hidden md:flex flex-col items-center justify-center min-w-24 border-r border-white/10 pr-6">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{formatDate(h.hearingDate)}</p>
                  <p className="text-2xl font-black text-white mt-1">{formatTime(h.hearingDate).split(" ")[0]}</p>
                  <p className="text-[10px] font-bold text-indigo-400 mt-1">{formatTime(h.hearingDate).split(" ")[1]}</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      {new Date(h.hearingDate) > new Date() ? "Upcoming" : "Past"}
                    </span>
                    <span className="text-sm font-semibold text-zinc-500">•</span>
                    <span className="text-sm font-bold text-zinc-300">Hearing</span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors tracking-tight flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-500" />
                    {h.case?.title || "Unknown Case"}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                      <Calendar className="w-4 h-4 md:hidden" />
                      <span className="md:hidden">{formatDate(h.hearingDate)} - </span>
                      <MapPin className="w-4 h-4 text-zinc-500" />
                      <span>{h.case?.courtName || "Unknown Court"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="h-12 px-6 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-semibold text-sm border border-white/5">
                  View Details
                </button>
                <button className="h-12 w-12 flex items-center justify-center bg-transparent hover:bg-white/5 text-zinc-500 hover:text-white rounded-xl transition-all">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
