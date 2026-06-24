/**
 * Account Kit configuration for ARCHON‑IX Sovereign Wallet.
 * This file creates the AccountKit client, connects it to Alchemy, and
 * configures authentication methods and Paymaster sponsorship.
 */

import { createConfig } from "@account-kit/react";
import { createAlchemyClient } from "../alchemyClient";
import { paymasterConfig } from "./paymaster";

// ----------------------------------------------------------
// Environment helpers – fallback to process.env for Node/SSR.
// ----------------------------------------------------------
const readEnv = (name: string): string =>
  (import.meta?.env?.[name] as string) ?? process.env[name] ?? "";

const alchemyApiKey = readEnv("VITE_ALCHEMY_API_KEY");
const accountKitApiKey = readEnv("VITE_ACCOUNT_KIT_API_KEY"); // Obtain from Alchemy Account Kit
const baseChainId = "eip155:8453"; // Base Mainnet (CAIP‑2)

// ----------------------------------------------------------
// Initialise Alchemy client – used internally by Account Kit.
// ----------------------------------------------------------
const alchemyClient = createAlchemyClient({ apiKey: alchemyApiKey, network: "base" });

// ----------------------------------------------------------
// Export a ready‑to‑use AccountKit configuration.
// ----------------------------------------------------------
export const accountKitConfig = createConfig({
  client: alchemyClient,
  // Authentication connectors we enable.
  connectors: {
    emailOTP: true,
    googleOAuth: true,
    // Passkey support is automatic when the browser/device offers it.
    passkey: true,
  },
  // Chain context for all operations.
  chain: baseChainId,
  // Optional UI theming – we customize via CSS variables in Tailwind.
  theme: {
    // These values will be used by Account Kit's modal styling.
    primary: "#0A1128", // ARCHON‑IX Navy
    secondary: "#C9A961", // ARCHON‑IX Gold
    // You can add more token overrides if needed.
  },
  // Paymaster configuration – sponsor specific actions.
  paymaster: paymasterConfig,
  // API key that identifies the Account Kit project.
  apiKey: accountKitApiKey,
});

// Export for Next.js/React wrappers.
export default accountKitConfig;
