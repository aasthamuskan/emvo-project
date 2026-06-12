"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import type { CampaignAnalytics } from "@/types";
import { formatPercent } from "@/lib/utils";

interface CampaignFunnelProps {
  analytics: CampaignAnalytics;
}

const FUNNEL_STEPS = [
  { key: "sent", label: "Sent", color: "#3b82f6" },
  { key: "delivered", label: "Delivered", color: "#6366f1" },
  { key: "opened", label: "Opened", color: "#8b5cf6" },
  { key: "clicked", label: "Clicked", color: "#f59e0b" },
  { key: "converted", label: "Converted", color: "#10b981" },
];

const CustomTooltip = ({
  active, payload
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-lg border text-xs"
      style={{
        background: "var(--bg-elevated)",
        borderColor: "var(--bg-border)",
        color: "var(--text-primary)",
      }}
    >
      <strong>{payload[0].value.toLocaleString()}</strong> messages
    </div>
  );
};

export function CampaignFunnel({ analytics }: CampaignFunnelProps) {
  const { funnel, rates, totalMessages } = analytics;

  const data = FUNNEL_STEPS.map((step) => ({
    name: step.label,
    value: funnel[step.key as keyof typeof funnel] ?? 0,
    color: step.color,
  }));

  return (
    <div className="space-y-4">
      {/* Bar chart */}
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={40}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Rate cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Delivery Rate", value: rates.deliveryRate, color: "#6366f1" },
          { label: "Open Rate", value: rates.openRate, color: "#8b5cf6" },
          { label: "Click Rate", value: rates.clickRate, color: "#f59e0b" },
          { label: "Conversion", value: rates.conversionRate, color: "#10b981" },
        ].map((r) => (
          <div
            key={r.label}
            className="p-3 rounded-lg text-center border"
            style={{ background: "var(--bg-surface)", borderColor: "var(--bg-border)" }}
          >
            <p
              className="text-xl font-bold"
              style={{ color: r.color }}
            >
              {formatPercent(r.value)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {r.label}
            </p>
          </div>
        ))}
      </div>

      {/* Failed count */}
      {(funnel.failed ?? 0) > 0 && (
        <p className="text-xs" style={{ color: "#f87171" }}>
          ⚠ {funnel.failed} message{funnel.failed !== 1 ? "s" : ""} failed to deliver
          ({formatPercent((funnel.failed ?? 0) / totalMessages)})
        </p>
      )}
    </div>
  );
}
