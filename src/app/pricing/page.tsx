"use client";

import { CheckCircle2, Crown, Star, Zap, ArrowRight, ShieldCheck, Gavel, Scale } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const PLANS = [
  {
    id: "ESSENTIAL",
    name: "Basic",
    price: "49",
    currency: "USD",
    period: "month",
    icon: Zap,
    color: "blue",
    features: [
      "50 Active Case Files",
      "Standard Clients",
      "Basic Hearing Reminders",
      "Standard SSL Encryption",
      "Email Support"
    ],
    desc: "The essential toolkit for modern solo practitioners."
  },
  {
    id: "EXECUTIVE",
    name: "Pro",
    price: "99",
    currency: "USD",
    period: "month",
    icon: Star,
    color: "purple",
    popular: true,
    features: [
      "Unlimited Case Files",
      "Manage Clients",
      "Priority Hearing Alerts (SMS/WhatsApp)",
      "Military-Grade Security",
      "Sync Across All Devices",
      "Document Storage"
    ],
    desc: "The standard for high-performance legal practices."
  },
  {
    id: "ULTIMATE",
    name: "Premium",
    price: "249",
    currency: "USD",
    period: "month",
    icon: Crown,
    color: "amber",
    features: [
      "Shared Access for Teams",
      "Custom Branding",
      "Dedicated Support",
      "Direct API Access",
      "Unlimited File Storage"
    ],
    desc: "Bespoke infrastructure for leading legal chambers."
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#05070a] text-zinc-100 font-serif selection:bg-blue-500/30">
      
      {/* BACKGROUND DECOR */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-8 py-24 space-y-24">
        
        {/* HERO */}
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Scale className="w-5 h-5 text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">Features</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase leading-none"
          >
            Elevate Your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Legal Legacy</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-zinc-500 text-lg font-medium italic"
          >
            Select a plan that works best for you.
          </motion.p>
        </div>

        {/* PRICING GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className={`relative group bg-zinc-900/30 border ${plan.popular ? 'border-blue-500/50 bg-zinc-900/50' : 'border-zinc-800'} p-10 rounded-[3rem] flex flex-col gap-8 hover:bg-zinc-900/80 transition-all duration-500 backdrop-blur-sm`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.3em] px-8 py-2.5 rounded-full shadow-2xl border border-blue-400/30">
                  Recommended Tier
                </div>
              )}
              
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${plan.color === 'blue' ? 'bg-blue-500/20 text-blue-500' : plan.color === 'purple' ? 'bg-purple-500/20 text-purple-500' : 'bg-amber-500/20 text-amber-500'} border border-zinc-800 shadow-xl`}>
                <plan.icon className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tighter uppercase">{plan.name}</h3>
                <div className="flex items-baseline gap-2 font-sans">
                  <span className="text-4xl font-black text-white">{plan.currency} {plan.price}</span>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">/ {plan.period}</span>
                </div>
              </div>

              <p className="text-xs font-medium text-zinc-400 leading-relaxed italic border-l-2 border-zinc-800 pl-4">
                {plan.desc}
              </p>

              <div className="space-y-4 flex-1 font-sans">
                {plan.features.map(feature => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5 shadow-blue-500/20" />
                    <span className="text-[11px] font-bold text-zinc-300 leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <Link 
                href="/register"
                className={`w-full py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 ${plan.popular ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-500 hover:scale-[1.02]' : 'bg-zinc-800 text-white hover:bg-zinc-700 hover:scale-[1.02]'}`}
              >
                Secure this Tier
                <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* TRUST BANNER */}
        <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           className="bg-zinc-900/20 border border-zinc-800 rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-12"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <ShieldCheck className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h4 className="text-xl font-black text-white uppercase tracking-tight">Data Privacy</h4>
              <p className="text-xs text-zinc-500 font-medium italic">Your case data remains encrypted and under your exclusive control.</p>
            </div>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-2xl font-black text-white">99.9%</p>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Uptime Record</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-white">256-bit</p>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Military Security</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-white">24/7</p>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Expert Support</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
