import React, { useEffect } from "react";
import { useAccount } from "wagmi";
import { useStore } from "../lib/store";

interface Props {
  children: React.ReactNode;
}

/**
 * Gates the protected portion of the app on NFT membership. Drives the
 * store-level `verify()` whenever a wallet connects, then renders one
 * of four branches:
 *
 *   - not connected  → blank prompt to connect.
 *   - checking       → "Verifying membership…".
 *   - lastError      → "Couldn't reach Alchemy…" + Retry button that
 *                      calls verify(addr, { force: true }) to bypass the
 *                      5-minute cache in `useStore`.
 *   - !isVerified    → "You do not own …" + acquire-on-OpenSea CTA.
 *   - isVerified     → children.
 *
 * Order matters: `isVerified` is checked BEFORE `lastError` because
 * a successful verify always implies `lastError === undefined`, but the
 * reverse is not true — so reading the verified flag first prevents a
 * stale error from showing on top of a successful unlock.
 */
export const VerificationGate: React.FC<Props> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { isVerified, lastError, checking, verify } = useStore();

  useEffect(() => {
    if (isConnected && address) {
      verify(address);
    }
  }, [isConnected, address]);

  const wrap: React.CSSProperties = {
    padding: "1.5rem 1rem",
    textAlign: "center",
  };
  const lede: React.CSSProperties = {
    margin: "0 auto 0.85rem",
    maxWidth: "32rem",
  };
  const errorDetails: React.CSSProperties = {
    margin: "0 auto 1.1rem",
    maxWidth: "34rem",
    padding: "0.6rem 0.75rem",
    background: "var(--sovereign-navy-deep)",
    border: "1px solid rgba(201, 169, 97, 0.18)",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.78rem",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    color: "var(--text-muted)",
    wordBreak: "break-all",
  };

  if (!isConnected) {
    return (
      <div className="container" style={wrap}>
        Connect your wallet to continue.
      </div>
    );
  }
  if (checking) {
    return (
      <div className="container" style={wrap}>
        Verifying membership…
      </div>
    );
  }
  if (isVerified) {
    return <>{children}</>;
  }
  if (lastError) {
    return (
      <div className="container" style={wrap}>
        <p style={lede}>
          Couldn&rsquo;t reach Alchemy to verify your membership.
        </p>
        <p style={errorDetails} aria-label="verification error details">
          {lastError}
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => address && verify(address, { force: true })}
        >
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="container" style={wrap}>
      <p style={lede}>You do not own an ARCHON‑IX Membership NFT.</p>
      <a
        href="https://opensea.io/collection/archon-ix-membership"
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-secondary"
      >
        Acquire one on OpenSea
      </a>
    </div>
  );
};
