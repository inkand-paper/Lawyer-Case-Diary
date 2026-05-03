"use client";

import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Settings, 
  MessageSquare, 
  CreditCard, 
  Calendar,
  User,
  Scale,
  Download,
  Share2,
  Trash2,
  MoreVertical
} from "lucide-react";
import Link from "next/link";
import { CaseTimeline } from "@/components/dashboard/CaseTimeline";
import { cn } from "@/lib/utils";

export default function CaseDetails({ params }: { params: { id: string } }) {
  // Mock data for the demonstration of the polished UI
  const caseData = {
    title: "Capital vs. Miller",
    caseNumber: "CIV-2026-0041",
    status: "Active",
    judge: "Hon. Sarah Vance",
    court: "Supreme Court of Justice",
    client: {
      name: "Johnathan Miller",
      email: "j.miller@example.com",
      phone: "+1 (555) 0123-4567"
    },
    timeline: [
      { id: "1", type: "CREATED", title: "Case Formalized", date: "Jan 12, 2026", description: "All initial documentation filed and judge assigned.", isCompleted: true },
      { id: "2", type: "HEARING", title: "Preliminary Hearing", date: "Feb 05, 2026", description: "Evidence submission and witness scheduling.", isCompleted: true },
      { id: "3", type: "PAYMENT", title: "Retainer Processed", date: "Feb 08, 2026", description: "Initial legal fees handled successfully.", isCompleted: true },
      { id: "4", type: "HEARING", title: "Discovery Phase", date: "Upcoming: Apr 22, 2026", description: "Verification of documentation and cross-examination scheduling.", isCompleted: false },
    ] as { id: string; type: string; title: string; date: string; description: string; isCompleted: boolean }[]
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/cases" 
          className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors group"
        >
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Back to Repository</span>
        </Link>
        <div className="flex items-center gap-3">
          <button className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-white transition-all">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-white transition-all">
            <Download className="w-4 h-4" />
          </button>
          <button className="h-12 px-6 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all">
            Edit Details
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Case Profile */}
        <div className="lg:col-span-8 space-y-12">
          {/* Main Display */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/5">
                {caseData.status}
              </span>
              <span className="text-zinc-600 font-bold tracking-widest text-[10px] uppercase">
                {caseData.caseNumber}
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none italic">
              {caseData.title}
            </h1>
            <p className="text-zinc-500 text-lg font-bold leading-relaxed max-w-3xl">
              Constitutional challenge regarding corporate privacy rights within the digital infrastructure of the northeastern judicial region.
            </p>
          </div>

          {/* Timeline Section */}
          <div className="bg-zinc-950/50 border border-white/5 p-12 rounded-[3.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none" />
            <h3 className="text-2xl font-black text-white mb-12 tracking-tight flex items-center gap-4">
              <Scale className="w-6 h-6 text-indigo-500" />
              Procedural Timeline
            </h3>
            <CaseTimeline items={caseData.timeline} />
          </div>
        </div>

        {/* Right Column: Metadata & Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Client Card */}
          <div className="bg-zinc-950/50 border border-white/5 p-10 rounded-[3rem] space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-600 to-transparent opacity-50" />
            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">Client Profile</h4>
            <div className="flex items-center gap-4 py-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center border border-white/10 shadow-2xl group-hover:scale-105 transition-transform">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-xl font-black text-white leading-none">{caseData.client.name}</p>
                <p className="text-[10px] text-indigo-400 font-black uppercase mt-2 tracking-widest">Verified Client</p>
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-zinc-500">Email</span>
                <span className="text-white underline underline-offset-4 decoration-zinc-800">{caseData.client.email}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-zinc-500">Identity</span>
                <span className="text-white">Passport Secured</span>
              </div>
            </div>
            <button className="w-full h-14 bg-white/[0.03] hover:bg-indigo-600 hover:text-white border border-white/5 rounded-2xl transition-all text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
              <MessageSquare className="w-4 h-4" />
              Establish Comms
            </button>
          </div>

          {/* Court Meta */}
          <div className="bg-zinc-950/50 border border-white/5 p-10 rounded-[3rem] space-y-6">
             <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">Jurisdiction</h4>
             <div className="space-y-6 pt-4">
                <div className="flex items-start gap-4">
                   <div className="p-3 rounded-xl bg-white/5 text-indigo-500"><Settings className="w-4 h-4" /></div>
                   <div>
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Presiding Bench</p>
                      <p className="text-sm font-black text-white">{caseData.judge}</p>
                   </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className="p-3 rounded-xl bg-white/5 text-amber-500"><Calendar className="w-4 h-4" /></div>
                   <div>
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Location</p>
                      <p className="text-sm font-black text-white">{caseData.court}</p>
                   </div>
                </div>
             </div>
          </div>

          <button className="w-full py-6 rounded-3xl text-sm font-black text-zinc-600 hover:text-red-500 hover:bg-red-500/5 hover:border-red-500/10 border border-transparent transition-all flex items-center justify-center gap-3 group">
            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Decommission Case
          </button>
        </div>
      </div>
    </div>
  );
}
