"use client";

/**
 * ============================================================
 * Register Page
 * ─────────────────────────────────────────────────────────────
 * Strict monochrome registration screen.
 * Calls POST /api/auth/register → sets HttpOnly cookie → redirect.
 * ============================================================
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Loader2, ArrowRight, Mail, User, AlertCircle } from "lucide-react";
import { EyeInput } from "@/components/ui/EyeInput";
import { motion } from "framer-motion";

const inputStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
} as React.CSSProperties;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      const result = await res.json();

      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(
          result.error?.message ||
            "Registration failed. Check your details and try again."
        );
      }
    } catch {
      setError("Network error — check your connection and try again.");
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
            Create Account
          </h1>
          <p className="mt-3 font-bold tracking-tight" style={{ color: "var(--muted)" }}>
            Join the account.
          </p>
        </div>

        {/* Form Card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {/* Top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[2.5rem]"
            style={{ background: "var(--foreground)" }}
          />

          {/* Error */}
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

          {/* Full Name */}
          <div className="space-y-2">
            <label
              className="text-[10px] font-black uppercase tracking-widest ml-1"
              style={{ color: "var(--muted)" }}
            >
              Legal Name
            </label>
            <div className="relative">
              <User
                className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--muted)" }}
              />
              <input
                name="name"
                type="text"
                required
                className="w-full rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none font-medium"
                style={inputStyle}
                placeholder="e.g. Adv. Abir Ahmed"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label
              className="text-[10px] font-black uppercase tracking-widest ml-1"
              style={{ color: "var(--muted)" }}
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--muted)" }}
              />
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none font-medium"
                style={inputStyle}
                placeholder="chamber@firm.com"
              />
            </div>
          </div>

          {/* Password */}
          <EyeInput
            name="password"
            label="Password (min. 8 characters)"
            placeholder="••••••••"
            required
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:opacity-80 transition-all mt-2"
            style={{ background: "var(--foreground)", color: "var(--background)" }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Create Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p
            className="text-center text-[10px] font-black uppercase tracking-widest"
            style={{ color: "var(--muted)" }}
          >
            Already registered?{" "}
            <Link
              href="/login"
              className="font-black underline underline-offset-4 transition-colors"
              style={{ color: "var(--foreground)" }}
            >
              Sign In
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
