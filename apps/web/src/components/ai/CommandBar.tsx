"use client";

import { useState, useRef, useCallback } from "react";
import { Loader2, ArrowRight, X, CornerDownLeft } from "lucide-react";
import type { AIPlanResult } from "@/types";

const EXAMPLES = [
  "Win back customers who spent ₹5000+ but haven't purchased in 60 days",
  "Send a loyalty reward to customers with 5+ orders in last 3 months",
  "Re-engage one-time buyers from Mumbai with 10% off",
  "Flash sale for VIP customers active in the last 30 days",
];

interface CommandBarProps {
  onPlanGenerated: (plan: AIPlanResult) => void;
  onClear: () => void;
  hasResult: boolean;
}

export function CommandBar({ onPlanGenerated, onClear, hasResult }: CommandBarProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(async () => {
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate plan");
      onPlanGenerated(data as AIPlanResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [query, isLoading, onPlanGenerated]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSubmit(); }
  };

  const handleClear = () => {
    setQuery(""); setError(null); onClear();
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const borderColor = error ? "rgba(247,47,255,0.5)" : isLoading ? "rgba(0,212,255,0.7)" : isFocused ? "rgba(0,212,255,0.5)" : "rgba(0,212,255,0.15)";
  const boxShadow = isFocused ? "0 0 0 3px rgba(0,212,255,0.08), 0 0 20px rgba(0,212,255,0.12)" : "none";

  return (
    <div>
      {/* Main input */}
      <div style={{
        position: "relative",
        background: "rgba(0,212,255,0.02)",
        border: `1px solid ${borderColor}`,
        borderRadius: "12px",
        boxShadow,
        overflow: "hidden",
        transition: "border-color 150ms, box-shadow 220ms",
      }}>
        {/* Loading neon shimmer bar */}
        {isLoading && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "2px",
            background: "linear-gradient(90deg, transparent, var(--neon-blue), var(--neon-purple), var(--neon-pink), transparent)",
            backgroundSize: "300% 100%",
            animation: "shimmer 1.2s ease-in-out infinite",
          }} />
        )}

        {/* AI icon */}
        <div style={{ position: "absolute", left: "16px", top: "16px" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: isLoading
              ? "linear-gradient(135deg, #0057ff, #7b2fff)"
              : "rgba(0,212,255,0.08)",
            border: `1px solid ${isLoading ? "rgba(0,212,255,0.5)" : "rgba(0,212,255,0.15)"}`,
            boxShadow: isLoading ? "0 0 20px rgba(0,212,255,0.6)" : "none",
            transition: "all 0.3s",
            fontSize: "16px",
          }}>
            {isLoading ? <Loader2 size={14} color="white" className="animate-spin" /> : "🧠"}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={inputRef}
          id="ai-command-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
          placeholder="Describe your campaign objective in plain English..."
          rows={3}
          className="textarea"
          style={{ padding: "18px 155px 18px 58px", color: "var(--text-primary)" }}
        />

        {/* Right actions */}
        <div style={{ position: "absolute", right: "12px", bottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          {(query || hasResult) && !isLoading && (
            <button onClick={handleClear} className="btn btn-icon" style={{ width: 28, height: 28 }}>
              <X size={12} />
            </button>
          )}
          <button
            id="ai-plan-submit"
            onClick={handleSubmit}
            disabled={!query.trim() || isLoading}
            className="btn btn-primary"
            style={{ fontSize: "12px", padding: "8px 16px" }}
          >
            {isLoading ? (
              <><Loader2 size={12} className="animate-spin" /> Processing…</>
            ) : (
              <>Plan <ArrowRight size={12} /></>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="animate-fade-in" style={{ color: "var(--neon-pink)", fontSize: "12px", marginTop: "8px", paddingLeft: "4px" }}>
          ⚠ {error}
        </p>
      )}

      {/* Example prompts */}
      {!hasResult && !isLoading && (
        <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {EXAMPLES.map((q) => (
            <button
              key={q}
              onClick={() => { setQuery(q); setTimeout(() => inputRef.current?.focus(), 0); }}
              style={{
                padding: "5px 12px", borderRadius: "99px",
                background: "rgba(0,212,255,0.04)",
                border: "1px solid rgba(0,212,255,0.1)",
                color: "var(--text-muted)",
                cursor: "pointer", fontSize: "11px",
                fontFamily: "var(--font-body)",
                transition: "all 150ms",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.08)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.3)";
                (e.currentTarget as HTMLElement).style.color = "var(--neon-blue)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 8px rgba(0,212,255,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.04)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.1)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }}
            >
              {q.length > 52 ? q.slice(0, 52) + "…" : q}
            </button>
          ))}
        </div>
      )}

      {/* Hint */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
        <CornerDownLeft size={10} style={{ color: "var(--text-muted)" }} />
        <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
          Press{" "}
          <kbd style={{
            fontFamily: "var(--font-mono)", fontSize: "10px",
            padding: "2px 6px", borderRadius: "5px",
            background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.2)",
            color: "var(--neon-blue)",
          }}>⌘ Enter</kbd>
          {" "}to execute
        </span>
      </div>
    </div>
  );
}
