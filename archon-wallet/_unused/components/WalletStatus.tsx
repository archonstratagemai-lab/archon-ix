/**
 * WalletStatus – displays the user's address (shortened) and ETH/USDC balances.
 * Relies on the Alchemy SDK instance exported from `../lib/alchemy`.
 */

import React, { useEffect, useState } from "react";
import { useAccountKit } from "@account-kit/react";
import { alchemy } from "../lib/alchemy";

// USDC contract on Base Mainnet – replace with the correct address if needed.
const USDC_ADDRESS = "0x96c57c83e1d3cb4e969b592bf75d81bd2e511bb9";

export const WalletStatus: React.FC = () => {
  const { isAuthenticated, user } = useAccountKit();
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [usdcBalance, setUsdcBalance] = useState<string>("0");

  useEffect(() => {
    if (!isAuthenticated || !user?.address) return;

    const fetchBalances = async () => {
      try {
        const eth = await alchemy.core.getBalance(user.address);
        setEthBalance(parseFloat(eth.ether).toFixed(4));

        const tokenBal = await alchemy.core.getTokenBalances(user.address, [USDC_ADDRESS]);
        const usdc = tokenBal.tokenBalances[0];
        if (usdc && usdc.tokenBalance) {
          // USDC has 6 decimals.
          const raw = BigInt(usdc.tokenBalance);
          const formatted = Number(raw) / 10 ** 6;
          setUsdcBalance(formatted.toFixed(2));
        } else {
          setUsdcBalance("0");
        }
      } catch (e) {
        console.error("[WalletStatus] balance fetch error", e);
      }
    };
    fetchBalances();
  }, [isAuthenticated, user?.address]);

  if (!isAuthenticated) return null;

  const shortAddr = user?.address
    ? `${user.address.slice(0, 6)}…${user.address.slice(-4)}`
    : "";

  return (
    <div className="flex items-center space-x-4 p-2 bg-gray-50 rounded">
      <span className="font-mono text-sm">{shortAddr}</span>
      <span className="text-sm">{ethBalance} ETH</span>
      <span className="text-sm">{usdcBalance} USDC</span>
    </div>
  );
};
