import { execSync } from "child_process";
import { parseGwei, parseEther, formatEther, formatGwei } from "viem";
import { createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import "dotenv/config";
import * as fs from "fs";
import { ethers } from "ethers";
import hre from "hardhat"; // Import Hardhat Runtime Environment

/**
 * This script deploys the TokenAuction contract using hre/viem and verifies it
 */
async function main() {
  console.log("Starting TokenAuction classic deployment and verification...");

  // Compile first to ensure artifacts are available
  console.log("\nCompiling contract...");
  await hre.run('compile'); 
  console.log("Compilation finished.");

  // Check for required environment variables
  if (!process.env.BASE_RPC_URL) {
    throw new Error("BASE_RPC_URL environment variable is required");
  }
  
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is required");
  }

  // Add check for BASESCAN_API_KEY as verification will run automatically
  if (!process.env.BASESCAN_API_KEY) {
    console.warn("WARNING: BASESCAN_API_KEY environment variable is not set. Automatic verification may fail.");
  }

  // Get QR token address from environment or use default
  const initialTokenAddressForBid = process.env.INITIAL_TOKEN_ADDRESS_FOR_BID || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Using USDC on Base
  console.log(`Using bidding token address: ${initialTokenAddressForBid}`);

  // Define constructor arguments (matching verification args)
  const resourceName = "QR Destination URL";
  const defaultResourceValue = "https://qrcoin.fun";

  // We might not need the publicClient or gas calculations explicitly if hre handles it
  // Keeping them for now for potential future use or logging, but deployment might infer them
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL)
  });
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
  console.log(`Deploying from account: ${account.address}`);

  console.log("\nFetching current gas prices (for info)...");
  try {
      const gasPrice = await publicClient.getGasPrice();
      console.log(`Current gas price: ${formatGwei(gasPrice)} gwei`);
      const feeData = await publicClient.estimateFeesPerGas();
      const maxFeePerGas = feeData.maxFeePerGas || gasPrice;
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || parseGwei("0.1");
      console.log(`Max fee per gas: ${formatGwei(maxFeePerGas)} gwei`);
      console.log(`Max priority fee per gas: ${formatGwei(maxPriorityFeePerGas)} gwei`);
  } catch (gasError) {
      console.warn(`Could not fetch gas prices: ${(gasError as Error).message}`);
  }

  // --- Start Classic Deployment ---
  console.log("\n--- Starting Deployment (Classic) ---");
  let contractAddress: string | null = null;
  let deploymentTxHash: string | undefined;

  try {
    console.log(`Deploying TokenAuction with args: [${initialTokenAddressForBid}, "${resourceName}", "${defaultResourceValue}"]`);
    
    // Deploy using hre.viem which handles signer and network
    // Using 'any' type assertion and @ts-ignore to bypass persistent linter issues
    // @ts-ignore - Ignoring persistent type error for deployContract
    const tokenAuction: any = await hre.viem.deployContract("TokenAuction", [
        initialTokenAddressForBid,
        resourceName,
        defaultResourceValue
    ]);

    // Check if deploymentTransaction exists before accessing hash
    deploymentTxHash = tokenAuction.deploymentTransaction?.hash;
    if (deploymentTxHash) {
      console.log(`Deployment transaction sent: ${deploymentTxHash}`);
      console.log("Waiting for deployment confirmation...");
      await tokenAuction.waitForDeployment(); 
      console.log("Deployment confirmed.");
    } else {
      console.error("Deployment transaction object not found!");
      // Attempt to get address anyway, might be available if instance was created differently
    }
        
    contractAddress = tokenAuction.address;
    console.log(`TokenAuction deployed to: ${contractAddress}`);

    if (contractAddress) {
      console.log(`\n--- Deployment Successful ---`);
      console.log(`Contract deployed at: ${contractAddress}`);
      console.log(`\nView on Basescan: https://basescan.org/address/${contractAddress}`);

      // --- Start Integrated Verification Logic (using same args) ---
      console.log("\n--- Starting Automatic Verification ---");
      // Add a small delay before verification
      console.log("Waiting 30 seconds before verification for block explorer indexing...");
      await new Promise(resolve => setTimeout(resolve, 30000)); 

      try {
        console.log("\n--- Creating properly encoded constructor arguments ---");
        // Ensure args match deployment!
        const verifyArgsContent = ` 
module.exports = [
  "${initialTokenAddressForBid}", 
  "${resourceName}",
  "${defaultResourceValue}"
];
        `;
        fs.writeFileSync('scripts/verify-args.js', verifyArgsContent);
        console.log("Created verify-args.js");

        // Encoded args generation (keeping for manual verification instructions)
        const abiCoder = new ethers.AbiCoder();
        const encodedArgs = abiCoder.encode(
          ['address', 'string', 'string'],
          [initialTokenAddressForBid, resourceName, defaultResourceValue]
        );
        console.log("Encoded constructor arguments:", encodedArgs);
        // We don't need encoded-args.txt for hardhat verify --constructor-args
        // fs.writeFileSync('scripts/encoded-args.txt', encodedArgs.slice(2)); 
        // console.log("Created encoded-args.txt"); 

        // Try verification with constructor-args file
        console.log("\n--- Attempting verification with constructor-args file ---");
        const verifyCmdArgs = `npx hardhat verify --network base --constructor-args scripts/verify-args.js ${contractAddress}`;
        console.log(`Executing: ${verifyCmdArgs}`);
        try {
          execSync(verifyCmdArgs, { stdio: "inherit" });
          console.log("\n--- Verification Completed Successfully ---");
        } catch (error) {
          console.error("\n--- Verification attempt failed ---");
          console.error(error); // Log the specific error

          // REMOVED second verification attempt with invalid flag
          
          // Provide manual verification instructions if automatic fails
          console.log("\n--- Automatic Verification Failed ---");
          console.log("Please try manual verification using the details below:");
          console.log("1. Go to https://basescan.org/address/" + contractAddress + "#code");
          console.log("2. Click on 'Verify & Publish'");
          console.log("3. Enter the contract name: TokenAuction");
          console.log("4. Use the following constructor arguments (ensure they match deployment):");
          console.log(`   - Token Address: ${initialTokenAddressForBid}`);
          console.log(`   - Resource Name: \"${resourceName}\"`); 
          console.log(`   - Default Value: \"${defaultResourceValue}\"`);
          console.log("   Or provide the ABI-encoded arguments:");
          console.log("   " + encodedArgs.slice(2));
        }
      } catch (verificationSetupError) {
          console.error("\n--- Error setting up verification files ---");
          console.error(verificationSetupError);
          console.log("Could not prepare files for automatic verification. Please verify manually.");
      }
      // --- End Integrated Verification Logic ---

    } else {
      // This case should ideally not be reached with direct deployment if no error was thrown
      console.log("\n--- Deployment seemingly completed, but contract address is null --- ");
      console.log("Cannot proceed with automatic verification.");
    }

  } catch (error) {
    console.error("\n--- Deployment Failed --- ");
    console.error(error);
    process.exitCode = 1;
  } finally {
    // Clean up temporary verification file if it exists
    if (fs.existsSync('scripts/verify-args.js')) {
      fs.unlinkSync('scripts/verify-args.js');
      console.log("Cleaned up scripts/verify-args.js");
    }
    // No longer creating encoded-args.txt
    // if (fs.existsSync('scripts/encoded-args.txt')) {
    //   fs.unlinkSync('scripts/encoded-args.txt');
    // }
  }
}

// Execute the main function
main().catch((error) => {
  console.error("Unhandled error in main function:", error);
  process.exitCode = 1;
});