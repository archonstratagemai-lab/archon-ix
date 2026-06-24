require('dotenv').config();

/**
 * Hardhat configuration for deploying the ArchonMembership ERC-721 NFT
 * on Base Sepolia.
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    baseSepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      chainId: 84532,
      ...(process.env.DEPLOYER_PRIVATE_KEY ? { accounts: [process.env.DEPLOYER_PRIVATE_KEY] } : {}),
    },
    baseMainnet: {
      url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      chainId: 8453,
      ...(process.env.DEPLOYER_PRIVATE_KEY ? { accounts: [process.env.DEPLOYER_PRIVATE_KEY] } : {}),
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY || "",
      baseMainnet: process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
      {
        network: "baseMainnet",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
    ],
  },
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: "0.8.19",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
    ],
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPriceApi: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  },
};
