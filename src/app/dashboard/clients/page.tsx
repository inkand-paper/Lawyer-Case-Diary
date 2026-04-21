"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail,
  Phone,
  UserCircle2
} from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setClients(json.data);
        }
      }
    } catch (e) {
      console.error("Error fetching client directory", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Client Directory</h1>
          <p className="text-zinc-500 font-medium">Manage your professional relationships and contacts.</p>
        </div>
        <button className="h-14 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all font-bold text-lg flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
          <Plus className="w-5 h-5" />
          New Client
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search by client name, email, or phone..." 
            className="w-full bg-zinc-950 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:outline-none focus:border-indigo-600/50 transition-all"
          />
        </div>
        <button className="px-6 bg-zinc-950 border border-white/5 text-zinc-400 rounded-2xl flex items-center gap-2 hover:text-white transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Client Profile</th>
              <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Contact Information</th>
              <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Type</th>
              <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Cases</th>
              <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
               <tr>
                 <td colSpan={5} className="px-8 py-10 text-center text-zinc-500 font-bold uppercase tracking-widest text-sm">
                   Synchronizing Registry Data...
                 </td>
               </tr>
            ) : clients.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-8 py-10 text-center text-zinc-500 font-bold uppercase tracking-widest text-sm">
                   No clients registered yet.
                 </td>
               </tr>
            ) : clients.map((c, i) => (
              <motion.tr
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-white/[0.02] transition-colors group"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/5 p-2.5 rounded-xl text-indigo-400">
                      <UserCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors tracking-tight">{c.name}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">ID: {c.id.padStart(4, "0")}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{c.email || "No email mapped"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{c.phone || "No phone mapped"}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    c.email?.includes("corp") || c.email?.includes("inc") || c.name.includes("Inc") || c.name.includes("Corp") 
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}>
                    {c.email?.includes("corp") || c.email?.includes("inc") || c.name.includes("Inc") || c.name.includes("Corp") ? "Corporate" : "Individual"}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold ring-1 ring-indigo-500/30">
                      {c._count?.cases || 0}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-xl transition-all">
                      <MoreHorizontal className="w-4 h-4 text-zinc-500 hover:text-white" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-8 border-t border-white/5 flex items-center justify-center gap-4">
           <button className="w-10 h-10 rounded-xl border border-white/5 text-zinc-500 hover:text-white hover:bg-white/5 transition-all text-sm font-bold">1</button>
        </div>
      </div>
    </div>
  );
}
