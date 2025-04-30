import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

import "dotenv/config"; // Import dotenv to load environment variables

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    base: {
      url: process.env.BASE_RPC_URL || "", // Use environment variable for RPC URL
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [], // Use environment variable for private key
      // Note: Base requires careful gas estimation. We'll handle this in the deployment script.
    },
  },
  etherscan: {
    apiKey: {
      // Base Mainnet
      base: process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
    ],
  },
};

export default config;
