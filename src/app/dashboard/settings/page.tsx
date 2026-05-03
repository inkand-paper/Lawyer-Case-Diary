"use client";

/**
 * ============================================================
 * SettingsPage — System & Profile Configuration
 * ─────────────────────────────────────────────────────────────
 * Hub for managing practitioner identity, security protocols,
 * and regional preferences. Fetches live data from /api/me.
 * ============================================================
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  Bell,
  ShieldCheck,
  CreditCard,
  Loader2,
  ChevronRight,
  UserCircle,
  Mail,
} from "lucide-react";
import { SettingsEditorDrawer } from "@/components/dashboard/SettingsEditorDrawer";
import { User as UserType } from "@/lib/types";

export default function SettingsPage() {
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/me");
      const json = await res.json();
      if (json.success) setUserData(json.data);
    } catch (e) {
      console.error("Profile sync failure", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      try {
        const res = await fetch("/api/me");
        const json = await res.json();
        if (!ignore && json.success) setUserData(json.data);
      } catch (e) {
        console.error("Profile sync failure", e);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    init();
    return () => { ignore = true; };
  }, []);

  const sections = [
    {
      title: "Profile & Identity",
      description: "Manage your professional information and public appearances.",
      icon: User,
      fields: [
        { label: "Full Name", value: userData?.name || "Loading..." },
        { label: "Email Address", value: userData?.email || "Loading..." },
        { label: "Professional Role", value: userData?.role || "LAWYER" },
      ],
    },
    {
      title: "Security & Authentication",
      description: "Ensure your account is protected with modern cryptography.",
      icon: Lock,
      fields: [
        { label: "Password Protocol", value: "Standard Secure" },
        { label: "2FA Status", value: "Disabled" },
      ],
    },
    {
      title: "Notifications",
      description: "Configure alerts for upcoming hearings and case updates.",
      icon: Bell,
      fields: [
        { label: "Email Alerts", value: "Enabled" },
        { label: "Push Reminders", value: "Mobile Sync Only" },
      ],
    },
    {
      title: "Subscription & Plan",
      description: "Manage your professional subscription tier and billing methods.",
      icon: CreditCard,
      fields: [
        { label: "Active Tier", value: userData?.plan || "ESSENTIAL" },
        { label: "Billing Status", value: "Verified Professional" },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--muted)" }} />
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          Synchronizing Config Identity...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div
          className="w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-lg"
          style={{ background: "var(--foreground)" }}
        >
          <UserCircle className="w-10 h-10" style={{ color: "var(--background)" }} />
        </div>
        <div className="flex flex-col gap-1">
          <h1
            className="text-3xl md:text-4xl font-black tracking-tighter"
            style={{ color: "var(--foreground)" }}
          >
            System Preferences
          </h1>
          <div className="flex items-center gap-3 text-sm font-bold" style={{ color: "var(--muted)" }}>
            <Mail className="w-4 h-4" />
            <span>{userData?.email}</span>
            <span className="w-1 h-1 rounded-full" style={{ background: "var(--border)" }} />
            <span className="uppercase tracking-widest text-[10px]">ID: {userData?.id?.slice(0, 8)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {sections.map((sec, i) => (
          <motion.div
            key={sec.title}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => {
              setActiveSection(sec.title);
              setDrawerOpen(true);
            }}
            className="rounded-[2.5rem] p-8 cursor-pointer transition-all hover:scale-[1.02] group relative overflow-hidden"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div
                  className="p-3.5 rounded-2xl transition-transform group-hover:scale-110"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <sec.icon className="w-5 h-5" style={{ color: "var(--foreground)" }} />
                </div>
                <h2
                  className="text-lg font-black tracking-tight uppercase"
                  style={{ color: "var(--foreground)" }}
                >
                  {sec.title}
                </h2>
              </div>
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" style={{ color: "var(--muted)" }} />
            </div>

            <p className="text-sm font-medium mb-8 leading-relaxed" style={{ color: "var(--muted)" }}>
              {sec.description}
            </p>

            <div className="space-y-4">
              {sec.fields.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-3"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <span className="font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                    {f.label}
                  </span>
                  <span className="font-black text-sm" style={{ color: "var(--foreground)" }}>
                    {f.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Edit Label Flash */}
            <div
              className="absolute bottom-4 right-8 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "var(--foreground)" }}
            >
              Modify Protocol
            </div>
          </motion.div>
        ))}

        {/* System Fidelity / Data Archive */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-2 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-start gap-6">
            <div
              className="p-4 rounded-2xl shrink-0"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <ShieldCheck className="w-6 h-6" style={{ color: "var(--foreground)" }} />
            </div>
            <div className="space-y-1">
              <h2
                className="text-xl font-black tracking-tighter uppercase"
                style={{ color: "var(--foreground)" }}
              >
                Data Compliance & Archiving
              </h2>
              <p
                className="text-sm font-medium max-w-xl leading-relaxed"
                style={{ color: "var(--muted)" }}
              >
                Download a full cryptographic archive of your legal case directory or formally request
                account de-identification. All archives are generated in encrypted JSON format.
              </p>
            </div>
          </div>
          <button
            className="whitespace-nowrap h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:opacity-80 shadow-lg"
            style={{ background: "var(--foreground)", color: "var(--background)" }}
          >
            Generate Archive
          </button>
        </motion.div>
      </div>

      <SettingsEditorDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          fetchUser(); // Refresh after edit
        }}
        section={activeSection}
        currentUser={userData}
      />
    </div>
  );
}
