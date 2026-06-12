"use client";

import { useState } from "react";
import { Users, MessageSquare, Zap, ChevronDown, ChevronUp, Loader2, CheckCircle } from "lucide-react";
import { CHANNEL_ICONS, formatNumber } from "@/lib/utils";
import type { AIPlanResult, Channel } from "@/types";

interface PlannerPreviewProps {
  plan: AIPlanResult;
  onLaunch: (selectedVariantId: string, channel: Channel) => Promise<void>;
  isLaunching: boolean;
  launched: boolean;
}

const CHANNELS: { value: Channel; label: string; desc: string; neon: string; glow: string }[] = [
  { value: "whatsapp", label: "WhatsApp", desc: "Best open rates",  neon: "#00ff88", glow: "rgba(0,255,136,0.25)"  },
  { value: "sms",      label: "SMS",      desc: "Widest reach",    neon: "#00d4ff", glow: "rgba(0,212,255,0.25)"  },
  { value: "email",    label: "Email",    desc: "Rich content",    neon: "#7b2fff", glow: "rgba(123,47,255,0.25)" },
  { value: "rcs",      label: "RCS",      desc: "Interactive",     neon: "#ffb800", glow: "rgba(255,184,0,0.25)"  },
];

export function PlannerPreview({ plan, onLaunch, isLaunching, launched }: PlannerPreviewProps) {
  const [selectedVariant, setSelectedVariant] = useState("A");
  const [selectedChannel, setSelectedChannel] = useState<Channel>(plan.suggestedChannel);
  const [showReasoning, setShowReasoning] = useState(false);

  const activeVariant = plan.messageVariants.find((v) => v.id === selectedVariant) ?? plan.messageVariants[0];
  const activeChannelInfo = CHANNELS.find((c) => c.value === selectedChannel)!;

  return (
    <div
      className="animate-fade-up"
      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
    >
      {/* ── Header Card ─────────────────────────── */}
      <div
        className="glass"
        style={{ padding: "20px 22px", position: "relative", overflow: "hidden" }}
      >
        {/* Top neon stripe */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, transparent, var(--neon-blue), var(--neon-purple), transparent)",
        }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Eyebrow */}
            <p className="label-orbitron" style={{ color: "var(--neon-blue)", marginBottom: "8px" }}>
              ✦ AI Campaign Plan
            </p>
            {/* Name */}
            <h3 style={{
              fontFamily: "var(--font-heading)", fontWeight: 800,
              fontSize: "18px", color: "var(--text-primary)",
              lineHeight: 1.2, marginBottom: "6px",
            }}>
              {plan.campaignName}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
              Intent: <span style={{ color: "var(--neon-purple)", textTransform: "capitalize" }}>
                {plan.intent.replace(/_/g, " ")}
              </span>
            </p>
          </div>

          {/* Audience count */}
          <div style={{
            flexShrink: 0, textAlign: "center",
            padding: "10px 16px", borderRadius: "12px",
            background: "rgba(0,212,255,0.07)",
            border: "1px solid rgba(0,212,255,0.2)",
            boxShadow: "0 0 16px rgba(0,212,255,0.12)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
              <Users size={13} color="var(--neon-blue)" />
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 700,
                fontSize: "26px", color: "var(--neon-blue)",
                lineHeight: 1, textShadow: "0 0 12px rgba(0,212,255,0.6)",
                letterSpacing: "0.02em",
              }}>
                {formatNumber(plan.audienceCount)}
              </span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "10px", marginTop: "3px", fontFamily: "var(--font-display)", letterSpacing: "0.08em" }}>
              CUSTOMERS
            </p>
          </div>
        </div>

        {/* AI Reasoning toggle */}
        <button
          onClick={() => setShowReasoning(!showReasoning)}
          style={{
            marginTop: "14px", display: "flex", alignItems: "center", gap: "6px",
            color: "var(--text-muted)", fontSize: "11px", background: "none",
            border: "none", cursor: "pointer", padding: 0,
            transition: "color 150ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--neon-purple)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          {showReasoning ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          {showReasoning ? "Hide" : "Show"} AI reasoning
        </button>

        {showReasoning && (
          <div
            className="animate-fade-in"
            style={{
              marginTop: "10px", padding: "12px 14px", borderRadius: "10px",
              background: "rgba(123,47,255,0.06)",
              borderLeft: "2px solid rgba(123,47,255,0.5)",
              fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.7,
            }}
          >
            {plan.aiReasoning}
          </div>
        )}
      </div>

      {/* ── Channel Selector ─────────────────────── */}
      <div className="glass" style={{ padding: "18px 20px" }}>
        <p className="label-orbitron" style={{ color: "var(--text-muted)", marginBottom: "12px" }}>
          Channel
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
          {CHANNELS.map((ch) => {
            const active = selectedChannel === ch.value;
            return (
              <button
                key={ch.value}
                onClick={() => setSelectedChannel(ch.value)}
                style={{
                  padding: "10px 6px", borderRadius: "10px",
                  background: active ? `rgba(0,0,0,0.3)` : "rgba(0,0,0,0.2)",
                  border: `1px solid ${active ? ch.neon + "50" : "rgba(0,212,255,0.08)"}`,
                  boxShadow: active ? `0 0 14px ${ch.glow}` : "none",
                  cursor: "pointer", textAlign: "center",
                  transition: "all 0.2s",
                  transform: active ? "translateY(-2px)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.08)";
                }}
              >
                <div style={{ fontSize: "20px", marginBottom: "4px" }}>{CHANNEL_ICONS[ch.value]}</div>
                <div style={{
                  fontFamily: "var(--font-heading)", fontSize: "11px", fontWeight: 600,
                  color: active ? ch.neon : "var(--text-secondary)",
                  textShadow: active ? `0 0 8px ${ch.neon}` : "none",
                  marginBottom: "2px",
                }}>
                  {ch.label}
                </div>
                <div style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  {ch.desc}
                </div>
              </button>
            );
          })}
        </div>
        {plan.suggestedChannel !== selectedChannel && (
          <p style={{ marginTop: "10px", fontSize: "11px", color: "var(--text-muted)" }}>
            ℹ AI recommended {CHANNEL_ICONS[plan.suggestedChannel]} {plan.suggestedChannel}
          </p>
        )}
      </div>

      {/* ── Message Variants ─────────────────────── */}
      <div className="glass" style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <p className="label-orbitron" style={{ color: "var(--text-muted)" }}>Message Variants</p>
          <div style={{ display: "flex", gap: "6px" }}>
            {plan.messageVariants.map((v) => {
              const active = selectedVariant === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v.id)}
                  style={{
                    width: "28px", height: "28px", borderRadius: "8px",
                    fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 700,
                    background: active
                      ? "linear-gradient(135deg, var(--neon-blue), var(--neon-violet))"
                      : "rgba(0,212,255,0.06)",
                    color: active ? "white" : "var(--text-muted)",
                    border: `1px solid ${active ? "transparent" : "rgba(0,212,255,0.15)"}`,
                    boxShadow: active ? "0 0 12px rgba(0,212,255,0.4)" : "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {v.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Message bubble */}
        <div style={{
          padding: "14px 16px", borderRadius: "12px",
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(0,212,255,0.12)",
          borderLeft: "2px solid var(--neon-blue)",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <MessageSquare size={14} color="var(--neon-blue)" style={{ marginTop: "2px", flexShrink: 0 }} />
            <p style={{
              color: "var(--text-primary)", fontSize: "13px", lineHeight: 1.7,
              fontFamily: "var(--font-body)",
            }}>
              {activeVariant?.body ?? "No variant available"}
            </p>
          </div>
        </div>

        <p style={{ marginTop: "8px", fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {activeVariant?.body.length ?? 0} chars · [NAME] will be replaced with customer first name
        </p>
      </div>

      {/* ── Launch Button ────────────────────────── */}
      <button
        id="launch-campaign-btn"
        onClick={() => onLaunch(selectedVariant, selectedChannel)}
        disabled={isLaunching || launched || plan.audienceCount === 0}
        style={{
          width: "100%", padding: "16px",
          borderRadius: "12px",
          fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "14px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          border: "none", cursor: isLaunching || launched ? "not-allowed" : "pointer",
          transition: "all 0.25s",
          background: launched
            ? "rgba(0,255,136,0.12)"
            : `linear-gradient(135deg, ${activeChannelInfo.neon}22 0%, rgba(123,47,255,0.25) 100%)`,
          color: launched ? "var(--neon-green)" : activeChannelInfo.neon,
          border: `1px solid ${launched ? "rgba(0,255,136,0.3)" : activeChannelInfo.neon + "50"}`,
          boxShadow: launched ? "none" : `0 0 24px ${activeChannelInfo.glow}, 0 4px 20px rgba(0,0,0,0.4)`,
          textShadow: launched ? "none" : `0 0 8px ${activeChannelInfo.neon}`,
          letterSpacing: "0.02em",
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          if (!isLaunching && !launched) {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${activeChannelInfo.glow}, 0 8px 32px rgba(0,0,0,0.5)`;
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "";
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${activeChannelInfo.glow}, 0 4px 20px rgba(0,0,0,0.4)`;
        }}
      >
        {launched ? (
          <><CheckCircle size={17} /> Campaign Launched!</>
        ) : isLaunching ? (
          <><Loader2 size={17} className="animate-spin" /> Launching Mission…</>
        ) : (
          <>
            <Zap size={17} fill={activeChannelInfo.neon} />
            Launch to {formatNumber(plan.audienceCount)} customers via {CHANNEL_ICONS[selectedChannel]} {selectedChannel}
          </>
        )}
      </button>

      {plan.audienceCount === 0 && (
        <p style={{ textAlign: "center", fontSize: "12px", color: "var(--neon-pink)" }}>
          ⚠ No customers match these filters. Try adjusting the criteria.
        </p>
      )}
    </div>
  );
}
