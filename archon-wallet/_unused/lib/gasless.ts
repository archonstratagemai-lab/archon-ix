import type { Address } from "viem";
import { getWalletClient } from "./aa";

/**
 * Send a gasless transaction using Alchemy Wallet APIs (ERC‑4337 Paymaster).
 * This implementation follows the guidance from
 * `@.agents/skills/alchemy-api/references/wallets-wallet-apis.md`.
 *
 * It creates/gets a wallet client for the caller, prepares a user operation,
 * and then sends it through Alchemy's bundler which sponsors the gas.
 *
 * @param from  User address (must be an ERC‑4337 smart‑account compatible).
 * @param to    Destination contract or address.
 * @param data  Hex‑encoded calldata.
 * @param value Optional eth value (in wei, as a string). Defaults to 0.
 * @returns The transaction receipt / hash returned by the bundler.
 */
export async function sendGaslessTransaction({
  from,
  to,
  data,
  value = "0",
}: {
  from: Address;
  to: Address;
  data: string;
  value?: string;
}) {
  // Obtain a Wallet client that knows how to prepare and send calls.
  const client = await getWalletClient(from as `0x${string}`);

  try {
    // Prepare the call – this will sign a user operation and include any
    // Paymaster data if a policy ID is configured on the client.
    const prepared = await client.prepareCall(to as `0x${string}`, value, data);

    // Send the prepared user operation; Alchemy will sponsor the gas.
    const receipt = await client.sendPrepared(prepared);
    return receipt;
  } catch (err) {
    // Propagate a clear error – callers can catch and display.
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[gasless] transaction failed:", msg);
    throw err;
  }
}
