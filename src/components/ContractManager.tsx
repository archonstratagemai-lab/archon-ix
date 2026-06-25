import React, { useState } from "react";
import { useAccount } from "wagmi";

const TIER_OPTIONS = ["Citizen", "Sovereign", "Imperial", "Architect"];

export default function ContractManager() {
  const { address } = useAccount();
  const [mintTo, setMintTo] = useState("");
  const [mintTier, setMintTier] = useState(0);
  const [mintUri, setMintUri] = useState("");
  const [status, setStatus] = useState("");
  const [batchAddresses, setBatchAddresses] = useState("");

  const shortAddr = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";

  const handleMint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mintTo) {
      setStatus("Recipient address is required.");
      return;
    }
    // In production: call contract.mint(mintTo, mintTier, mintUri)
    setStatus(`Mint queued: ${TIER_OPTIONS[mintTier]} membership → ${mintTo.slice(0, 10)}…`);
    setMintTo("");
    setMintUri("");
  };

  const handleBatchMint = () => {
    const addrs = batchAddresses.split("\n").map((a) => a.trim()).filter(Boolean);
    if (addrs.length === 0) {
      setStatus("Enter at least one address.");
      return;
    }
    // In production: call contract.batchMint(addrs, tiers, uris)
    setStatus(`Batch mint queued: ${addrs.length}× ${TIER_OPTIONS[mintTier]} memberships`);
    setBatchAddresses("");
  };

  if (!address) return null;

  return (
    <section className="contract-manager">
      <div className="container">
        <h2>Contract Manager</h2>
        <p className="cm-subtitle">Admin operations for the ARCHON-IX Membership contract.</p>

        <div className="cm-grid">
          <div className="cm-card">
            <h3>Mint Membership</h3>
            <form onSubmit={handleMint} className="cm-form">
              <label>
                Recipient Address
                <input
                  type="text"
                  placeholder="0x..."
                  value={mintTo}
                  onChange={(e) => setMintTo(e.target.value)}
                />
              </label>
              <label>
                Tier
                <select value={mintTier} onChange={(e) => setMintTier(Number(e.target.value))}>
                  {TIER_OPTIONS.map((t, i) => (
                    <option key={t} value={i}>{t}</option>
                  ))}
                </select>
              </label>
              <label>
                Metadata URI
                <input
                  type="text"
                  placeholder="ipfs://..."
                  value={mintUri}
                  onChange={(e) => setMintUri(e.target.value)}
                />
              </label>
              <button type="submit" className="btn">Mint</button>
            </form>
          </div>

          <div className="cm-card">
            <h3>Batch Mint</h3>
            <label className="cm-label">
              Addresses (one per line)
              <textarea
                rows={6}
                placeholder={"0xaddr1\n0xaddr2\n0xaddr3"}
                value={batchAddresses}
                onChange={(e) => setBatchAddresses(e.target.value)}
              />
            </label>
            <div className="cm-row">
              <label className="cm-label-inline">
                Tier
                <select value={mintTier} onChange={(e) => setMintTier(Number(e.target.value))}>
                  {TIER_OPTIONS.map((t, i) => (
                    <option key={t} value={i}>{t}</option>
                  ))}
                </select>
              </label>
              <button type="button" className="btn" onClick={handleBatchMint}>Batch Mint</button>
            </div>
          </div>
        </div>

        {status && <div className="cm-status">{status}</div>}
      </div>
    </section>
  );
}
