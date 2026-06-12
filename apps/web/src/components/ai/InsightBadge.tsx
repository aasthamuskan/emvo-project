"use client";

import { Sparkles } from "lucide-react";

interface InsightBadgeProps {
  insight: string;
}

export function InsightBadge({ insight }: InsightBadgeProps) {
  return (
    <div
      className="animate-fade-in flex gap-3 p-4 rounded-xl border"
      style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))",
        borderColor: "rgba(139,92,246,0.3)",
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}
      >
        <Sparkles size={13} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-semibold mb-1" style={{ color: "#a78bfa" }}>
          AI INSIGHT
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
          {insight}
        </p>
      </div>
    </div>
  );
}
