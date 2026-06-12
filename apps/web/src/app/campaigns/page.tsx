"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Megaphone, Plus, ChevronRight, Clock, Users } from "lucide-react";
import { timeAgo, CHANNEL_ICONS, formatNumber } from "@/lib/utils";
import type { Campaign } from "@/types";

interface CampaignsResponse { campaigns: Campaign[]; }

const STATUS: Record<string, { label: string; dot: string; color: string; bg: string }> = {
  draft:     { label: "Draft",     dot: "dot dot-slate",  color: "var(--text-muted)",  bg: "rgba(61,96,128,0.1)"  },
  sending:   { label: "LIVE",      dot: "dot dot-live",   color: "var(--neon-blue)",   bg: "rgba(0,212,255,0.08)" },
  completed: { label: "Complete",  dot: "dot dot-green",  color: "var(--neon-green)",  bg: "rgba(0,255,136,0.08)" },
  failed:    { label: "Failed",    dot: "dot dot-rose",   color: "var(--neon-pink)",   bg: "rgba(247,47,255,0.08)"},
};

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp", sms: "SMS", email: "Email", rcs: "RCS",
};

export default function CampaignsPage() {
  const { data, isLoading } = useQuery<CampaignsResponse>({
    queryKey: ["campaigns"],
    queryFn: () => fetch("/api/campaigns").then((r) => r.json()),
    refetchInterval: 5000,
  });

  const campaigns = data?.campaigns ?? [];
  const live = campaigns.filter((c) => c.status === "sending").length;
  const completed = campaigns.filter((c) => c.status === "completed").length;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: "var(--space-section)" }}>
        <div className="section-eyebrow">
          <div className="eyebrow-line" style={{ background: "var(--neon-green)", boxShadow: "0 0 6px var(--neon-green)" }} />
          <span className="label-orbitron" style={{ color: "var(--neon-green)" }}>Campaign Manager</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <h1 className="display-xl gradient-text-neon" style={{ marginBottom: "8px" }}>Campaigns</h1>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              {campaigns.length} total · {live} live · {completed} completed
            </p>
          </div>
          <Link href="/" className="btn btn-neon-solid" style={{ flexShrink: 0 }}>
            <Plus size={14} /> New Mission
          </Link>
        </div>
      </div>

      {/* Stats strip */}
      <div className="glass-neon animate-fade-up stagger-1" style={{
        display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0",
        marginBottom: "32px", padding: "20px 0", borderRadius: "14px",
        overflow: "hidden",
      }}>
        {[
          { label: "Total", value: campaigns.length, color: "var(--text-primary)", neon: "" },
          { label: "Active", value: live,              color: "var(--neon-blue)",   neon: "0 0 12px rgba(0,212,255,0.5)" },
          { label: "Delivered", value: completed,      color: "var(--neon-green)",  neon: "0 0 12px rgba(0,255,136,0.5)" },
        ].map(({ label, value, color, neon }, i) => (
          <div key={label} style={{
            textAlign: "center", padding: "4px 0",
            borderRight: i < 2 ? "1px solid rgba(0,212,255,0.1)" : "none",
          }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "26px", color, textShadow: neon, lineHeight: 1, letterSpacing: "0.02em" }}>
              {value}
            </p>
            <p className="label-orbitron" style={{ color: "var(--text-muted)", marginTop: "6px" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="glass" style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "80px", textAlign: "center",
          border: "1px dashed rgba(0,255,136,0.2)",
        }}>
          <div className="animate-float" style={{ fontSize: "48px", marginBottom: "20px", filter: "drop-shadow(0 0 12px rgba(0,255,136,0.5))" }}>
            📡
          </div>
          <h3 className="display-md" style={{ color: "var(--text-secondary)", marginBottom: "10px" }}>No missions initiated</h3>
          <p style={{ color: "var(--text-muted)", maxWidth: "300px", lineHeight: 1.8, marginBottom: "24px" }}>
            Head to the AI Campaign Planner on the dashboard to launch your first campaign.
          </p>
          <Link href="/" className="btn btn-primary">← Back to HQ</Link>
        </div>
      ) : (
        <div className="animate-fade-up stagger-2" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {campaigns.map((campaign, i) => {
            const st = STATUS[campaign.status] ?? STATUS.draft;
            return (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="glass group"
                style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  padding: "16px 22px", textDecoration: "none", transition: "all 0.2s",
                  animationDelay: `${i * 0.04}s`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,255,136,0.2)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px rgba(0,255,136,0.07)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--glass-border)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: "12px", flexShrink: 0,
                  background: "rgba(0,255,136,0.05)",
                  border: "1px solid rgba(0,255,136,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px",
                }}>
                  {CHANNEL_ICONS[campaign.channel] ?? "📨"}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }} className="truncate">
                      {campaign.name}
                    </p>
                    {campaign.status === "sending" && <div className="dot dot-live" />}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{
                      background: "rgba(0,212,255,0.05)",
                      border: "1px solid rgba(0,212,255,0.1)",
                      color: "var(--neon-blue)",
                      padding: "2px 8px", borderRadius: "6px",
                      fontSize: "9px", fontFamily: "var(--font-mono)", letterSpacing: "0.08em",
                    }}>
                      {CHANNEL_LABELS[campaign.channel] ?? campaign.channel}
                    </span>
                    {(campaign._count?.messages ?? 0) > 0 && (
                      <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Users size={10} /> {formatNumber(campaign._count!.messages)}
                      </span>
                    )}
                    <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={10} /> {timeAgo(campaign.createdAt)}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                  <span style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    fontSize: "10px", fontWeight: 600, fontFamily: "var(--font-heading)",
                    color: st.color, background: st.bg,
                    padding: "4px 10px", borderRadius: "99px",
                    border: `1px solid ${st.color}30`,
                  }}>
                    <span className={st.dot} /> {st.label}
                  </span>
                  <ChevronRight size={14} className="hover-arrow" style={{ color: "var(--text-muted)", opacity: 0.4 }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
