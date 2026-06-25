import React from "react";
import { useAccount } from "wagmi";

const TIER_INFO = [
  { name: "Citizen", color: "#aab1c2", icon: "◇", perks: ["Portal access", "Community feed", "Monthly briefings"] },
  { name: "Sovereign", color: "#34d399", icon: "◈", perks: ["Priority support", "Strategy sessions", "Early access to launches"] },
  { name: "Imperial", color: "#c9a961", icon: "◆", perks: ["1-on-1 advisory", "Custom tokenomics", "Governance voting", "Revenue share"] },
  { name: "Architect", color: "#e6c878", icon: "★", perks: ["Full protocol access", "Co-architecture rights", "Treasury management", "Custom deployments"] },
];

interface Props {
  tier?: number;
  tokenId?: number;
  mintedAt?: number;
  isActive?: boolean;
}

export default function MemberDashboard({ tier = 0, tokenId, mintedAt, isActive = true }: Props) {
  const { address } = useAccount();
  const shortAddr = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";
  const info = TIER_INFO[tier] || TIER_INFO[0];
  const memberSince = mintedAt
    ? new Date(mintedAt * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "—";

  return (
    <section className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="dashboard-tier-badge" style={{ borderColor: info.color, color: info.color }}>
            <span className="tier-icon">{info.icon}</span>
            <span className="tier-name">{info.name}</span>
          </div>
          <div className="dashboard-status">
            <span className={`status-dot ${isActive ? "active" : "inactive"}`} />
            {isActive ? "Active Member" : "Inactive"}
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dash-card">
            <h3>Identity</h3>
            <div className="dash-field">
              <span className="dash-label">Address</span>
              <span className="dash-value mono">{shortAddr}</span>
            </div>
            <div className="dash-field">
              <span className="dash-label">Token ID</span>
              <span className="dash-value">#{tokenId ?? "—"}</span>
            </div>
            <div className="dash-field">
              <span className="dash-label">Member Since</span>
              <span className="dash-value">{memberSince}</span>
            </div>
          </div>

          <div className="dash-card">
            <h3>Tier Perks</h3>
            <ul className="perk-list">
              {info.perks.map((perk) => (
                <li key={perk} className="perk-item">
                  <span className="perk-check" style={{ color: info.color }}>✓</span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          <div className="dash-card dash-card-wide">
            <h3>Quick Actions</h3>
            <div className="dash-actions">
              <a href="#services" className="btn btn-small">Access Services</a>
              <a href="#demo" className="btn btn-small btn-secondary">AI Receptionist</a>
              <a href="#contact" className="btn btn-small btn-secondary">Support</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
