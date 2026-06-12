"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { CommandBar } from "@/components/ai/CommandBar";
import { PlannerPreview } from "@/components/ai/PlannerPreview";
import type { AIPlanResult, Channel } from "@/types";
import {
  Users, Megaphone, TrendingUp, Activity,
  ChevronRight, Clock, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { timeAgo, CHANNEL_ICONS, formatNumber } from "@/lib/utils";

// Lazy-load Three.js globe (SSR-safe)
const Globe3D = dynamic(() => import("@/components/ui/Globe3D").then((m) => ({ default: m.Globe3D })), { ssr: false });

interface DashboardData {
  stats: { totalCustomers: number; totalCampaigns: number; activeCampaigns: number; totalMessages: number };
  recentCampaigns: {
    id: string; name: string; status: string; channel: string; createdAt: string;
    _count: { messages: number };
  }[];
}

const STATUS: Record<string, { label: string; dot: string; color: string }> = {
  draft:     { label: "Draft",     dot: "dot dot-slate",  color: "var(--text-muted)" },
  sending:   { label: "LIVE",      dot: "dot dot-live",   color: "var(--neon-blue)"  },
  completed: { label: "Complete",  dot: "dot dot-green",  color: "var(--neon-green)" },
  failed:    { label: "Failed",    dot: "dot dot-rose",   color: "var(--neon-pink)"  },
};

const STAT_CARDS = [
  {
    key: "totalCustomers", label: "Shoppers", sub: "in database",
    icon: Users, neon: "#00d4ff", glow: "rgba(0,212,255,0.3)", grad: "linear-gradient(135deg,#003d5c,#006494)",
  },
  {
    key: "totalCampaigns", label: "Campaigns", sub: "total launched",
    icon: Megaphone, neon: "#00ff88", glow: "rgba(0,255,136,0.3)", grad: "linear-gradient(135deg,#003d26,#006644)",
  },
  {
    key: "activeCampaigns", label: "Active", sub: "sending now",
    icon: Activity, neon: "#ffb800", glow: "rgba(255,184,0,0.3)", grad: "linear-gradient(135deg,#3d2c00,#664a00)",
  },
  {
    key: "totalMessages", label: "Delivered", sub: "across channels",
    icon: TrendingUp, neon: "#7b2fff", glow: "rgba(123,47,255,0.35)", grad: "linear-gradient(135deg,#1a0050,#3d0088)",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<AIPlanResult | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [launchedId, setLaunchedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => fetch("/api/dashboard").then((r) => r.json()),
    refetchInterval: 10000,
  });

  const handlePlanGenerated = useCallback((p: AIPlanResult) => {
    setPlan(p);
    setLaunched(false);
    setLaunchedId(null);
  }, []);

  const handleLaunch = useCallback(async (variantId: string, channel: Channel) => {
    if (!plan) return;
    setIsLaunching(true);
    try {
      const variant = plan.messageVariants.find((v) => v.id === variantId);
      if (!variant) throw new Error("Variant not found");
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: plan.campaignName, channel, messageBody: variant.body,
          filterJson: plan.filters, audienceSize: plan.audienceCount,
        }),
      });
      const { campaign } = await res.json();
      if (!res.ok) throw new Error("Failed");
      await fetch(`/api/campaigns/${campaign.id}/send`, { method: "POST" });
      setLaunched(true);
      setLaunchedId(campaign.id);
      setTimeout(() => router.push(`/campaigns/${campaign.id}`), 1800);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Launch failed");
    } finally {
      setIsLaunching(false);
    }
  }, [plan, router]);

  const stats = data?.stats;
  const recentCampaigns = data?.recentCampaigns ?? [];

  return (
    <div className="page-container">

      {/* ══ HERO SECTION ══════════════════════════ */}
      <div
        className="animate-fade-up"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "48px",
          marginBottom: "var(--space-section)",
          minHeight: "240px",
        }}
      >
        {/* Left: Text */}
        <div style={{ flex: 1 }}>
          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div className="dot dot-live" />
            <span className="label-orbitron" style={{ color: "var(--neon-blue)" }}>Live System · Xeno 2026</span>
          </div>

          {/* Hero headline */}
          <h1
            className="display-hero gradient-text-neon animate-hologram"
            style={{ marginBottom: "16px" }}
          >
            EMVO<br />
            <span style={{ fontWeight: 400, fontSize: "0.65em", letterSpacing: "0.25em" }}>
              NEXUS CRM
            </span>
          </h1>

          <p style={{ color: "var(--text-secondary)", maxWidth: "380px", lineHeight: 1.8, marginBottom: "24px", fontSize: "14px" }}>
            AI-native campaign intelligence. Describe your audience in plain English — our neural engine handles segmentation, messaging, and multi-channel delivery.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="#planner" className="btn btn-neon-solid">
              Launch Campaign ↗
            </Link>
            <Link href="/customers" className="btn btn-primary">
              Browse Shoppers
            </Link>
          </div>
        </div>

        {/* Right: 3D Globe */}
        <div
          style={{
            flexShrink: 0,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Glow halo behind globe */}
          <div style={{
            position: "absolute",
            width: 260, height: 260,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,212,255,0.12) 0%, rgba(123,47,255,0.08) 50%, transparent 70%)",
            filter: "blur(20px)",
          }} />
          <Globe3D size={240} />
        </div>
      </div>

      {/* ══ STAT CARDS ════════════════════════════ */}
      <div
        className="animate-fade-up stagger-1"
        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "var(--space-section)" }}
      >
        {STAT_CARDS.map(({ key, label, sub, icon: Icon, neon, glow, grad }, i) => {
          const val = stats ? (stats as Record<string, number>)[key] : null;
          return (
            <div
              key={key}
              className="glass"
              style={{
                padding: "22px",
                position: "relative",
                overflow: "hidden",
                animationDelay: `${i * 0.06}s`,
                transition: "transform 0.3s var(--ease-spring), box-shadow 0.3s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px) scale(1.02)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px ${glow}, 0 16px 40px rgba(0,0,0,0.6)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }}
            >
              {/* Corner decorators */}
              <div className="corner-tl" />
              <div className="corner-br" />

              {/* Top gradient stripe */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                background: `linear-gradient(90deg, transparent, ${neon}, transparent)`,
                boxShadow: `0 0 8px ${neon}`,
              }} />

              {/* Icon */}
              <div style={{
                width: 40, height: 40,
                borderRadius: "10px",
                background: grad,
                border: `1px solid ${neon}30`,
                boxShadow: `0 0 16px ${glow}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "14px",
              }}>
                <Icon size={17} color={neon} />
              </div>

              {/* Value */}
              {isLoading ? (
                <>
                  <div className="skeleton" style={{ height: 32, width: 80, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: 100 }} />
                </>
              ) : (
                <div className="animate-fade-up">
                  <p style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "28px", fontWeight: 700,
                    color: neon, lineHeight: 1,
                    textShadow: `0 0 12px ${neon}`,
                    letterSpacing: "0.02em",
                    marginBottom: "4px",
                  }}>
                    {val != null ? formatNumber(val) : "—"}
                  </p>
                  <p style={{ color: "var(--text-primary)", fontSize: "13px", fontFamily: "var(--font-heading)", fontWeight: 600, marginBottom: "2px" }}>
                    {label}
                  </p>
                  <p style={{ color: "var(--text-muted)", fontSize: "11px" }}>{sub}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ══ AI PLANNER SECTION ════════════════════ */}
      <div
        id="planner"
        className="glass-neon animate-fade-up stagger-2"
        style={{ marginBottom: "var(--space-section)", padding: "32px 36px" }}
      >
        {/* Corner brackets */}
        <div className="corner-tl" />
        <div className="corner-tr" />
        <div className="corner-bl" />
        <div className="corner-br" />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: 44, height: 44, borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(123,47,255,0.2))",
              border: "1px solid rgba(0,212,255,0.3)",
              boxShadow: "0 0 20px rgba(0,212,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px",
            }}>
              🧠
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "var(--neon-blue)", letterSpacing: "0.12em", marginBottom: "3px" }}>
                NEURAL CAMPAIGN ENGINE
              </p>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                AI Campaign Planner
              </p>
            </div>
          </div>
          <div className="badge badge-blue" style={{ padding: "6px 14px", fontSize: "11px" }}>
            <div className="dot dot-live" />
            GPT-4o-mini
          </div>
        </div>

        {/* Planner — vertical stack: input on top, result below */}
        <CommandBar
          onPlanGenerated={handlePlanGenerated}
          onClear={() => { setPlan(null); setLaunched(false); }}
          hasResult={!!plan}
        />

        {plan && (
          <div className="animate-fade-up" style={{ marginTop: "20px" }}>
            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
              <div className="divider" style={{ flex: 1 }} />
              <span className="label-orbitron" style={{ color: "var(--neon-purple)", flexShrink: 0 }}>
                ✦ Plan Generated
              </span>
              <div className="divider" style={{ flex: 1 }} />
            </div>
            <PlannerPreview
              plan={plan}
              onLaunch={handleLaunch}
              isLaunching={isLaunching}
              launched={launched}
            />
          </div>
        )}

        {launched && launchedId && (
          <div className="animate-fade-up" style={{ marginTop: "20px" }}>
            <Link href={`/campaigns/${launchedId}`} className="btn btn-neon-solid">
              <TrendingUp size={14} />
              View Live Analytics
              <ArrowUpRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* ══ RECENT CAMPAIGNS ══════════════════════ */}
      <div className="animate-fade-up stagger-3">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <div className="section-eyebrow">
              <div className="eyebrow-line" />
              <span className="label-orbitron" style={{ color: "var(--neon-blue)" }}>Mission Log</span>
            </div>
            <h2 className="display-lg" style={{ color: "var(--text-primary)" }}>Recent Campaigns</h2>
          </div>
          <Link href="/campaigns" className="btn btn-ghost" style={{ fontSize: "12px", padding: "7px 14px" }}>
            View all <ChevronRight size={13} />
          </Link>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 16 }} />)}
          </div>
        ) : recentCampaigns.length === 0 ? (
          <div
            className="glass"
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", padding: "72px 40px", textAlign: "center",
              border: "1px dashed rgba(0,212,255,0.15)",
            }}
          >
            <div className="animate-float" style={{
              fontSize: "48px", marginBottom: "20px",
              filter: "drop-shadow(0 0 12px rgba(0,212,255,0.5))",
            }}>🚀</div>
            <h3 className="display-md" style={{ color: "var(--text-secondary)", marginBottom: "10px" }}>
              No campaigns initiated
            </h3>
            <p style={{ color: "var(--text-muted)", maxWidth: "320px", lineHeight: 1.8 }}>
              Use the Neural Campaign Engine above to launch your first mission.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recentCampaigns.map((c, i) => {
              const st = STATUS[c.status] ?? STATUS.draft;
              return (
                <Link
                  key={c.id}
                  href={`/campaigns/${c.id}`}
                  className="glass group"
                  style={{
                    display: "flex", alignItems: "center", gap: "16px",
                    padding: "16px 22px", textDecoration: "none",
                    transition: "all 0.25s",
                    animationDelay: `${i * 0.04}s`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.3)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(0,212,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--glass-border)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: "12px", flexShrink: 0,
                    background: "rgba(0,212,255,0.05)",
                    border: "1px solid rgba(0,212,255,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "22px",
                  }}>
                    {CHANNEL_ICONS[c.channel] ?? "📨"}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "14px", color: "var(--text-primary)", marginBottom: "4px" }}>
                      {c.name}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {c._count.messages > 0 && (
                        <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Users size={10} /> {formatNumber(c._count.messages)}
                        </span>
                      )}
                      <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={10} /> {timeAgo(c.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                    <span style={{ fontSize: "11px", color: st.color, display: "flex", alignItems: "center", gap: "5px" }}>
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

      {/* ══ QUICK NAV ═════════════════════════════ */}
      <div
        className="animate-fade-up stagger-4"
        style={{
          marginTop: "var(--space-section)",
          padding: "18px 24px",
          borderRadius: "12px",
          background: "rgba(0,212,255,0.03)",
          border: "1px solid rgba(0,212,255,0.08)",
          display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap",
        }}
      >
        <span className="label-orbitron" style={{ color: "var(--text-muted)" }}>QUICK ACCESS ·</span>
        {[
          { href: "/customers", label: "500 Shoppers →" },
          { href: "/segments",  label: "Audience Segments →" },
          { href: "/campaigns", label: "All Campaigns →" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: "var(--font-heading)", fontSize: "13px", fontWeight: 500,
              color: "var(--neon-blue)", textDecoration: "none",
              transition: "text-shadow 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textShadow = "0 0 8px var(--neon-blue)")}
            onMouseLeave={(e) => (e.currentTarget.style.textShadow = "none")}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
