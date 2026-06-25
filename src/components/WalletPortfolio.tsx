import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

const TOKENS = [
  { symbol: "ETH", name: "Ethereum", icon: "Ξ" },
  { symbol: "USDC", name: "USD Coin", icon: "$" },
  { symbol: "ARCHON", name: "ARCHON", icon: "★" },
];

interface TokenBalance {
  symbol: string;
  balance: string;
  value: string;
}

export default function WalletPortfolio() {
  const { address } = useAccount();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    // Simulated portfolio data — in production, fetch from Alchemy/JSON-RPC
    const timer = setTimeout(() => {
      setBalances([
        { symbol: "ETH", balance: "0.4821", value: "$1,248.50" },
        { symbol: "USDC", balance: "2,350.00", value: "$2,350.00" },
        { symbol: "ARCHON", balance: "—", value: "Membership NFT" },
      ]);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [address]);

  if (!address) return null;

  const shortAddr = `${address.slice(0, 6)}…${address.slice(-4)}`;

  return (
    <section className="portfolio">
      <div className="container">
        <h2>Portfolio</h2>
        <div className="portfolio-card">
          <div className="portfolio-header">
            <span className="mono">{shortAddr}</span>
            <span className="portfolio-chain">Base Mainnet</span>
          </div>

          {loading ? (
            <div className="portfolio-loading">Loading balances…</div>
          ) : (
            <div className="token-list">
              {TOKENS.map((t) => {
                const bal = balances.find((b) => b.symbol === t.symbol);
                return (
                  <div className="token-row" key={t.symbol}>
                    <div className="token-icon">{t.icon}</div>
                    <div className="token-info">
                      <span className="token-name">{t.name}</span>
                      <span className="token-balance">{bal?.balance ?? "—"}</span>
                    </div>
                    <span className="token-value">{bal?.value ?? "—"}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
