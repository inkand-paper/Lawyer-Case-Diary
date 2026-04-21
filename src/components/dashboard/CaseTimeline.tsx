"use client";

import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Gavel, 
  CreditCard, 
  FileText,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineItem {
  id: string;
  type: "CREATED" | "HEARING" | "PAYMENT" | "NOTE" | "CLOSED";
  title: string;
  date: string;
  description?: string;
  isCompleted?: boolean;
}

interface CaseTimelineProps {
  items: TimelineItem[];
}

export function CaseTimeline({ items }: CaseTimelineProps) {
  return (
    <div className="relative pl-8 space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-indigo-600 before:via-zinc-800 before:to-zinc-900">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative group"
        >
          {/* Icon node */}
          <div className={cn(
            "absolute -left-[45px] top-0 w-6 h-6 rounded-full border-4 border-black flex items-center justify-center transition-all duration-500 z-10",
            item.isCompleted ? "bg-indigo-600 border-indigo-600/30 scale-110 shadow-[0_0_15px_rgba(79,70,229,0.5)]" : "bg-zinc-900 border-zinc-800"
          )}>
            {item.isCompleted ? (
              <CheckCircle2 className="w-3 h-3 text-white" />
            ) : (
              <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full" />
            )}
          </div>

          {/* Content */}
          <div className="bg-zinc-950 border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-all hover:bg-zinc-900/40">
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-4">
                <div className="bg-white/5 p-2.5 rounded-xl text-indigo-400">
                  <TimelineIcon type={item.type} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                    <Clock className="w-3 h-3" />
                    {item.date}
                  </p>
                </div>
              </div>
              {item.isCompleted && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  VERIFIED
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-zinc-400 text-sm leading-relaxed mt-4 pl-14">
                {item.description}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function TimelineIcon({ type }: { type: TimelineItem["type"] }) {
  switch (type) {
    case "CREATED": return <FileText className="w-5 h-5" />;
    case "HEARING": return <Gavel className="w-5 h-5" />;
    case "PAYMENT": return <CreditCard className="w-5 h-5" />;
    case "NOTE": return <Clock className="w-5 h-5" />;
    case "CLOSED": return <Lock className="w-5 h-5" />;
    default: return <Circle className="w-5 h-5" />;
  }
}
