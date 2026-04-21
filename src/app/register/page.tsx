"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Loader2, ArrowRight } from "lucide-react";
import { EyeInput } from "@/components/ui/EyeInput";
import { motion } from "framer-motion";

/**
 * Professional Registration Page
 * Enforces "Constant Shape" (rounded-[2.5rem]) and strict alignment for elite practitioners.
 */
export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error.message || "Registration failed. Database connectivity or validation error.");
      }
    } catch (err) {
      setError("Fatal system error. Please verify database availability and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4 selection:bg-indigo-500/30">
      <div className="w-full max-w-md space-y-10">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl tracking-tighter mb-10 group">
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-indigo-600/20">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <span className="text-white">LAWYER DIARY</span>
          </Link>
          <h2 className="text-4xl font-black text-white tracking-tighter">Create Account</h2>
          <p className="mt-3 text-zinc-500 font-bold tracking-tight">Join the elite circle of digital legal professionals.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-950/50 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-600/50 to-transparent" />
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/5 border border-red-500/10 text-red-500 text-xs font-black uppercase tracking-widest rounded-2xl"
            >
              {error}
            </motion.div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Legal Name</label>
            <input
              name="name"
              type="text"
              required
              className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-indigo-600/50 transition-all placeholder:text-zinc-700 font-medium"
              placeholder="e.g. Adv. Abir Ahmed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Domain</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-indigo-600/50 transition-all placeholder:text-zinc-700 font-medium"
              placeholder="chamber@firm.com"
            />
          </div>

          <EyeInput 
            name="password"
            label="Secure Password"
            placeholder="••••••••"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-white text-black hover:bg-zinc-200 rounded-2xl transition-all font-black text-xs uppercase tracking-[0.2em] mt-4 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Initialize Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-10">
            Existing Member?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-white transition-colors underline underline-offset-8 decoration-indigo-800">
              Authenticate Here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
