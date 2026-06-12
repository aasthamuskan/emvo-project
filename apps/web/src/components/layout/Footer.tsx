"use client";

import { Zap, Globe, MessageSquare, Link2 } from "lucide-react";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(0,212,255,0.08)",
        padding: "24px 48px",
        background: "rgba(2,4,8,0.9)",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Top neon line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3) 30%, rgba(123,47,255,0.2) 70%, transparent)",
      }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "8px",
            background: "linear-gradient(135deg, #0057ff, #7b2fff)",
            boxShadow: "0 0 12px rgba(0,212,255,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={13} fill="white" color="white" />
          </div>
          <div>
            <p style={{
              fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 700,
              color: "var(--neon-blue)", letterSpacing: "0.12em",
              textShadow: "0 0 8px rgba(0,212,255,0.6)",
            }}>
              EMVO NEXUS
            </p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "8px", color: "rgba(0,212,255,0.4)", letterSpacing: "0.1em" }}>
              AI-NATIVE CRM · XENO 2026
            </p>
          </div>
        </div>

        {/* Center links */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          {[["Dashboard", "/"], ["Campaigns", "/campaigns"], ["Customers", "/customers"], ["Segments", "/segments"]].map(([label, href]) => (
            <a
              key={label}
              href={href}
              style={{
                fontFamily: "var(--font-heading)", fontSize: "11px", fontWeight: 500,
                color: "var(--text-muted)", textDecoration: "none",
                transition: "color 150ms, text-shadow 150ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--neon-blue)";
                e.currentTarget.style.textShadow = "0 0 8px rgba(0,212,255,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.textShadow = "none";
              }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Social icons */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {[
            { Icon: Globe,         title: "Website"  },
            { Icon: MessageSquare, title: "Contact"  },
            { Icon: Link2,         title: "Portfolio" },
          ].map(({ Icon, title }) => (
            <a
              key={title}
              href="#"
              title={title}
              style={{
                width: "30px", height: "30px", borderRadius: "8px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,212,255,0.04)",
                border: "1px solid rgba(0,212,255,0.1)",
                color: "var(--text-muted)",
                textDecoration: "none",
                transition: "all 150ms",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.1)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.4)";
                (e.currentTarget as HTMLElement).style.color = "var(--neon-blue)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 10px rgba(0,212,255,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.04)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.1)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }}
            >
              <Icon size={12} />
            </a>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{
        marginTop: "16px", paddingTop: "14px",
        borderTop: "1px solid rgba(0,212,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px",
      }}>
        <p style={{ color: "var(--text-faint)", fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
          © 2026 EMVO NEXUS · Built for Xeno Engineering Challenge
        </p>
        <div style={{ display: "flex", gap: "16px" }}>
          {["Next.js 15", "Three.js", "GPT-4o-mini", "Neon PostgreSQL", "TypeScript"].map((tech) => (
            <span key={tech} style={{
              fontFamily: "var(--font-mono)", fontSize: "9px",
              color: "var(--text-faint)", letterSpacing: "0.08em",
            }}>
              {tech}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
