"use client";

import { use, useEffect, useState } from "react";
import {
  ArrowLeft,
  Settings,
  MessageSquare,
  Calendar,
  User,
  Scale,
  Share2,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CaseTimeline, TimelineItem } from "@/components/dashboard/CaseTimeline";
import { CaseEditorDrawer } from "@/components/dashboard/CaseEditorDrawer";
import { ChamberShareButton } from "@/components/dashboard/ChamberShareButton";
import { fetchJson } from "@/lib/fetch-json";
import { Case } from "@/lib/types";

function buildTimeline(caseData: Case): TimelineItem[] {
  const items: TimelineItem[] = [
    {
      id: `created-${caseData.id}`,
      type: "CREATED",
      title: "Case Formalized",
      date: new Date(caseData.createdAt).toLocaleDateString(),
      description: "Case record opened in the registry.",
      isCompleted: true,
    },
  ];

  for (const hearing of caseData.hearings ?? []) {
    const date = new Date(hearing.hearingDate);
    items.push({
      id: hearing.id,
      type: "HEARING",
      title: "Hearing",
      date: date.toLocaleDateString(),
      description: hearing.notes || undefined,
      isCompleted: date.getTime() < Date.now(),
    });
  }

  for (const payment of caseData.payments ?? []) {
    items.push({
      id: payment.id,
      type: "PAYMENT",
      title: `Payment — ${payment.amount.toLocaleString(undefined, { style: "currency", currency: "USD" })}`,
      date: new Date(payment.paymentDate).toLocaleDateString(),
      description: payment.method || undefined,
      isCompleted: payment.status === "COMPLETED",
    });
  }

  for (const note of caseData.notes ?? []) {
    items.push({
      id: note.id,
      type: "NOTE",
      title: "Note",
      date: new Date(note.createdAt).toLocaleDateString(),
      description: note.content,
      isCompleted: true,
    });
  }

  return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export default function CaseDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const json = await fetchJson<{ success: boolean; data: Case; error?: { message: string } }>(`/api/cases/${id}`);
      if (json?.success) {
        setCaseData(json.data);
      } else {
        setError(json?.error?.message || "Failed to load case record.");
      }
    } catch {
      setError("Network error — unable to load case.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Deferred via setTimeout to avoid the synchronous setState-during-effect
    // warning (load() sets state immediately on the fast/cached-response path).
    const timeout = setTimeout(load, 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleClose = async () => {
    if (!confirm("Close this case? It will be archived (status set to CLOSED) but the record and its history stay accessible.")) return;
    setClosing(true);
    try {
      const res = await fetch(`/api/cases/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        router.push("/dashboard/cases");
      } else {
        setError(json.error?.message || "Failed to close case.");
      }
    } catch {
      setError("Network error — unable to close case.");
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Recovering Registry File...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-32 gap-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <p className="text-sm font-bold text-zinc-400">{error || "Case record not found."}</p>
        <Link href="/dashboard/cases" className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300">
          Back to Repository
        </Link>
      </div>
    );
  }

  const timeline = buildTimeline(caseData);

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
          <ChamberShareButton caseId={caseData.id} isShared={!!caseData.chamberId} />
          <button
            onClick={() => alert(`Case ID: ${caseData.id}\nCase Number: ${caseData.caseNumber}`)}
            className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-white transition-all"
            title="Share case reference"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditorOpen(true)}
            className="h-12 px-6 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all"
          >
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
            {caseData.description && (
              <p className="text-zinc-500 text-lg font-bold leading-relaxed max-w-3xl">
                {caseData.description}
              </p>
            )}
          </div>

          {/* Timeline Section */}
          <div className="bg-zinc-950/50 border border-white/5 p-12 rounded-[3.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none" />
            <h3 className="text-2xl font-black text-white mb-12 tracking-tight flex items-center gap-4">
              <Scale className="w-6 h-6 text-indigo-500" />
              Procedural Timeline
            </h3>
            {timeline.length <= 1 ? (
              <p className="text-sm font-bold text-zinc-600">No hearings, payments, or notes recorded yet.</p>
            ) : (
              <CaseTimeline items={timeline} />
            )}
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
                <p className="text-xl font-black text-white leading-none">{caseData.client?.name || "Unspecified Entity"}</p>
                <p className="text-[10px] text-indigo-400 font-black uppercase mt-2 tracking-widest">Client</p>
              </div>
            </div>
            {(caseData.client?.email || caseData.client?.phone) && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                {caseData.client?.email && (
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-zinc-500">Email</span>
                    <span className="text-white underline underline-offset-4 decoration-zinc-800">{caseData.client.email}</span>
                  </div>
                )}
                {caseData.client?.phone && (
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-zinc-500">Phone</span>
                    <span className="text-white">{caseData.client.phone}</span>
                  </div>
                )}
              </div>
            )}
            <a
              href={caseData.client?.email ? `mailto:${caseData.client.email}` : undefined}
              className="w-full h-14 bg-white/[0.03] hover:bg-indigo-600 hover:text-white border border-white/5 rounded-2xl transition-all text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3"
              style={!caseData.client?.email ? { opacity: 0.4, pointerEvents: "none" } : undefined}
            >
              <MessageSquare className="w-4 h-4" />
              Establish Comms
            </a>
          </div>

          {/* Court Meta */}
          <div className="bg-zinc-950/50 border border-white/5 p-10 rounded-[3rem] space-y-6">
             <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">Jurisdiction</h4>
             <div className="space-y-6 pt-4">
                <div className="flex items-start gap-4">
                   <div className="p-3 rounded-xl bg-white/5 text-indigo-500"><Settings className="w-4 h-4" /></div>
                   <div>
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Presiding Bench</p>
                      <p className="text-sm font-black text-white">{caseData.judgeName || "Not yet assigned"}</p>
                   </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className="p-3 rounded-xl bg-white/5 text-amber-500"><Calendar className="w-4 h-4" /></div>
                   <div>
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Court</p>
                      <p className="text-sm font-black text-white">{caseData.courtName}</p>
                   </div>
                </div>
             </div>
          </div>

          {error && (
            <p className="text-xs font-bold text-red-500 text-center">{error}</p>
          )}

          {caseData.status !== "CLOSED" && (
            <button
              onClick={handleClose}
              disabled={closing}
              className="w-full py-6 rounded-3xl text-sm font-black text-zinc-600 hover:text-red-500 hover:bg-red-500/5 hover:border-red-500/10 border border-transparent transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {closing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
              Close Case
            </button>
          )}
        </div>
      </div>

      <CaseEditorDrawer
        isOpen={editorOpen}
        caseId={caseData.id}
        onClose={() => setEditorOpen(false)}
        onSuccess={() => {
          setEditorOpen(false);
          load();
        }}
      />
    </div>
  );
}
