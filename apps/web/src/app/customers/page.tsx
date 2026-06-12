"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Search, Users, ChevronRight, MapPin, X } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { Customer } from "@/types";

interface CustomersResponse { customers: Customer[]; total: number; page: number; totalPages: number; }

const TAG_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  vip:              { bg: "rgba(255,184,0,0.08)",   color: "#ffb800", border: "rgba(255,184,0,0.2)"   },
  high_value:       { bg: "rgba(0,212,255,0.08)",   color: "#00d4ff", border: "rgba(0,212,255,0.2)"   },
  loyal:            { bg: "rgba(0,255,136,0.08)",   color: "#00ff88", border: "rgba(0,255,136,0.2)"   },
  dormant:          { bg: "rgba(61,96,128,0.12)",   color: "#3d6080", border: "rgba(61,96,128,0.2)"   },
  new_customer:     { bg: "rgba(123,47,255,0.08)",  color: "#a855f7", border: "rgba(123,47,255,0.2)"  },
  one_time_buyer:   { bg: "rgba(247,47,255,0.07)",  color: "#f72fff", border: "rgba(247,47,255,0.15)" },
  repeat_buyer:     { bg: "rgba(0,255,136,0.08)",   color: "#00ff88", border: "rgba(0,255,136,0.2)"   },
  sale_shopper:     { bg: "rgba(255,120,0,0.08)",   color: "#ff7800", border: "rgba(255,120,0,0.2)"   },
  full_price_buyer: { bg: "rgba(0,255,245,0.07)",   color: "#00fff5", border: "rgba(0,255,245,0.15)"  },
  app_user:         { bg: "rgba(0,212,255,0.07)",   color: "#00d4ff", border: "rgba(0,212,255,0.15)"  },
};

const AVATAR_GRADS = [
  "linear-gradient(135deg, #003d5c, #006494, #00d4ff)",
  "linear-gradient(135deg, #1a0050, #3d0088, #7b2fff)",
  "linear-gradient(135deg, #003d26, #006644, #00ff88)",
  "linear-gradient(135deg, #3d2c00, #664a00, #ffb800)",
  "linear-gradient(135deg, #003d3d, #006666, #00fff5)",
  "linear-gradient(135deg, #3d0030, #660050, #f72fff)",
];

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data, isLoading } = useQuery<CustomersResponse>({
    queryKey: ["customers", debouncedSearch, page],
    queryFn: () => fetch(`/api/customers?q=${debouncedSearch}&page=${page}&limit=20`).then((r) => r.json()),
  });

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((window as unknown as { __t?: ReturnType<typeof setTimeout> }).__t);
    (window as unknown as { __t?: ReturnType<typeof setTimeout> }).__t = setTimeout(() => {
      setDebouncedSearch(val); setPage(1);
    }, 350);
  };

  const customers = data?.customers ?? [];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: "var(--space-section)" }}>
        <div className="section-eyebrow">
          <div className="eyebrow-line" style={{ background: "var(--neon-cyan)", boxShadow: "0 0 6px var(--neon-cyan)" }} />
          <span className="label-orbitron" style={{ color: "var(--neon-cyan)" }}>Customer Base</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <h1 className="display-xl gradient-text-neon" style={{ marginBottom: "8px" }}>Shoppers</h1>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
              {data?.total ?? "—"} registered customers · search by name, email, or city
            </p>
          </div>
          <div className="badge badge-blue" style={{ padding: "8px 16px", fontSize: "12px", flexShrink: 0 }}>
            <Users size={13} />
            {data?.total ?? "…"} total
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="animate-fade-up stagger-1" style={{ position: "relative", marginBottom: "24px" }}>
        <Search size={14} style={{
          position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
          color: "var(--text-muted)", pointerEvents: "none",
        }} />
        <input
          id="customer-search"
          type="text"
          placeholder="Search by name, email, or city…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="input"
          style={{ paddingLeft: "46px", paddingRight: search ? "44px" : "16px" }}
        />
        {search && (
          <button onClick={() => handleSearch("")} className="btn-icon"
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, border: "none" }}>
            <X size={12} />
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />)}
        </div>
      ) : customers.length === 0 ? (
        <div className="glass" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px", textAlign: "center" }}>
          <Users size={40} style={{ color: "var(--text-muted)", opacity: 0.3, marginBottom: "16px" }} />
          <p style={{ color: "var(--text-muted)" }}>{search ? `No customers matching "${search}"` : "No customers found."}</p>
        </div>
      ) : (
        <div className="animate-fade-up stagger-2" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {customers.map((customer, i) => (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className="glass group"
              style={{
                display: "flex", alignItems: "center", gap: "16px",
                padding: "14px 20px", textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,255,245,0.25)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px rgba(0,255,245,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--glass-border)";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }}
            >
              {/* Gradient avatar */}
              <div style={{
                width: 42, height: 42, borderRadius: "12px", flexShrink: 0,
                background: AVATAR_GRADS[i % AVATAR_GRADS.length],
                color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              }}>
                {customer.name.charAt(0)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "14px", color: "var(--text-primary)", marginBottom: "3px" }}>
                  {customer.name}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <p className="truncate" style={{ color: "var(--text-muted)", fontSize: "12px" }}>{customer.email}</p>
                  {customer.city && (
                    <span style={{ display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
                      <MapPin size={9} style={{ color: "var(--text-muted)" }} />
                      <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{customer.city}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="hidden md:flex items-center" style={{ gap: "6px", flexShrink: 0 }}>
                {customer.tags.slice(0, 2).map((tag) => {
                  const s = TAG_STYLES[tag] ?? { bg: "rgba(61,96,128,0.1)", color: "var(--text-secondary)", border: "rgba(61,96,128,0.2)" };
                  return (
                    <span key={tag} style={{
                      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                      padding: "3px 9px", borderRadius: "99px",
                      fontSize: "10px", fontWeight: 600, fontFamily: "var(--font-heading)",
                      textShadow: `0 0 6px ${s.color}60`,
                    }}>
                      {tag.replace(/_/g, " ")}
                    </span>
                  );
                })}
              </div>

              {/* Orders */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "14px", color: "var(--neon-blue)", lineHeight: 1, textShadow: "0 0 8px rgba(0,212,255,0.5)" }}>
                  {customer._count?.orders ?? 0}
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "10px", marginTop: "2px" }}>orders</p>
              </div>

              <ChevronRight size={14} className="hover-arrow" style={{ color: "var(--text-muted)", opacity: 0.4, flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(data?.totalPages ?? 1) > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "24px" }} className="animate-fade-up">
          <p style={{ color: "var(--text-muted)", fontSize: "11px" }}>
            Page {page} of {data?.totalPages} · {data?.total} total
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost" style={{ fontSize: "12px" }}>← Prev</button>
            <button onClick={() => setPage((p) => Math.min(data?.totalPages ?? 1, p + 1))} disabled={page >= (data?.totalPages ?? 1)} className="btn btn-ghost" style={{ fontSize: "12px" }}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
