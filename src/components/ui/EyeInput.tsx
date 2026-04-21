"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EyeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/**
 * Premium EyeInput Component
 * Combines a secure password field with an interactive visibility toggle.
 */
export function EyeInput({ label, error, className, ...props }: EyeInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
          {label}
        </label>
        {error && (
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">
            {error}
          </span>
        )}
      </div>

      <div className="relative group/input">
        {/* Left Icon */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-indigo-500 transition-colors pointer-events-none">
          <Lock className="w-4 h-4" />
        </div>

        {/* Input Field */}
        <input
          {...props}
          type={show ? "text" : "password"}
          className={cn(
            "w-full bg-zinc-950/50 border border-white/5 rounded-2xl pl-14 pr-14 py-4 text-sm text-white focus:outline-none focus:border-indigo-600/50 transition-all placeholder:text-zinc-700",
            error && "border-red-500/20 focus:border-red-500/50",
            className
          )}
        />

        {/* Visibility Toggle Button */}
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/5 text-zinc-600 hover:text-white transition-all outline-none"
          title={show ? "Hide Password" : "Show Password"}
        >
          {show ? (
            <EyeOff className="w-4 h-4 animate-in fade-in zoom-in duration-300" />
          ) : (
            <Eye className="w-4 h-4 animate-in fade-in zoom-in duration-300" />
          )}
        </button>
        
        {/* Internal Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-indigo-600/0 group-focus-within/input:bg-indigo-600/[0.02] pointer-events-none transition-colors" />
      </div>
    </div>
  );
}
