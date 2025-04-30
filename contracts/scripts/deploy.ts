import { execSync } from "child_process";
import { parseGwei, parseEther, formatEther, formatGwei } from "viem";
import { createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import "dotenv/config";

/**
 * This script demonstrates how to deploy using Ignition with automatically calculated gas prices
 * It uses viem to fetch current gas prices and estimate deployment costs
 */
async function main() {
  console.log("Preparing to deploy Lock contract using Ignition with auto gas calculation...");

  // Check for required environment variables
  if (!process.env.BASE_RPC_URL) {
    throw new Error("BASE_RPC_URL environment variable is required");
  }
  
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is required");
  }

  // Create viem client
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL)
  });

  // Create account from private key
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

  // Calculate unlock time (30 days from now)
  const unlockTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  console.log(`Setting unlock time to: ${new Date(unlockTime * 1000).toISOString()}`);

  // Set locked amount (0.001 ETH by default)
  const lockedAmount = parseEther("0.001");
  
  console.log("\nFetching current gas prices from Base network...");
  
  // Fetch current gas prices from the network
  const gasPrice = await publicClient.getGasPrice();
  console.log(`Current gas price: ${formatGwei(gasPrice)} gwei`);
  
  // Get fee data for EIP-1559 transactions
  const feeData = await publicClient.estimateFeesPerGas();
  
  // Use the fetched gas prices or fallback to defaults
  const maxFeePerGas = feeData.maxFeePerGas || gasPrice;
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || parseGwei("0.1");
  
  console.log(`Max fee per gas: ${formatGwei(maxFeePerGas)} gwei`);
  console.log(`Max priority fee per gas: ${formatGwei(maxPriorityFeePerGas)} gwei`);

  // Compile the contract to ensure we have the artifacts
  console.log("\nCompiling contract...");
  execSync("npx hardhat compile", { stdio: "inherit" });
  
  // Use a conservative gas estimate for the Lock contract
  // The Lock contract is relatively simple, so 300,000 gas should be more than enough
  const gasLimit = BigInt(300000);
  console.log(`Using gas limit: ${gasLimit}`);
  
  // Calculate the estimated cost of deployment
  const baseFee = maxFeePerGas - maxPriorityFeePerGas;
  const estimatedGasCost = (baseFee + maxPriorityFeePerGas) * gasLimit;
  const estimatedTotalCost = estimatedGasCost + lockedAmount;
  
  console.log(`\nEstimated deployment cost: ${formatEther(estimatedTotalCost)} ETH`);
  console.log(`- Gas cost: ${formatEther(estimatedGasCost)} ETH`);
  console.log(`- Locked amount: ${formatEther(lockedAmount)} ETH`);

  // Format parameters for Ignition command
  const parameters = [
    `unlockTime=${unlockTime}`,
    `maxFeePerGas=${maxFeePerGas}`,
    `maxPriorityFeePerGas=${maxPriorityFeePerGas}`,
    `gasLimit=${gasLimit}`,
    `lockedAmount=${lockedAmount}`
  ].join(",");

  // Build the Ignition deploy command
  const command = `npx hardhat ignition deploy ignition/modules/Lock.ts --network base --parameters ${parameters}`;
  
  console.log("\nExecuting Ignition deployment with command:");
  console.log(command);
  
  // Ask for confirmation before proceeding
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise<void>((resolve) => {
    readline.question("\nProceed with deployment? (y/n): ", (answer: string) => {
      readline.close();
      
      if (answer.toLowerCase() === "y") {
        console.log("\n--- Deployment Output ---");
        
        try {
          // Execute the command
          execSync(command, { stdio: "inherit" });
          console.log("\n--- Deployment Completed Successfully ---");
          resolve();
        } catch (error) {
          console.error("\n--- Deployment Failed ---");
          console.error(error);
          process.exitCode = 1;
          resolve();
        }
      } else {
        console.log("Deployment cancelled");
        resolve();
      }
    });
  });
}

// Execute the main function
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});