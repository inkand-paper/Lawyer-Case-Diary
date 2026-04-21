"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Premium ThemeGlider Component
 * A 3-tier sliding toggle for Light, Midnight Blue, and Deep Black themes.
 */
export function ThemeGlider() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-32 h-10 bg-zinc-950/50 rounded-full border border-white/5" />;

  const themes = [
    { id: "light", icon: Sun, label: "Day" },
    { id: "blue", icon: Zap, label: "Law" },
    { id: "dark", icon: Moon, label: "Onyx" },
  ];

  const activeIndex = themes.findIndex((t) => t.id === theme) || 0;

  return (
    <div className="relative bg-zinc-950/50 border border-white/5 p-1 rounded-full flex items-center gap-1 shadow-inner overflow-hidden">
      {/* Glider Background */}
      <motion.div
        className="absolute h-8 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/20"
        initial={false}
        animate={{
          x: activeIndex * 40 + 4,
          width: 36,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={cn(
            "relative w-9 h-8 flex items-center justify-center rounded-full transition-colors z-10",
            theme === t.id ? "text-white" : "text-zinc-600 hover:text-zinc-400"
          )}
          title={t.label}
        >
          <t.icon className={cn("w-4 h-4", theme === t.id && "animate-in zoom-in duration-300")} />
        </button>
      ))}
    </div>
  );
}
