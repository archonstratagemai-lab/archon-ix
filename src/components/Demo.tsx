import { useState } from "react";

const quickReplies = [
  "What is ARCHON-IX?",
  "How do I join?",
  "Tokenomics overview",
  "Roadmap 2026",
];

const responses: Record<string, string> = {
  "What is ARCHON-IX?":
    "ARCHON-IX is a sovereign execution layer — a Web3-gated portal for strategic intelligence, legacy architecture, and protocol-level operations. Membership is verified via on-chain NFT ownership.",
  "How do I join?":
    "Connect a wallet holding an ARCHON-IX Membership NFT. The gate verifies ownership against the Base chain contract and grants portal access.",
  "Tokenomics overview":
    "The ARCHON-IX ecosystem uses a dual-token model: ARCHON for governance and SBT for non-transferable membership representation. Supply is capped and distribution is membership-gated.",
  "Roadmap 2026":
    "Q1: Contract deployment & NFT minting. Q2: Portal launch & service integrations. Q3: AI agent orchestration. Q4: Cross-chain expansion & DAO formation.",
};

export default function Demo() {
  const [messages, setMessages] = useState<
    { role: "bot" | "user"; text: string }[]
  >([
    {
      role: "bot",
      text: "Welcome to the ARCHON-IX AI receptionist. Select a topic or type a question.",
    },
  ]);

  const handleReply = (text: string) => {
    const answer = responses[text] || "This topic is under development. Check back soon.";
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "bot", text: answer },
    ]);
  };

  return (
    <section className="demo" id="demo">
      <div className="container">
        <h2>AI Receptionist</h2>
        <div className="demo-container">
          {/* Chat panel */}
          <div className="demo-panel">
            <div className="quick-replies">
              {quickReplies.map((qr) => (
                <button
                  key={qr}
                  type="button"
                  className="btn btn-small btn-secondary"
                  onClick={() => handleReply(qr)}
                >
                  {qr}
                </button>
              ))}
            </div>
            <div className="response-output">
              {messages.map((m, i) => (
                <div
                  key={`${m.role}-${i}`}
                  className={`message ${m.role}`}
                >
                  {m.text}
                </div>
              ))}
            </div>
          </div>

          {/* Calculator panel */}
          <div className="demo-panel">
            <h3 style={{ marginBottom: "1rem", color: "var(--architectural-gold)" }}>
              LTV / CAC Calculator
            </h3>
            <LtvCacCalculator />
          </div>
        </div>
      </div>
    </section>
  );
}

function LtvCacCalculator() {
  const [revenue, setRevenue] = useState("");
  const [retention, setRetention] = useState("");
  const [cac, setCac] = useState("");
  const [margin, setMargin] = useState("80");

  const r = parseFloat(revenue) || 0;
  const ret = parseFloat(retention) || 0;
  const c = parseFloat(cac) || 0;
  const m = parseFloat(margin) || 80;

  const ltv = c > 0 ? (r * (m / 100)) / (1 - ret / 100) : 0;
  const ratio = c > 0 ? ltv / c : 0;

  const healthClass =
    ratio >= 3 ? "health-green" : ratio >= 1 ? "health-yellow" : "health-red";
  const healthLabel =
    ratio >= 3 ? "Excellent" : ratio >= 1 ? "Viable" : "Unsustainable";

  return (
    <>
      <form
        id="ltv-cac-form"
        onSubmit={(e) => e.preventDefault()}
      >
        <label>
          Avg Revenue / User ($)
          <input
            type="number"
            placeholder="120"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
          />
        </label>
        <label>
          Monthly Churn (%)
          <input
            type="number"
            placeholder="5"
            value={retention}
            onChange={(e) => setRetention(e.target.value)}
          />
        </label>
        <label>
          Customer Acquisition Cost ($)
          <input
            type="number"
            placeholder="40"
            value={cac}
            onChange={(e) => setCac(e.target.value)}
          />
        </label>
        <label>
          Gross Margin (%)
          <input
            type="number"
            placeholder="80"
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
          />
        </label>
      </form>

      {c > 0 && (
        <div className={`calc-result ${healthClass}`}>
          <div className="calc-row">
            <span>LTV</span>
            <strong>${ltv.toFixed(2)}</strong>
          </div>
          <div className="calc-row">
            <span>CAC</span>
            <strong>${c.toFixed(2)}</strong>
          </div>
          <div className="calc-row ratio">
            <span>LTV:CAC</span>
            <strong>{ratio.toFixed(1)}x</strong>
          </div>
          <span className={`health-badge ${healthClass}`}>{healthLabel}</span>
        </div>
      )}
    </>
  );
}
