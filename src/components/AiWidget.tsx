import { useState, useRef, useEffect } from "react";

interface Msg {
  role: "bot" | "user";
  text: string;
}

const greetings = [
  "Ask about ARCHON-IX services, tokenomics, or the roadmap.",
  "Type a question or pick a quick reply below.",
];

export default function AiWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: greetings[0] },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    const answer = respond(q);
    setMessages((prev) => [...prev, { role: "user", text: q }, { role: "bot", text: answer }]);
    setInput("");
  };

  return (
    <div className="ai-widget" aria-hidden={!open}>
      <div className="widget-header">
        <span>ARCHON-IX AI</span>
        <button
          className="widget-toggle"
          aria-label={open ? "Close chat" : "Open chat"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "\u00D7" : "\u25B2"}
        </button>
      </div>
      <div className="widget-body">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={`${m.role}-${i}`} className={`message ${m.role}`}>
              {m.text}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label htmlFor="ai-chat-input" className="visually-hidden">
            Type a message
          </label>
          <input
            id="ai-chat-input"
            type="text"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

function respond(q: string): string {
  const lower = q.toLowerCase();

  // Roadmap & Vision
  if (lower.includes("roadmap")) return "2026 Roadmap:\nQ1: Contract deployment & NFT minting on Base.\nQ2: Portal launch with membership gate & service integrations.\nQ3: AI agent orchestration & neural commerce engine.\nQ4: Cross-chain expansion, DAO governance, and Imperial Protocol launch.";
  if (lower.includes("vision") || lower.includes("mission")) return "ARCHON-IX exists to replace chaos with architecture. We build sovereign infrastructure for individuals and entities who refuse to operate within broken systems.";

  // Tokenomics & Governance
  if (lower.includes("token")) return "ARCHON-IX uses a dual-token model:\n• ARCHON — governance token for DAO proposals and voting.\n• ARCHON-SBT — non-transferable soulbound membership token.\nSupply is capped. Distribution is membership-gated. No inflation. No charity.";
  if (lower.includes("governance") || lower.includes("dao")) return "The ARCHON-IX DAO launches Q4 2026. Members vote on proposals via on-chain governance. Voting power scales with tier: Citizen=1, Sovereign=2, Imperial=4, Architect=8 votes.";
  if (lower.includes("tier") || lower.includes("membership")) return "Four tiers:\n◇ Citizen (1) — Portal access, community feed.\n◈ Sovereign (2) — Priority support, strategy sessions.\n◆ Imperial (4) — Advisory, revenue share, governance.\n★ Architect (8) — Full protocol access, treasury rights.";

  // Joining & Access
  if (lower.includes("join") || lower.includes("acquire") || lower.includes("get")) return "To join ARCHON-IX:\n1. Connect a wallet (MetaMask, WalletConnect, or Telegram TON Space).\n2. Acquire an ARCHON-IX Membership NFT (ERC-721 on Base).\n3. The portal verifies your NFT and grants access based on your tier.";
  if (lower.includes("open") || lower.includes("connect")) return "Click 'Connect Wallet' on the main page. Supported: MetaMask, WalletConnect, Coinbase Wallet, and Telegram TON Space via the Mini App.";

  // Services
  if (lower.includes("service")) return "Core services:\n• Strategic Intelligence — AI-powered market analysis.\n• Legacy Architecture — Multi-generational wealth structuring.\n• Sovereign Operations — Privacy-first infrastructure.\n• Token Engineering — Custom tokenomics design.\n• Neural Commerce — AI-driven transaction optimization.\n• Imperial Protocol — End-to-end protocol deployment.";
  if (lower.includes("strategic") || lower.includes("intelligence")) return "Strategic Intelligence: AI-driven market analysis, competitive mapping, and strategic insights tailored to your portfolio and sovereign objectives. Available to Sovereign+ tier.";
  if (lower.includes("legacy")) return "Legacy Architecture: Multi-generational wealth structuring, trust frameworks, digital asset succession planning, and jurisdictional optimization. Available to Imperial+ tier.";
  if (lower.includes("neural") || lower.includes("commerce")) return "Neural Commerce: AI-driven transaction optimization, MEV protection, cross-chain execution routing, and real-time settlement. Available to Imperial+ tier.";
  if (lower.includes("imperial") || lower.includes("protocol")) return "Imperial Protocol: End-to-end protocol deployment, auditing, governance bootstrapping, and ecosystem scaling for sovereign entities. Architect-only.";
  if (lower.includes("sovereign") || lower.includes("operation")) return "Sovereign Operations: Privacy-first infrastructure, decentralized identity management, jurisdictional optimization, and secure communications. Available to Sovereign+.";

  // Technical
  if (lower.includes("chain") || lower.includes("network")) return "Currently deployed on Base (Coinbase L2). Cross-chain expansion planned for Q4 2026. Base was chosen for low gas fees, Ethereum security inheritance, and Alchemy ecosystem alignment.";
  if (lower.includes("contract") || lower.includes("solidity")) return "Membership contract: ArchonMembership.sol (ERC-721 with role-based access on Base). Governance contract: ArchonGovernance.sol (proposal/voting system). Both audited and verified on-chain.";
  if (lower.includes("nft") || lower.includes("erc")) return "ARCHON-IX Membership NFTs are ERC-721 tokens on Base. Each token encodes membership tier, mint timestamp, and metadata URI. Non-transferable SBT variant also available.";
  if (lower.includes("alchemy")) return "ARCHON-IX uses Alchemy for on-chain verification (NFT ownership checks), RPC transport, and real-time event monitoring. The portal reads your wallet's NFT holdings via Alchemy's Token API.";

  // Support & Contact
  if (lower.includes("support") || lower.includes("help")) return "Support channels:\n• In-portal AI receptionist (this widget)\n• Email: contact@archon-ix.io\n• Telegram: t.me/archonix\n• Emergency: Escalate via the Contact section.";
  if (lower.includes("contact")) return "Reach us at contact@archon-ix.io or via Telegram @archonix. Partnership inquiries welcome.";

  // About
  if (lower.includes("archon")) return "ARCHON-IX is a sovereign execution layer — a Web3-gated portal for protocol-level operations, strategic intelligence, and legacy architecture. Built on Base. Powered by Alchemy. Verified on-chain.";
  if (lower.includes("koda") || kinetix(lower)) return "Koda Kinetix is the parent enterprise behind ARCHON-IX. 'We do not accept entropy; we architect stability.' Sovereign Code. 2026.";

  // Fun
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) return "Welcome to the ARCHON-IX portal. I can help with services, tokenomics, membership, or the roadmap. What do you need?";
  if (lower.includes("thank")) return "Sovereignty is not given. It is architectured. Glad to help.";

  return "Interesting question. This topic is under active development. Check the portal sections for more detail, or contact support@archon-ix.io for specific inquiries.";
}

function kinetix(q: string): boolean {
  return q.includes("kinetix") || q.includes("koda kinetix");
}
