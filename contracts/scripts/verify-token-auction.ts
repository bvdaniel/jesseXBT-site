import { execSync } from "child_process";
import "dotenv/config";
import * as fs from "fs";

/**
 * This script verifies a deployed TokenAuction contract on Basescan
 * It can be used independently after deployment
 */
async function main() {
  console.log("TokenAuction Contract Verification Tool");
  
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
  
  // Try both verification methods
  try {
    console.log("\n--- Attempting verification with direct arguments ---");
    const verifyCommand = `npx hardhat verify --network base ${contractAddress} "${initialTokenAddressForBid}" "QR Destination URL" "https://qrcoin.fun"`;
    console.log(`Executing: ${verifyCommand}`);
    
    try {
      execSync(verifyCommand, { stdio: "inherit" });
      console.log("\n--- Verification Completed Successfully ---");
      return;
    } catch (error) {
      console.error("\n--- Direct verification failed, trying alternative method ---");
      
      // Try with a different format for constructor arguments
      console.log("\n--- Trying verification with constructor-args file ---");
      
      // Create the verify-args.js file
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
      
      const altVerifyCommand = `npx hardhat verify --network base --constructor-args scripts/verify-args.js ${contractAddress}`;
      console.log(`Executing alternative command: ${altVerifyCommand}`);
      execSync(altVerifyCommand, { stdio: "inherit" });
      console.log("\n--- Verification Completed Successfully ---");
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