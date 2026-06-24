/**
 * SponsoredTx – example component that triggers a gas‑less transaction
 * using the `sendGaslessTransaction` helper (ERC‑4337 Paymaster).
 * Adjust the `to` address and calldata to match the actual contract you
 * wish to interact with (e.g., a membership‑mint function).
 */

import React, { useState } from "react";
import { useAccountKit } from "@account-kit/react";
import { sendGaslessTransaction } from "../lib/gasless";

// Example: a dummy contract that mints a membership NFT.
// Replace with the real contract address and calldata.
const MEMBERSHIP_CONTRACT = "0xYourMembershipContractAddress";
const MINT_CALldata = "0x"; // Insert ABI‑encoded function call data.

export const SponsoredTx: React.FC = () => {
  const { isAuthenticated, user } = useAccountKit();
  const [status, setStatus] = useState<string>("");

  const handleMint = async () => {
    if (!isAuthenticated || !user?.address) {
      setStatus("Please sign in first.");
      return;
    }
    setStatus("Preparing transaction…");
    try {
      const receipt = await sendGaslessTransaction({
        from: user.address as any,
        to: MEMBERSHIP_CONTRACT as any,
        data: MINT_CALldata,
        value: "0",
      });
      setStatus(`✅ Transaction sent! Tx hash: ${receipt.transactionHash}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus(`❌ Transaction failed: ${msg}`);
    }
  };

  return (
    <div className="p-4 border rounded bg-gray-50">
      <button
        className="px-4 py-2 bg-green-600 text-white rounded"
        onClick={handleMint}
      >
        Mint Membership (Gas‑less)
      </button>
      {status && <p className="mt-2 text-sm">{status}</p>}
    </div>
  );
};
