"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Gavel, Shield, Zap, Scale } from "lucide-react";
export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Adding a timestamp ensures we bypass any browser-level caching
    fetch(`/api/me?t=${Date.now()}`, { cache: "no-store" })
      .then(res => res.json())
      .then(res => setIsLoggedIn(res.success))
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* Navigation */}
      <header
        className="px-6 lg:px-12 h-20 flex items-center justify-between sticky top-0 z-50"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
      >
        <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tighter">
          <div className="p-1.5 rounded-lg" style={{ background: "var(--foreground)" }}>
            <Scale className="w-6 h-6" style={{ color: "var(--background)" }} />
          </div>
          <span className="font-black" style={{ color: "var(--foreground)" }}>LAWYER DIARY</span>
        </Link>
        <nav className="flex items-center gap-6">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="text-sm font-black px-8 py-3 rounded-2xl bg-blue-600 text-white uppercase tracking-widest shadow-xl hover:bg-blue-500 transition-all"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold transition-colors" style={{ color: "var(--muted)" }}>
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:opacity-80"
                style={{ background: "var(--foreground)", color: "var(--background)" }}
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-4xl space-y-10 animate-in">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            Simple & Fast Case Management
          </div>

          {/* Hero */}
          <h1
            className="text-4xl sm:text-5xl lg:text-8xl font-black tracking-tighter leading-[1.05]"
            style={{ color: "var(--foreground)" }}
          >
            Manage Your Cases.<br />
            <span style={{ color: "var(--muted)" }}>Without the Clutter.</span>
          </h1>

          <p className="text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed font-medium" style={{ color: "var(--muted)" }}>
            A straightforward app for lawyers to track cases, clients, and court dates. 
            Real-time updates, clear design, and zero learning curve.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto h-14 px-10 inline-flex items-center justify-center rounded-2xl font-bold text-lg hover:opacity-80 transition-all"
              style={{ background: "var(--foreground)", color: "var(--background)" }}
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto h-14 px-10 inline-flex items-center justify-center rounded-2xl font-bold text-lg transition-all hover:opacity-80"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-6xl mx-auto pb-12 w-full">
          {[
            { icon: Gavel, title: "Case Management", desc: "Track every hearing, every document, and every judge with a premium visual timeline." },
            { icon: Shield, title: "Encryption First", desc: "Bank-grade security. Your client data is protected by JWT + HttpOnly protocols." },
            { icon: Zap, title: "Real-time Engine", desc: "Integrated with the Optimizer Suite for instant UI revalidation without refreshing." },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-8 rounded-3xl text-left transition-all hover:scale-[1.02]"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "var(--surface-2)" }}
              >
                <Icon className="w-7 h-7" style={{ color: "var(--foreground)" }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>{title}</h3>
              <p className="text-sm leading-relaxed font-medium" style={{ color: "var(--muted)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer
        className="py-10 text-center text-sm font-bold"
        style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}
      >
        &copy; 2026 Lawyer Diary SaaS. Powering the future of law.
      </footer>
    </div>
  );
}
