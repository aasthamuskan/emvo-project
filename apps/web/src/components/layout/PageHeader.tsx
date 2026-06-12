import React from "react";

interface PageHeaderProps {
  eyebrow?: string;
  eyebrowColor?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ eyebrow, eyebrowColor = "var(--indigo-400)", title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-6 animate-fade-up" style={{ marginBottom: "var(--space-section)" }}>
      <div>
        {eyebrow && (
          <div className="section-eyebrow" style={{ marginBottom: "10px" }}>
            <div className="section-eyebrow-line" style={{ background: eyebrowColor }} />
            <span className="text-label" style={{ color: eyebrowColor, letterSpacing: "0.1em" }}>
              {eyebrow}
            </span>
          </div>
        )}
        <h1 className="display-lg gradient-heading" style={{ marginBottom: subtitle ? "8px" : 0 }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-body" style={{ color: "var(--text-muted)", maxWidth: "480px" }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 flex-shrink-0 pt-1">
          {actions}
        </div>
      )}
    </div>
  );
}
