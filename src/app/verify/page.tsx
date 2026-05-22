"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Scale, Loader2, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const inputStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
};

function VerifyContent() {
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const code = formData.get("code") as string;

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const result = await res.json();

      if (result.success) {
        router.push("/dashboard");
      } else {
        const errMsg = typeof result.error === "object" ? result.error?.message : result.error;
        setError(errMsg || "Verification failed. Please check the code and try again.");
      }
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccessMsg("✅ A fresh code has been sent to your inbox!");
      } else {
        const errMsg = typeof result.error === "object" ? result.error?.message : result.error;
        setError(errMsg || "Could not resend. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-md space-y-10">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-2xl tracking-tighter mb-10 group"
          >
            <div
              className="p-2 rounded-xl group-hover:scale-110 transition-transform"
              style={{ background: "var(--foreground)" }}
            >
              <Scale className="w-7 h-7" style={{ color: "var(--background)" }} />
            </div>
            <span className="font-black" style={{ color: "var(--foreground)" }}>
              LAWYER DIARY
            </span>
          </Link>
          <h1
            className="text-4xl font-black tracking-tighter"
            style={{ color: "var(--foreground)" }}
          >
            Verify Identity
          </h1>
          <p className="mt-3 font-bold tracking-tight" style={{ color: "var(--muted)" }}>
            Enter the 6-digit PIN sent to <br/>
            <span style={{ color: "var(--foreground)" }}>{email || "your email"}</span>.
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[2.5rem]"
            style={{ background: "var(--foreground)" }}
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl flex items-center gap-3 text-sm font-bold"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#ef4444",
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl text-sm font-bold"
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
                color: "#22c55e",
              }}
            >
              {successMsg}
            </motion.div>
          )}

          <div className="space-y-2">
            <label
              className="text-[10px] font-black uppercase tracking-widest ml-1"
              style={{ color: "var(--muted)" }}
            >
              Secure 6-Digit Code
            </label>
            <div className="relative">
              <ShieldCheck
                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5"
                style={{ color: "var(--muted)" }}
              />
              <input
                name="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                autoComplete="one-time-code"
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
                }}
                className="w-full rounded-2xl pl-14 pr-6 py-4 text-center text-2xl tracking-[1em] font-black focus:outline-none focus:ring-2"
                style={inputStyle}
                placeholder="000000"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:opacity-80 transition-all mt-2"
            style={{ background: "var(--foreground)", color: "var(--background)" }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Unlock Dashboard <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending || !email}
            className="w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:opacity-80 disabled:opacity-40"
            style={{ color: "var(--muted)", background: "transparent" }}
          >
            {resending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Didn't get the code? Resend →"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <VerifyContent />
    </Suspense>
  );
}
