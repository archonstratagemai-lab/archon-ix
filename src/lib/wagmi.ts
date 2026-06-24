/// <reference types="vite/client" />
import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { injected } from "@wagmi/connectors";

// Wagmi v2 requires connectors to be explicitly declared; `useConnect()`
// in App.tsx reads `connectors[0]`, which would otherwise be `undefined`.
// `injected()` covers MetaMask + the in-app Telegram / TON Space wallets
// that surface as standard EIP-1193 providers.
export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [injected()],
  transports: {
    [base.id]: http(
      `https://base-mainnet.g.alchemy.com/v2/${
        import.meta.env.VITE_ALCHEMY_API_KEY || "demo"
      }`
    ),
  },
});
