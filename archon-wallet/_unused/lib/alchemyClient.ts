/**
 * Simple factory for an Alchemy SDK client used by Account Kit and other
 * wallet‑related calls. It reads the API key from Vite env variables (for the
 * browser) or process.env (for Node/SSR) and defaults to the "demo" key if
 * none is provided – this mirrors the pattern used in the rest of the repo.
 */

import { Alchemy, Network } from "alchemy-sdk";

const readEnv = (name: string): string =>
  // Vite env variables are available via import.meta.env in the browser.
  // In a Node context (Next.js SSR) we fall back to process.env.
  (typeof import.meta !== "undefined" && (import.meta as any).env?.[name]) ??
  process.env[name] ??
  "";

export function createAlchemyClient({ apiKey, network }: { apiKey: string; network: string }) {
  const settings = {
    apiKey: apiKey || "demo",
    // Only Base is needed for this project; the `network` param is retained
    // for future flexibility.
    network: Network.BASE_MAINNET,
  };
  return new Alchemy(settings);
}
