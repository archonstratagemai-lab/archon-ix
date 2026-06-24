require('dotenv').config();

/**
 * Hardhat configuration for Base Sepolia (chainId 84532)
 * Uses the @nomicfoundation/hardhat-toolbox plugin which bundles ethers,
 * waffle, chai, etc.
 */
module.exports = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    sepoliaBase: {
      // Build the RPC URL from the Alchemy API key if present.
      url:
        process.env.BASE_SEPOLIA_RPC_URL ||
        (process.env.ALCHEMY_API_KEY
          ? `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
          : ''),
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 84532,
    },
  },
  etherscan: {
    // Optional verification on Basescan (Base Sepolia shares same explorer).
    apiKey: process.env.BASESCAN_API_KEY || '',
    customChains: [
      {
        network: 'sepoliaBase',
        chainId: 84532,
        urls: {
          apiURL: 'https://api-sepolia.basescan.org/api',
          browserURL: 'https://sepolia.basescan.org',
        },
      },
    ],
  },
};
