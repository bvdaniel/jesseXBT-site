import { execSync } from "child_process";
import "dotenv/config";
import * as fs from "fs";
import { ethers } from "ethers";

/**
 * This script verifies a deployed TokenAuction contract on Basescan
 * It uses ABI encoding to ensure constructor arguments are properly formatted
 */
async function main() {
  console.log("TokenAuction Contract Verification Tool (Improved)");
  
  // Check for required environment variables
  if (!process.env.BASESCAN_API_KEY) {
    console.warn("WARNING: BASESCAN_API_KEY environment variable is not set. Verification may fail.");
  }
  
  // Get contract address from command line or prompt user
  let contractAddress = process.argv[2];
  
  if (!contractAddress) {
    // Try to read from deployment file
    try {
      const deploymentFile = 'ignition/deployments/chain-8453/deployed_addresses.json';
      
      if (fs.existsSync(deploymentFile)) {
        const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
        contractAddress = deploymentData["TokenAuctionModule#TokenAuction"];
        
        if (contractAddress) {
          console.log(`Found contract address in deployment file: ${contractAddress}`);
        }
      }
    } catch (error) {
      console.error("Error reading deployment file:", error);
    }
    
    // If still no address, prompt user
    if (!contractAddress) {
      const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      await new Promise<void>((resolve) => {
        readline.question("Enter the contract address to verify: ", (address: string) => {
          contractAddress = address.trim();
          readline.close();
          resolve();
        });
      });
    }
  }
  
  // Validate contract address
  if (!contractAddress || !contractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error(`Invalid contract address: ${contractAddress}`);
  }
  
  console.log(`\nVerifying TokenAuction contract at address: ${contractAddress}`);
  
  // Get token address from environment or use default
  const initialTokenAddressForBid = process.env.INITIAL_TOKEN_ADDRESS_FOR_BID || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  console.log(`Using initial token address for bid: ${initialTokenAddressForBid}`);
  
  // Check if BASESCAN_API_KEY is set
  console.log(`BASESCAN_API_KEY is ${process.env.BASESCAN_API_KEY ? "set" : "NOT set"}`);
  
  // Create a properly encoded constructor arguments file
  try {
    console.log("\n--- Creating properly encoded constructor arguments ---");
    
    // Create the verify-args.js file with proper encoding
    const verifyArgsContent = `
module.exports = [
  "${initialTokenAddressForBid}",
  "QR Destination URL",
  "https://qrcoin.fun"
];
    `;
    fs.writeFileSync('scripts/verify-args.js', verifyArgsContent);
    console.log("Created verify-args.js with content:");
    console.log(verifyArgsContent);
    
    // Also create a raw encoded version for direct verification
    const abiCoder = new ethers.AbiCoder();
    const encodedArgs = abiCoder.encode(
      ['address', 'string', 'string'],
      [initialTokenAddressForBid, 'QR Destination URL', 'https://qrcoin.fun']
    );
    
    console.log("Encoded constructor arguments:");
    console.log(encodedArgs);
    fs.writeFileSync('scripts/encoded-args.txt', encodedArgs.slice(2)); // Remove 0x prefix
    
    // Try verification with constructor-args file
    console.log("\n--- Attempting verification with constructor-args file ---");
    const verifyCommand = `npx hardhat verify --network base --constructor-args scripts/verify-args.js ${contractAddress}`;
    console.log(`Executing: ${verifyCommand}`);
    
    try {
      execSync(verifyCommand, { stdio: "inherit" });
      console.log("\n--- Verification Completed Successfully ---");
      return;
    } catch (error) {
      console.error("\n--- Constructor-args verification failed, trying with encoded arguments ---");
      
      // Try with encoded arguments
      console.log("\n--- Trying verification with encoded arguments ---");
      const encodedVerifyCommand = `npx hardhat verify --network base --constructor-args-path scripts/encoded-args.txt ${contractAddress}`;
      console.log(`Executing: ${encodedVerifyCommand}`);
      
      try {
        execSync(encodedVerifyCommand, { stdio: "inherit" });
        console.log("\n--- Verification Completed Successfully ---");
        return;
      } catch (encodedError) {
        console.error("\n--- Encoded arguments verification failed, trying manual verification ---");
        
        // Try manual verification through Basescan UI
        console.log("\n--- Instructions for manual verification ---");
        console.log("1. Go to https://basescan.org/address/" + contractAddress + "#code");
        console.log("2. Click on 'Verify & Publish'");
        console.log("3. Enter the contract name: TokenAuction");
        console.log("4. Enter the following constructor arguments (ABI-encoded):");
        console.log(encodedArgs.slice(2));
        
        throw new Error("Automatic verification failed. Please try manual verification.");
      }
    }
  } catch (verifyError) {
    console.error("\n--- Verification Failed ---");
    console.error(verifyError);
    process.exitCode = 1;
  }
}

// Execute the main function
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});