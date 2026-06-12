import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export const CHANNEL_ICONS: Record<string, string> = {
  whatsapp: "💬",
  sms: "📱",
  email: "📧",
  rcs: "✨",
};

export const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: "text-emerald-400",
  sms: "text-blue-400",
  email: "text-violet-400",
  rcs: "text-amber-400",
};

export const STATUS_COLORS: Record<string, string> = {
  draft: "text-slate-400",
  sending: "text-blue-400",
  completed: "text-emerald-400",
  failed: "text-red-400",
  queued: "text-slate-400",
  sent: "text-blue-300",
  delivered: "text-blue-400",
  opened: "text-violet-400",
  clicked: "text-amber-400",
  converted: "text-emerald-400",
};
