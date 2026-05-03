"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ThemeGlider() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  if (!mounted) return (
    <div
      className="w-24 h-10 rounded-full"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    />
  );

  const themes = [
    { id: "light", icon: Sun, label: "Day" },
    { id: "dark", icon: Moon, label: "Night" },
  ];

  const activeIndex = themes.findIndex((t) => t.id === theme) || 0;

  return (
    <div
      className="relative p-1 rounded-full flex items-center gap-1 overflow-hidden"
      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
    >
      {/* Sliding pill */}
      <motion.div
        className="absolute h-8 rounded-full"
        style={{ background: "var(--foreground)", width: 36 }}
        initial={false}
        animate={{ x: activeIndex * 40 + 4 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className="relative w-9 h-8 flex items-center justify-center rounded-full transition-colors z-10"
          style={{ color: theme === t.id ? "var(--background)" : "var(--muted)" }}
          title={t.label}
        >
          <t.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
