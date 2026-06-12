"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { CampaignFunnel } from "@/components/campaigns/CampaignFunnel";
import { InsightBadge } from "@/components/ai/InsightBadge";
import { timeAgo, CHANNEL_ICONS, formatNumber } from "@/lib/utils";
import type { CampaignAnalytics } from "@/types";

interface CampaignDetail {
  campaign: {
    id: string;
    name: string;
    status: string;
    channel: string;
    messageBody: string;
    createdAt: string;
    launchedAt: string | null;
    segment?: { name: string; nlQuery?: string | null; audienceSize?: number | null };
    _count: { messages: number };
  };
}

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: campaignData, isLoading: campaignLoading } = useQuery<CampaignDetail>({
    queryKey: ["campaign", id],
    queryFn: () => fetch(`/api/campaigns/${id}`).then((r) => r.json()),
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<CampaignAnalytics>({
    queryKey: ["analytics", id],
    queryFn: () => fetch(`/api/campaigns/${id}/analytics`).then((r) => r.json()),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "sending" ? 3000 : false;
    },
  });

  const campaign = campaignData?.campaign;
  const isLive = analytics?.status === "sending";

  if (campaignLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>
        Campaign not found.
      </div>
    );
  }

  return (
    <div className="min-h-full p-8">
      {/* Back */}
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-80 transition-opacity"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowLeft size={14} />
        All Campaigns
      </Link>

      {/* Campaign header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">{CHANNEL_ICONS[campaign.channel] ?? "📨"}</span>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {campaign.name}
            </h1>
            {isLive && <span className="status-dot sending" />}
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {campaign.segment?.name ?? "No segment"} ·{" "}
            {formatNumber(campaign._count.messages)} recipients ·{" "}
            {campaign.launchedAt
              ? `Launched ${timeAgo(campaign.launchedAt)}`
              : `Created ${timeAgo(campaign.createdAt)}`}
          </p>
        </div>

        <span
          className="px-3 py-1.5 rounded-full text-sm font-medium capitalize"
          style={{
            background:
              campaign.status === "completed"
                ? "rgba(16,185,129,0.15)"
                : campaign.status === "sending"
                ? "rgba(59,130,246,0.15)"
                : campaign.status === "failed"
                ? "rgba(244,63,94,0.15)"
                : "rgba(71,85,105,0.2)",
            color:
              campaign.status === "completed"
                ? "#34d399"
                : campaign.status === "sending"
                ? "#60a5fa"
                : campaign.status === "failed"
                ? "#f87171"
                : "#94a3b8",
          }}
        >
          {campaign.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Funnel */}
          <div
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Delivery Funnel
              </h2>
              {isLive && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "#60a5fa" }}>
                  <span className="status-dot sending" />
                  Live updating
                </div>
              )}
            </div>
            {analyticsLoading ? (
              <div className="skeleton h-40 rounded-lg" />
            ) : analytics ? (
              <CampaignFunnel analytics={analytics} />
            ) : null}
          </div>

          {/* AI Insight */}
          {analytics?.aiInsight && (
            <InsightBadge insight={analytics.aiInsight} />
          )}
        </div>

        {/* Right — campaign details */}
        <div className="space-y-4">
          {/* Segment info */}
          {campaign.segment && (
            <div className="glass-card p-4">
              <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                SEGMENT
              </p>
              <p className="font-medium text-sm mb-1" style={{ color: "var(--text-primary)" }}>
                {campaign.segment.name}
              </p>
              {campaign.segment.nlQuery && (
                <p
                  className="text-xs leading-relaxed italic border-l-2 pl-3 mt-2"
                  style={{
                    color: "var(--text-secondary)",
                    borderLeftColor: "var(--bg-border)",
                  }}
                >
                  &ldquo;{campaign.segment.nlQuery}&rdquo;
                </p>
              )}
              {campaign.segment.audienceSize && (
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                  {formatNumber(campaign.segment.audienceSize)} customers matched
                </p>
              )}
            </div>
          )}

          {/* Message preview */}
          <div className="glass-card p-4">
            <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
              MESSAGE TEMPLATE
            </p>
            <div
              className="p-3 rounded-lg text-sm leading-relaxed border"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--bg-border)",
                color: "var(--text-primary)",
              }}
            >
              {campaign.messageBody}
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              {campaign.messageBody.length} chars · via{" "}
              {CHANNEL_ICONS[campaign.channel]} {campaign.channel}
            </p>
          </div>

          {/* Stats summary */}
          {analytics && (
            <div className="glass-card p-4">
              <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>
                SUMMARY
              </p>
              <div className="space-y-2">
                {[
                  { label: "Total Recipients", value: formatNumber(analytics.totalMessages) },
                  { label: "Delivered", value: formatNumber(analytics.funnel.delivered ?? 0) },
                  { label: "Opened", value: formatNumber(analytics.funnel.opened ?? 0) },
                  { label: "Clicked", value: formatNumber(analytics.funnel.clicked ?? 0) },
                  { label: "Converted", value: formatNumber(analytics.funnel.converted ?? 0) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
