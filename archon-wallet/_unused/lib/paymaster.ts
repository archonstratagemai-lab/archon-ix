/**
 * Paymaster configuration for Alchemy's ERC‑4337 gas‑sponsorship.
 * The `policyId` should correspond to a Paymaster policy created in the
 * Alchemy dashboard. This config will be consumed by the Account Kit client –
 * it tells the bundler which calls are eligible for free gas.
 */

export const paymasterConfig = {
  // Example: "policy_0xabc123..." – replace with your real policy ID.
  // If omitted, no gas sponsorship will be applied.
  policyId: process.env.VITE_ALCHEMY_PAYMASTER_POLICY_ID ?? "",
  // Additional options can be added per Alchemy docs (e.g., `allowedMethods`).
};
