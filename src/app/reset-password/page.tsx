"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Scale, Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { EyeInput } from "@/components/ui/EyeInput";
import { motion } from "framer-motion";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await res.json();
      if (result.success) {
        setDone(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(result.error?.message || "Failed to reset password.");
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-6 py-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div>
          <h3 className="text-xl font-black text-[var(--foreground)] mb-2">Invalid Link</h3>
          <p className="text-sm text-[var(--muted)]">This password reset link is missing or malformed.</p>
        </div>
        <Link href="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 py-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <div>
          <h3 className="text-xl font-black text-[var(--foreground)] mb-2">Password Reset!</h3>
          <p className="text-sm font-medium text-[var(--muted)]">
            Your password has been updated. Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-2xl flex items-center gap-3 text-sm font-bold" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <EyeInput name="password" label="New Password" placeholder="Min. 8 characters" required />
      <EyeInput name="confirm" label="Confirm Password" placeholder="Repeat your password" required />

      <button
        type="submit"
        disabled={loading}
        className="w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl hover:opacity-80 transition-all"
        style={{ background: "var(--foreground)", color: "var(--background)" }}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Set New Password <ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md space-y-10">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl tracking-tighter mb-10 group">
            <div className="p-2 rounded-xl group-hover:scale-110 transition-transform" style={{ background: "var(--foreground)" }}>
              <Scale className="w-7 h-7" style={{ color: "var(--background)" }} />
            </div>
            <span className="font-black" style={{ color: "var(--foreground)" }}>LAWYER DIARY</span>
          </Link>
          <h1 className="text-4xl font-black tracking-tighter" style={{ color: "var(--foreground)" }}>New Password</h1>
          <p className="mt-3 font-bold tracking-tight" style={{ color: "var(--muted)" }}>Choose a strong password for your account.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[2.5rem]" style={{ background: "var(--foreground)" }} />
          <Suspense fallback={<div className="h-32 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
