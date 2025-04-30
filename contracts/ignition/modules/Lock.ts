import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseGwei, parseEther } from "viem";

/**
 * Ignition Module for deploying the Lock contract
 *
 * This module defines how to deploy the Lock contract with configurable parameters.
 * All parameters can be overridden when running the deployment.
 *
 * Example usage:
 * ```
 * npx hardhat ignition deploy ignition/modules/Lock.ts --network base --parameters unlockTime=1735689600,maxFeePerGas=50000000000
 * ```
 */
export default buildModule("LockModule", (m) => {
  // Contract parameters with safe defaults
  const unlockTime = m.getParameter("unlockTime", 1893456000); // Default: 1 Jan 2030
  const lockedAmount = m.getParameter("lockedAmount", parseEther("0.001")); // Default: 0.001 ETH (using parseEther for clarity)

  // Gas configuration with Base-optimized defaults
  // These can be overridden when deploying without changing this file
  const gasSettings = {
    // Default gas limit (optional, Ignition will estimate if not provided)
    gasLimit: m.getParameter("gasLimit", 1_000_000),
    
    // EIP-1559 gas settings
    maxFeePerGas: m.getParameter("maxFeePerGas", parseGwei("1.5")), // 1.5 gwei default for Base
    maxPriorityFeePerGas: m.getParameter("maxPriorityFeePerGas", parseGwei("0.1")) // 0.1 gwei default for Base
  };

  // Deploy the Lock contract with the specified parameters and gas settings
  const lock = m.contract("Lock", [unlockTime], {
    value: lockedAmount,
    ...gasSettings
  });

  return { lock };
});
