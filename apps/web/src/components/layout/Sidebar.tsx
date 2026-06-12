"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Megaphone, Users, Filter, Zap } from "lucide-react";

const NAV = [
  { href: "/",          icon: LayoutDashboard, label: "Dashboard",  neon: "#00d4ff", glow: "rgba(0,212,255,0.25)"  },
  { href: "/campaigns", icon: Megaphone,        label: "Campaigns",  neon: "#00ff88", glow: "rgba(0,255,136,0.25)"  },
  { href: "/customers", icon: Users,            label: "Customers",  neon: "#00fff5", glow: "rgba(0,255,245,0.25)"  },
  { href: "/segments",  icon: Filter,           label: "Segments",   neon: "#ffb800", glow: "rgba(255,184,0,0.25)"  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "rgba(3,7,16,0.95)",
        borderRight: "1px solid rgba(0,212,255,0.12)",
        position: "relative",
        zIndex: 10,
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Top glow accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.6), rgba(123,47,255,0.4), transparent)",
      }} />

      {/* Vertical neon line */}
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: "1px",
        background: "linear-gradient(180deg, transparent, rgba(0,212,255,0.2) 30%, rgba(123,47,255,0.15) 70%, transparent)",
      }} />

      {/* ── Logo ─────────────────────────────────── */}
      <div style={{ padding: "28px 20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Animated hex logo */}
          <div style={{
            width: 40, height: 40,
            background: "linear-gradient(135deg, #0057ff 0%, #7b2fff 50%, #00d4ff 100%)",
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(0,212,255,0.5), 0 0 40px rgba(123,47,255,0.3)",
            flexShrink: 0,
            animation: "neonBorderPulse 3s ease-in-out infinite",
          }}>
            <Zap size={18} fill="white" color="white" />
          </div>
          <div>
            <p style={{
              fontFamily: "var(--font-display)",
              fontSize: "14px",
              fontWeight: 700,
              color: "#00d4ff",
              letterSpacing: "0.12em",
              textShadow: "0 0 8px rgba(0,212,255,0.8)",
              lineHeight: 1,
            }}>
              EMVO
            </p>
            <p style={{
              fontFamily: "var(--font-display)",
              fontSize: "8px",
              color: "rgba(0,212,255,0.5)",
              letterSpacing: "0.15em",
              marginTop: "3px",
            }}>
              NEXUS · AI CRM
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="divider" style={{ marginTop: "20px" }} />
      </div>

      {/* ── Nav label ─────────────────────────────── */}
      <div style={{ padding: "0 20px 10px" }}>
        <p className="label-orbitron" style={{ color: "var(--text-muted)" }}>Navigation</p>
      </div>

      {/* ── Nav Items ─────────────────────────────── */}
      <nav style={{ flex: 1, padding: "0 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {NAV.map(({ href, icon: Icon, label, neon, glow }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "11px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    background: active ? `rgba(0,212,255,0.06)` : "transparent",
                    border: active ? `1px solid ${neon}30` : "1px solid transparent",
                    boxShadow: active ? `0 0 12px ${glow}, inset 0 0 8px rgba(0,212,255,0.03)` : "none",
                    transition: "all 0.2s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.04)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                    }
                  }}
                >
                  {/* Active left bar */}
                  {active && (
                    <div style={{
                      position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                      width: 3, height: "60%", borderRadius: "0 3px 3px 0",
                      background: neon,
                      boxShadow: `0 0 8px ${neon}, 0 0 16px ${neon}`,
                    }} />
                  )}

                  {/* Icon box */}
                  <div style={{
                    width: 30, height: 30, borderRadius: "8px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: active ? `rgba(0,212,255,0.1)` : "rgba(255,255,255,0.03)",
                    border: active ? `1px solid ${neon}40` : "1px solid rgba(255,255,255,0.05)",
                    boxShadow: active ? `0 0 8px ${glow}` : "none",
                    flexShrink: 0,
                  }}>
                    <Icon size={13} color={active ? neon : "#3d6080"} />
                  </div>

                  <span style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "13px",
                    fontWeight: active ? 600 : 400,
                    color: active ? neon : "var(--text-secondary)",
                    textShadow: active ? `0 0 8px ${neon}80` : "none",
                  }}>
                    {label}
                  </span>

                  {/* Active dot */}
                  {active && (
                    <div style={{
                      marginLeft: "auto", width: 5, height: 5, borderRadius: "50%",
                      background: neon,
                      boxShadow: `0 0 6px ${neon}`,
                      animation: "dotLive 1.5s ease-in-out infinite",
                    }} />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── AI Status ─────────────────────────────── */}
      <div style={{ padding: "16px 16px 28px" }}>
        <div style={{
          padding: "14px",
          background: "rgba(0,212,255,0.04)",
          border: "1px solid rgba(0,212,255,0.15)",
          borderRadius: "12px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Corner decorations */}
          <div className="corner-tl" />
          <div className="corner-tr" />
          <div className="corner-bl" />
          <div className="corner-br" />

          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <div className="dot dot-green" style={{ marginTop: "2px", flexShrink: 0 }} />
            <div>
              <p className="label-orbitron" style={{ color: "var(--neon-green)", marginBottom: "3px" }}>
                AI Online
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "11px", lineHeight: 1.5 }}>
                GPT-4o-mini · Ready
              </p>
            </div>
          </div>
        </div>

        {/* Version tag */}
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: "9px",
          color: "var(--text-faint)", textAlign: "center", marginTop: "10px",
          letterSpacing: "0.1em",
        }}>
          v1.0.0 · XENO 2026
        </p>
      </div>
    </aside>
  );
}
