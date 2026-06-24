import React from "react";

/**
 * App-shell header strip — Navy/Gold to match the project design system
 * (tokens defined in src/css/style.css). Kept intentionally minimal:
 * the in-page heading inside `InnerApp` carries the actual page label.
 *
 * We deliberately do NOT load `/logo.svg`. The public/ directory does
 * not ship one, and the gold star glyph + wordmark avoids a 404 on
 * the deployed site without dragging in a separate asset through Vite.
 */
export const Header: React.FC = () => {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.85rem",
        padding: "0.85rem 1.25rem",
        background: "var(--sovereign-navy)",
        borderBottom: "1px solid rgba(201, 169, 97, 0.2)",
        color: "var(--text-light)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          color: "var(--architectural-gold)",
          fontSize: "1.05rem",
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        ★
      </span>
      <span
        style={{
          letterSpacing: "0.18em",
          fontSize: "0.95rem",
          fontWeight: 600,
          color: "var(--architectural-gold)",
        }}
      >
        ARCHON‑IX
      </span>
      <span
        style={{
          marginLeft: "auto",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          letterSpacing: "0.05em",
        }}
      >
        Sovereign Circle
      </span>
    </header>
  );
};
