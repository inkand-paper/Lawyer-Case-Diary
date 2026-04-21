"use client";

import { useEffect, useState } from "react";
import { Scale, Briefcase, Users, Calendar, Activity, TrendingUp, Clock, ShieldCheck, Plus, ExternalLink, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * Professional Dashboard Intelligence Console
 * Integrates real-time database feeds and 'First Case' procedural instructions.
 */
export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Live feed failure:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">Synchronizing Intelligence...</p>
      </div>
    );
  }

  // Define stats from live data or placeholders
  const stats = [
    { label: "Active Litigations", value: data?.stats?.activeCases || "0", icon: Briefcase, color: "text-indigo-400", bg: "bg-indigo-400/10", trend: "Live Tracker" },
    { label: "Verified Clients", value: data?.stats?.verifiedClients || "0", icon: Users, color: "text-emerald-400", bg: "bg-emerald-400/10", trend: "Registry Records" },
    { label: "Scheduled Hearings", value: data?.stats?.upcomingHearings || "0", icon: Calendar, color: "text-amber-400", bg: "bg-amber-400/10", trend: "Docket Monitor" },
    { label: "System Fidelity", value: data?.stats?.uptime || "99.9%", icon: ShieldCheck, color: "text-cyan-400", bg: "bg-cyan-400/10", trend: "Encrypted" },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Intelligence Pulse - Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Command Intelligence</h1>
          <p className="text-zinc-500 font-bold tracking-tight text-base md:text-lg">Real-time status of your legal ecosystem.</p>
        </div>
        <Link href="/dashboard/cases/new">
          <button className="bg-white text-black px-6 py-4 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl shadow-white/5">
            <Plus className="w-4 h-4" />
            Initialize New Case
          </button>
        </Link>
      </div>

      {/* Metrics Console - Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-zinc-900/30 border border-white/5 p-8 rounded-[2.5rem] hover:bg-zinc-900/50 hover:border-indigo-600/30 transition-all shadow-xl flex flex-col gap-6"
          >
            <div className="flex justify-between items-start">
              <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className="flex flex-col items-end">
                <TrendingUp className="w-4 h-4 text-zinc-700" />
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter mt-1">{stat.trend}</span>
              </div>
            </div>
            <div>
              <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
              <p className="text-xs font-black text-zinc-600 uppercase tracking-[0.2em] mt-1">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Procedural Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-xl font-black text-white tracking-tighter">Recent Registry Activity</h3>
          </div>
          
          <div className="bg-zinc-950/30 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl relative min-h-[400px]">
             <AnimatePresence mode="wait">
               {data?.recentActions?.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                      <th className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Priority</th>
                      <th className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Case File Identification</th>
                      <th className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Client</th>
                      <th className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Protocol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.recentActions.map((item: any) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-7">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </td>
                        <td className="px-8 py-7">
                          <p className="text-sm font-black text-white tracking-tight">{item.title}</p>
                          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">REF: {item.caseNumber}</p>
                        </td>
                        <td className="px-8 py-7">
                          <p className="text-xs font-bold text-zinc-400">{item.client?.name || "Unassigned"}</p>
                        </td>
                        <td className="px-8 py-7">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Record</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               ) : (
                 <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center p-20 text-center gap-6"
                 >
                   <div className="bg-zinc-900 w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl">
                     <Database className="w-8 h-8 text-indigo-500" />
                   </div>
                   <div className="space-y-2">
                     <h4 className="text-xl font-black text-white uppercase tracking-tighter">Your Registry is Empty</h4>
                     <p className="text-sm text-zinc-500 font-medium max-w-xs mx-auto">Click 'Initialize New Case' to start documenting your legal proceedings.</p>
                   </div>
                   
                   <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 text-left w-full max-w-sm space-y-4">
                     <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Procedural Instructions</p>
                     <ul className="space-y-3">
                       <li className="flex items-start gap-3">
                         <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                         <p className="text-[11px] text-zinc-400 font-bold tracking-tight">Access the <span className="text-white">Active Case Console</span> in the sidebar.</p>
                       </li>
                       <li className="flex items-start gap-3">
                         <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                         <p className="text-[11px] text-zinc-400 font-bold tracking-tight">Input the <span className="text-white">Legal Identification</span> and client credentials.</p>
                       </li>
                       <li className="flex items-start gap-3">
                         <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                         <p className="text-[11px] text-zinc-400 font-bold tracking-tight">The system will automatically generate a <span className="text-white">Procedural Timeline</span> for you.</p>
                       </li>
                     </ul>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>

        {/* System Pulse - Side Diagnostics */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-white tracking-tighter px-4">Registry Health</h3>
          <div className="bg-zinc-950/30 border border-white/5 p-10 rounded-[2.5rem] backdrop-blur-xl h-full space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
                <Activity className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-widest">Protocol Sync</p>
                <p className="text-[10px] font-bold text-indigo-400 flex items-center gap-1.5 uppercase mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Live Connection
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Legal Database Load</span>
                <span className="text-[10px] font-black text-white">{data?.stats?.activeCases ? "Optimal" : "Standby"}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: data?.stats?.activeCases ? "42%" : "5%" }}
                  className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
                />
              </div>
            </div>

            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-indigo-600/30 transition-all cursor-pointer">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Registry Summary</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold transition-colors group-hover:text-white">
                  <span className="text-zinc-400">Database Records</span>
                  <span className="text-white">PRISMA_SECURE</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-400">Total Size</span>
                  <span className="text-indigo-400 font-black tracking-widest uppercase">Encryption On</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
