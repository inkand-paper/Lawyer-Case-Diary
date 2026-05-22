"use client";

import { useState } from "react";
import Link from "next/link";
import { Scale, Loader2, ArrowRight, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const email = new FormData(e.currentTarget).get("email") as string;

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (result.success) {
        setSent(true);
      } else {
        setError(result.error?.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error — check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-md space-y-10">
        {/* Brand */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl tracking-tighter mb-10 group">
            <div className="p-2 rounded-xl group-hover:scale-110 transition-transform" style={{ background: "var(--foreground)" }}>
              <Scale className="w-7 h-7" style={{ color: "var(--background)" }} />
            </div>
            <span className="font-black" style={{ color: "var(--foreground)" }}>LAWYER DIARY</span>
          </Link>
          <h1 className="text-4xl font-black tracking-tighter" style={{ color: "var(--foreground)" }}>
            Reset Password
          </h1>
          <p className="mt-3 font-bold tracking-tight" style={{ color: "var(--muted)" }}>
            Enter your email and we'll send you a secure reset link.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[2.5rem]" style={{ background: "var(--foreground)" }} />

          {sent ? (
            <div className="flex flex-col items-center gap-6 py-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[var(--foreground)] mb-2">Check Your Inbox</h3>
                <p className="text-sm font-medium text-[var(--muted)]">
                  If an account exists with that email, a password reset link has been sent. It expires in 1 hour.
                </p>
              </div>
              <Link
                href="/login"
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-2xl text-sm font-bold" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: "var(--muted)" }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} />
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none font-medium"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    placeholder="chamber@firm.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl hover:opacity-80 transition-all"
                style={{ background: "var(--foreground)", color: "var(--background)" }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>}
              </button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors"
                style={{ color: "var(--muted)" }}
              >
                <ArrowLeft className="w-3 h-3" /> Back to Login
              </Link>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
