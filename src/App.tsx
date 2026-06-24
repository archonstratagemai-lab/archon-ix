import React, { useEffect } from "react";
import { WagmiProvider, useConnect, useAccount } from "wagmi";
import { wagmiConfig } from "./lib/wagmi";
import { tg } from "./lib/telegram";
import { VerificationGate } from "./components/VerificationGate";
import { Header } from "../archon-wallet/components/Header";
import { MiniAppMainButton } from "./components/MiniAppMainButton";
import { MiniApp } from "./components/MiniApp";

function InnerApp() {
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();

  useEffect(() => {
    // Show the Telegram Mini App back button only when we're actually
    // running inside Telegram. The SDK's BackButton.show() throws or
    // silently no-ops in a regular browser, so a try/catch keeps dev
    // mode from spamming the console.
    try {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        window.history.back();
      });
      return () => tg.BackButton.hide();
    } catch {
      return undefined;
    }
  }, []);

  if (!isConnected) {
    return (
      <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: "1rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>ARCHON‑IX Portal</h1>
        <p style={{ color: "var(--text-muted)", maxWidth: 480, textAlign: "center" }}>
          Connect a wallet to verify your Membership NFT and access the sovereign execution layer.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!connectors[0]}
          onClick={() => connectors[0] && connect({ connector: connectors[0] })}
        >
          {connectors[0]?.name ? `Connect ${connectors[0].name}` : "Connect Wallet"}
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBlock: "2rem" }}>
      <VerificationGate>
            {/* Mini App component demonstrating Telegram Mini App integration */}
            <MiniApp />
            {/* Minimal "main portal UI" — the verification gate is the meaningful
                product. Future work can mount richer components here without
                having to revisit the shell. */}
            <h1>Welcome to the ARCHON‑IX Portal</h1>
            <p style={{ color: "var(--text-muted)" }}>
              Membership verified. The sovereign execution layer is open.
            </p>
          </VerificationGate>
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      {/* No Tailwind utilities here on purpose — the project design
          system lives in src/css/style.css. Inline styles cover the few
          flex/min-height primitives the shell needs. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: "var(--sovereign-navy)",
        }}
      >
        <Header />
        <main style={{ flex: 1 }}>
          <InnerApp />
        </main>
      </div>
    </WagmiProvider>
  );
}
