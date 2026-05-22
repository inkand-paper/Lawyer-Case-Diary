"use client";

import { useState } from "react";
import { Share2, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export function ChamberShareButton({ caseId, isShared }: { caseId: string, isShared: boolean }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(isShared);
  const router = useRouter();

  if (success) {
    return (
      <button disabled className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center transition-all cursor-not-allowed group relative" title="Shared with Chamber">
        <Check className="w-4 h-4" />
      </button>
    );
  }

  const handleShare = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/share`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        router.refresh();
      } else {
        alert(json.error?.message || "Failed to share.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleShare}
      disabled={loading}
      className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-white hover:bg-indigo-600 transition-all flex items-center justify-center group relative"
      title="Share to Chamber"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
    </button>
  );
}
