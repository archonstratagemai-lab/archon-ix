import React, { useEffect, useState } from "react";
import { WagmiProvider, useConnect, useAccount } from "wagmi";
import { wagmiConfig } from "./lib/wagmi";
import { tg } from "./lib/telegram";
import { useStore } from "./lib/store";
import { VerificationGate } from "./components/VerificationGate";
import { Header } from "../archon-wallet/components/Header";
import { MiniAppMainButton } from "./components/MiniAppMainButton";
import { MiniApp } from "./components/MiniApp";
import MemberDashboard from "./components/MemberDashboard";
import WalletPortfolio from "./components/WalletPortfolio";
import ContractManager from "./components/ContractManager";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Services from "./components/Services";
import Demo from "./components/Demo";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AiWidget from "./components/AiWidget";
import GhostTracker from "./components/GhostTracker";

function InnerApp() {
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  const { tier, tokenId, mintedAt } = useStore();
  const [activeSection, setActiveSection] = useState<"dashboard" | "services" | "portfolio" | "admin">("dashboard");

  useEffect(() => {
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
        <h1 style={{ marginBottom: "0.25rem" }}>ARCHON&#8209;IX Portal</h1>
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
    <VerificationGate>
      <MiniApp />
      <nav className="portal-nav">
        <div className="container">
          <div className="portal-nav-inner">
            <button
              type="button"
              className={`portal-nav-btn ${activeSection === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveSection("dashboard")}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={`portal-nav-btn ${activeSection === "services" ? "active" : ""}`}
              onClick={() => setActiveSection("services")}
            >
              Services
            </button>
            <button
              type="button"
              className={`portal-nav-btn ${activeSection === "portfolio" ? "active" : ""}`}
              onClick={() => setActiveSection("portfolio")}
            >
              Portfolio
            </button>
            <button
              type="button"
              className={`portal-nav-btn ${activeSection === "admin" ? "active" : ""}`}
              onClick={() => setActiveSection("admin")}
            >
              Admin
            </button>
          </div>
        </div>
      </nav>

      {activeSection === "dashboard" && (
        <>
          <MemberDashboard tier={tier} tokenId={tokenId ?? undefined} mintedAt={mintedAt ?? undefined} />
          <Hero />
          <Stats />
        </>
      )}
      {activeSection === "services" && (
        <>
          <Services />
          <Demo />
          <Contact />
        </>
      )}
      {activeSection === "portfolio" && <WalletPortfolio />}
      {activeSection === "admin" && <ContractManager />}
    </VerificationGate>
  );
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: "var(--sovereign-navy)",
        }}
      >
        <Header />
        <main id="main-content" style={{ flex: 1 }}>
          <InnerApp />
        </main>
        <Footer />
        <AiWidget />
        <GhostTracker />
      </div>
    </WagmiProvider>
  );
}
