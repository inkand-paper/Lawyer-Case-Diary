"use client";

import { motion } from "framer-motion";
import { 
  User, 
  Lock, 
  Bell, 
  Database, 
  ShieldCheck,
  CreditCard
} from "lucide-react";

export default function SettingsPage() {
  const sections = [
    {
      title: "Profile & Identity",
      description: "Manage your professional information and public appearances.",
      icon: <User className="w-5 h-5 text-indigo-400" />,
      fields: ["Full Name", "Email Address", "Phone Number", "Bar Association ID"]
    },
    {
      title: "Security & Authentication",
      description: "Ensure your account is protected with modern cryptography.",
      icon: <Lock className="w-5 h-5 text-indigo-400" />,
      fields: ["Change Password", "Two-Factor Authentication (2FA)", "Active Sessions"]
    },
    {
      title: "Notifications",
      description: "Configure alerts for upcoming hearings and case updates.",
      icon: <Bell className="w-5 h-5 text-indigo-400" />,
      fields: ["Email Alerts", "Push Notifications", "Daily Digest"]
    },
    {
      title: "Billing & Plans",
      description: "Manage your professional subscription tier and billing methods.",
      icon: <CreditCard className="w-5 h-5 text-indigo-400" />,
      fields: ["Current Plan: Professional", "Payment Methods", "Billing History"]
    }
  ];

  return (
    <div className="space-y-10 max-w-5xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">System Preferences</h1>
        <p className="text-zinc-500 font-medium">Configure your ecosystem settings and secure your data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((sec, i) => (
          <motion.div
            key={sec.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-950 border border-white/5 rounded-[2rem] p-8 hover:border-white/10 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                {sec.icon}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{sec.title}</h2>
            </div>
            <p className="text-sm text-zinc-500 mb-6">{sec.description}</p>
            
            <ul className="space-y-3">
              {sec.fields.map((field, idx) => (
                <li key={idx} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0 group-hover:border-white/10 transition-colors">
                  <span className="font-semibold text-zinc-400">{field}</span>
                  <span className="text-indigo-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
        
        {/* Data export / compliance box */}
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 bg-gradient-to-r from-red-500/5 to-rose-500/5 border border-red-500/10 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <ShieldCheck className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Data Compliance & Archiving</h2>
                <p className="text-sm text-zinc-400 mt-1 max-w-xl">
                  Download a full cryptographic archive of your case directory or formally request account deletion.
                </p>
              </div>
            </div>
            <button className="whitespace-nowrap px-6 py-3 bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 text-white font-bold rounded-xl transition-all">
              Request Archive
            </button>
        </motion.div>
      </div>
    </div>
  );
}
