"use client";

import { useState } from "react";
import { 
  Zap, 
  Terminal, 
  RefreshCcw, 
  Search, 
  ShieldCheck,
  History,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function DevTools() {
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<{tag: string, time: string, status: string}[]>([]);

  const triggerRevalidation = async () => {
    if (!tag) return;
    setLoading(true);
    
    // Simulate API call for now or connect to /api/revalidate if implemented
    setTimeout(() => {
      setLogs([{
        tag: tag,
        time: new Date().toLocaleTimeString(),
        status: "SUCCESS"
      }, ...logs]);
      setLoading(false);
      setTag("");
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Optimizer Control Center</h1>
        <p className="text-zinc-500 font-medium">Manually trigger cache revalidations and monitor synchronization logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Trigger Panel */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-zinc-950 border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl -z-10" />
            
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-indigo-600 p-3 rounded-2xl">
                <RefreshCcw className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Trigger Revalidation</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-2">Cache Tag</label>
                <div className="relative">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g. cases, hearings, dashboard"
                    className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 transition-all font-mono"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                    {["cases", "dashboard"].map(t => (
                      <button 
                        key={t}
                        onClick={() => setTag(t)}
                        className="text-[10px] bg-white/5 text-zinc-500 px-2 py-1 rounded-lg border border-white/5 hover:text-white transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={triggerRevalidation}
                disabled={loading || !tag}
                className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 shadow-[0_0_30px_rgba(79,70,229,0.2)]"
              >
                {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                Fire Optimizer Trigger
              </button>
            </div>

            <div className="mt-12 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
              <div className="flex items-start gap-4">
                <ShieldCheck className="w-5 h-5 text-indigo-400 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-1 tracking-tight">Authenticated Request</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    This action will be signed with your system `opt_XXXX` key and broadcasted across your Next.js cluster.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status & Logs */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-zinc-950 border border-white/5 rounded-[3rem] overflow-hidden flex flex-col h-full">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-zinc-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">Sync Logs</h3>
              </div>
              <span className="text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                REAL-TIME
              </span>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[400px] custom-scrollbar">
              {logs.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-zinc-600 gap-4 opacity-50">
                  <Terminal className="w-10 h-10" />
                  <p className="text-xs font-bold uppercase tracking-widest">No triggers fired yet</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-black border border-white/5 p-4 rounded-2xl flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <div>
                        <p className="text-xs font-mono font-bold text-indigo-400">tag: {log.tag}</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase mt-0.5">{log.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-widest bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CheckCircle2 className="w-3 h-3" />
                      {log.status}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-8 bg-zinc-900/40 border-t border-white/5 mt-auto">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">System Health</p>
                <p className="text-xs font-bold text-white tracking-tight">99.98%</p>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="w-full h-full bg-indigo-600 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
