import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseGwei } from "viem";

/**
 * Ignition Module for deploying the TokenAuction contract
 *
 * This module defines how to deploy the TokenAuction contract with configurable parameters.
 * All parameters can be overridden when running the deployment.
 *
 * Example usage:
 * ```
 * npx hardhat ignition deploy ignition/modules/TokenAuction.ts --network base --parameters biddingTokenAddress=0x2b5050F01d64FBb3e4Ac44dc07f0732BFb5ecadF,maxFeePerGas=1500000000
 * ```
 */
export default buildModule("TokenAuctionModule", (m) => {
  // Contract parameters with safe defaults
  const biddingTokenAddress = m.getParameter(
    "biddingTokenAddress", 
    "0x2b5050F01d64FBb3e4Ac44dc07f0732BFb5ecadF" // Default QR token address
  );
  
  const resourceName = m.getParameter(
    "resourceName", 
    "QR Destination URL" // Default resource name
  );
  
  const defaultResourceValue = m.getParameter(
    "defaultResourceValue", 
    "https://qrcoin.fun" // Default URL
  );

  // Gas configuration with Base-optimized defaults
  // These can be overridden when deploying without changing this file
  const maxFeePerGas = m.getParameter("maxFeePerGas", parseGwei("1.5")); // 1.5 gwei default for Base
  const maxPriorityFeePerGas = m.getParameter("maxPriorityFeePerGas", parseGwei("0.1")); // 0.1 gwei default for Base

  // Deploy the TokenAuction contract with the specified parameters
  const tokenAuction = m.contract("TokenAuction", [
    biddingTokenAddress,
    resourceName,
    defaultResourceValue
  ]);

  return { tokenAuction };
});