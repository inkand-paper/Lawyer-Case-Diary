import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type StatusType = "ACTIVE" | "CLOSED" | "PENDING" | "COMPLETED" | "ERROR";

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

/**
 * StatusBadge Component
 * Implements the "Dot + Pill" design spec for accessibility and clean aesthetics.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase();
  
  let dotColor = "bg-gray-500";
  let textColor = "text-gray-700 dark:text-gray-300";
  let bgColor = "bg-gray-100 dark:bg-gray-800";

  switch (normalizedStatus) {
    case "ACTIVE":
      dotColor = "bg-[var(--accent)]"; // Lighter Forest Green
      textColor = "text-[var(--accent)] dark:text-teal-400";
      bgColor = "bg-teal-50 dark:bg-teal-950/30";
      break;
    case "CLOSED":
    case "COMPLETED":
      dotColor = "bg-blue-500";
      textColor = "text-blue-700 dark:text-blue-400";
      bgColor = "bg-blue-50 dark:bg-blue-950/30";
      break;
    case "PENDING":
      dotColor = "bg-amber-500";
      textColor = "text-amber-700 dark:text-amber-400";
      bgColor = "bg-amber-50 dark:bg-amber-950/30";
      break;
    case "ERROR":
      dotColor = "bg-red-500";
      textColor = "text-red-700 dark:text-red-400";
      bgColor = "bg-red-50 dark:bg-red-950/30";
      break;
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide border border-transparent transition-colors",
        bgColor,
        textColor,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} aria-hidden="true" />
      <span>{normalizedStatus}</span>
    </div>
  );
}
