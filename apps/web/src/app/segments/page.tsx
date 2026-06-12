"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Filter, Plus, ChevronRight, Users } from "lucide-react";
import type { Segment } from "@/types";
import { formatNumber } from "@/lib/utils";

interface SegmentsResponse { segments: Segment[]; }

const NEONS = [
  { border: "#00d4ff", glow: "rgba(0,212,255,0.25)", icon: "rgba(0,212,255,0.08)" },
  { border: "#7b2fff", glow: "rgba(123,47,255,0.25)", icon: "rgba(123,47,255,0.1)"  },
  { border: "#00ff88", glow: "rgba(0,255,136,0.25)", icon: "rgba(0,255,136,0.08)"  },
  { border: "#ffb800", glow: "rgba(255,184,0,0.25)",  icon: "rgba(255,184,0,0.08)"  },
  { border: "#00fff5", glow: "rgba(0,255,245,0.25)",  icon: "rgba(0,255,245,0.08)"  },
  { border: "#f72fff", glow: "rgba(247,47,255,0.25)", icon: "rgba(247,47,255,0.08)" },
];

export default function SegmentsPage() {
  const { data, isLoading } = useQuery<SegmentsResponse>({
    queryKey: ["segments"],
    queryFn: () => fetch("/api/segments").then((r) => r.json()),
  });

  const segments = data?.segments ?? [];
  const totalAudience = segments.reduce((s, sg) => s + (sg.audienceCount ?? sg.audienceSize ?? 0), 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: "var(--space-section)" }}>
        <div className="section-eyebrow">
          <div className="eyebrow-line" style={{ background: "var(--neon-amber)", boxShadow: "0 0 6px var(--neon-amber)" }} />
          <span className="label-orbitron" style={{ color: "var(--neon-amber)" }}>Audience Library</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <h1 className="display-xl gradient-text-neon" style={{ marginBottom: "8px" }}>Segments</h1>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              {segments.length} AI-defined audience segments · {formatNumber(totalAudience)} total reach
            </p>
          </div>
          <Link href="/" className="btn btn-neon-solid" style={{ flexShrink: 0 }}>
            <Plus size={14} /> New Segment
          </Link>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />)}
        </div>
      ) : segments.length === 0 ? (
        <div className="glass" style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "80px", textAlign: "center",
          border: "1px dashed rgba(255,184,0,0.2)",
        }}>
          <div className="animate-float" style={{ fontSize: "48px", marginBottom: "20px", filter: "drop-shadow(0 0 12px rgba(255,184,0,0.5))" }}>⚡</div>
          <h3 className="display-md" style={{ color: "var(--text-secondary)", marginBottom: "10px" }}>No segments defined</h3>
          <p style={{ color: "var(--text-muted)", maxWidth: "300px", lineHeight: 1.8, marginBottom: "24px" }}>
            Use the AI Planner to automatically create audience segments.
          </p>
          <Link href="/" className="btn btn-primary">← Go to AI Planner</Link>
        </div>
      ) : (
        <div
          className="animate-fade-up stagger-1"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}
        >
          {segments.map((segment, i) => {
            const neon = NEONS[i % NEONS.length];
            return (
              <div
                key={segment.id}
                className="glass group"
                style={{
                  padding: "22px",
                  borderTop: `2px solid ${neon.border}`,
                  boxShadow: `0 0 0 0 transparent`,
                  transition: "all 0.25s",
                  animationDelay: `${i * 0.06}s`,
                  position: "relative",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${neon.glow}, 0 8px 32px rgba(0,0,0,0.5)`;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                  (e.currentTarget as HTMLElement).style.transform = "";
                }}
              >
                {/* Corner decorations */}
                <div className="corner-tl" style={{ borderColor: `${neon.border}60` }} />
                <div className="corner-br" style={{ borderColor: `${neon.border}40` }} />

                {/* Icon + Audience */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "12px",
                    background: neon.icon,
                    border: `1px solid ${neon.border}30`,
                    boxShadow: `0 0 12px ${neon.glow}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Filter size={17} color={neon.border} />
                  </div>

                  {(segment.audienceCount ?? segment.audienceSize) != null && (
                    <div style={{ textAlign: "right" }}>
                      <p style={{
                        fontFamily: "var(--font-display)", fontWeight: 700,
                        fontSize: "22px", color: neon.border, lineHeight: 1,
                        textShadow: `0 0 12px ${neon.border}`,
                        letterSpacing: "0.02em",
                      }}>
                        {formatNumber(segment.audienceCount ?? segment.audienceSize ?? 0)}
                      </p>
                      <p style={{ color: "var(--text-muted)", fontSize: "10px", display: "flex", alignItems: "center", gap: "3px", justifyContent: "flex-end", marginTop: "2px" }}>
                        <Users size={9} /> shoppers
                      </p>
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 style={{
                  fontFamily: "var(--font-heading)", fontWeight: 700,
                  fontSize: "15px", color: "var(--text-primary)",
                  marginBottom: "10px", lineHeight: 1.3,
                }}>
                  {segment.name}
                </h3>

                {/* Description */}
                {segment.description && (
                  <p style={{
                    color: "var(--text-secondary)", fontSize: "12px",
                    lineHeight: 1.7, marginBottom: "14px",
                  }}>
                    {segment.description}
                  </p>
                )}

                {/* AI prompt */}
                {segment.filterJson && (
                  <div style={{
                    padding: "10px 14px",
                    background: `rgba(0,0,0,0.3)`,
                    border: `1px solid ${neon.border}20`,
                    borderLeft: `2px solid ${neon.border}`,
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}>
                    <p style={{
                      fontFamily: "var(--font-mono)", fontSize: "10px",
                      color: neon.border, opacity: 0.8,
                      lineHeight: 1.6,
                    }}>
                      {JSON.stringify(segment.filterJson, null, 0).slice(0, 120)}
                      {JSON.stringify(segment.filterJson).length > 120 ? "…" : ""}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <Link
                  href={`/?segment=${segment.id}`}
                  className="btn btn-ghost"
                  style={{ width: "100%", justifyContent: "space-between", fontSize: "12px" }}
                >
                  Target this segment
                  <ChevronRight size={13} className="hover-arrow" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
