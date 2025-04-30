import { execSync } from "child_process";
import { parseGwei, parseEther, formatEther, formatGwei } from "viem";
import { createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import "dotenv/config";

/**
 * This script deploys the TokenAuction contract using Ignition with automatically calculated gas prices
 * It uses viem to fetch current gas prices and estimate deployment costs
 */
async function main() {
  console.log("Preparing to deploy TokenAuction contract using Ignition with auto gas calculation...");

  // Check for required environment variables
  if (!process.env.BASE_RPC_URL) {
    throw new Error("BASE_RPC_URL environment variable is required");
  }
  
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is required");
  }

  // Get QR token address from environment or use default
  const initialTokenAddressForBid = process.env.INITIAL_TOKEN_ADDRESS_FOR_BID || "0x2b5050F01d64FBb3e4Ac44dc07f0732BFb5ecadF";
  console.log(`Using initial token address for bid: ${initialTokenAddressForBid}`);

  // Create viem client
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL)
  });

  // Create account from private key
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
  
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
  
  // Use a conservative gas estimate for the TokenAuction contract
  // The TokenAuction contract is more complex than Lock, so we use a higher gas limit
  const gasLimit = BigInt(3000000);
  console.log(`Using gas limit: ${gasLimit}`);
  
  // Calculate the estimated cost of deployment
  const baseFee = maxFeePerGas - maxPriorityFeePerGas;
  const estimatedGasCost = (baseFee + maxPriorityFeePerGas) * gasLimit;
  
  console.log(`\nEstimated deployment cost: ${formatEther(estimatedGasCost)} ETH`);

  // Create a JSON object for parameters
  const paramObj = {
    biddingTokenAddress: initialTokenAddressForBid,
    maxFeePerGas: maxFeePerGas.toString(),
    maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
    gasLimit: gasLimit.toString(),
    resourceName: "QR Destination URL",
    defaultResourceValue: "https://qrcoin.fun"
  };

  // Convert to JSON and properly escape for command line
  const escapedJson = JSON.stringify(paramObj).replace(/"/g, '\\"');

  // Build the Ignition deploy command with properly escaped JSON
  // Use a JSON string parameter instead of comma-separated values
  const command = `npx hardhat ignition deploy ignition/modules/TokenAuction.ts --network base --parameters "${escapedJson}"`;
  
  console.log("\nPrepared Ignition deployment command:");
  console.log(command);
  
  // Create a readline interface for user interaction
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise<void>((resolve) => {
    readline.question("\nProceed with deployment? (y/n): ", (answer: string) => {
      // Don't close readline here as we'll need it for verification prompt
      
      if (answer.toLowerCase() === "y") {
        console.log("\n--- Starting Deployment ---");
        
        // Flag to track if we've already deployed
        let alreadyDeployed = false;
        
        try {
          // Execute the command and capture the output
          const output = execSync(command, { stdio: 'pipe' }).toString();
          console.log(output);
          
          // Log the entire output for debugging
          console.log("\n--- DEBUG: Full Ignition Output ---");
          console.log(output);
          
          // Try different regex patterns to extract the contract address
          console.log("\n--- DEBUG: Attempting to extract contract address ---");
          
          // Pattern 1: Look for the standard format
          const addressMatch1 = output.match(/Contract address: (0x[a-fA-F0-9]{40})/);
          console.log("Pattern 1 match:", addressMatch1);
          
          // Pattern 2: Look for Ignition's specific format
          const addressMatch2 = output.match(/TokenAuctionModule#TokenAuction - (0x[a-fA-F0-9]{40})/);
          console.log("Pattern 2 match:", addressMatch2);
          
          // Use the successful match or null if none worked
          const contractAddress = addressMatch1 ? addressMatch1[1] :
                                 addressMatch2 ? addressMatch2[1] : null;
                                 
          console.log("Extracted contract address:", contractAddress);
          
          if (contractAddress) {
            console.log(`\n--- Deployment Completed Successfully ---`);
            console.log(`Contract deployed at: ${contractAddress}`);
            console.log(`\nView on Basescan: https://basescan.org/address/${contractAddress}`);
            
            // Ask if user wants to verify the contract
            // Create a new readline interface for verification
            const verifyReadline = require("readline").createInterface({
              input: process.stdin,
              output: process.stdout
            });
            
            verifyReadline.question("\nDo you want to verify the contract on Basescan? (y/n): ", async (verifyAnswer: string) => {
              verifyReadline.close();
              if (verifyAnswer.toLowerCase() === "y") {
                console.log("\n--- Verifying Contract ---");
                try {
                  // Use the improved verification script
                  console.log("\n--- Running improved verification script ---");
                  try {
                    // Execute the improved verification script with the contract address
                    const verifyCommand = `npx hardhat run scripts/verify-token-auction-improved.ts ${contractAddress}`;
                    console.log(`Executing: ${verifyCommand}`);
                    execSync(verifyCommand, { stdio: "inherit" });
                  } catch (error) {
                    console.error("\n--- Verification Script Error ---");
                    console.error(error);
                    
                    // Provide manual verification instructions
                    console.log("\n--- Instructions for manual verification ---");
                    console.log("1. Go to https://basescan.org/address/" + contractAddress + "#code");
                    console.log("2. Click on 'Verify & Publish'");
                    console.log("3. Enter the contract name: TokenAuction");
                    console.log("4. Use the following constructor arguments:");
                    console.log(`   - Token Address: ${initialTokenAddressForBid}`);
                    console.log(`   - Resource Name: "QR Destination URL"`);
                    console.log(`   - Default Value: "https://qrcoin.fun"`);
                  }
                  console.log("\n--- Verification Completed Successfully ---");
                } catch (verifyError) {
                  console.error("\n--- Verification Failed ---");
                  console.error(verifyError);
                }
              }
              readline.close();
              resolve();
            });
          } else {
            // If we couldn't extract the address from the output, try to get it from the deployment file
            console.log("\n--- Attempting to read contract address from deployment files ---");
            try {
              const fs = require('fs');
              const deploymentFile = 'ignition/deployments/chain-8453/deployed_addresses.json';
              
              if (fs.existsSync(deploymentFile)) {
                const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
                console.log("Deployment data:", deploymentData);
                
                // Extract the most recent TokenAuction contract address
                const tokenAuctionAddress = deploymentData["TokenAuctionModule#TokenAuction"];
                
                if (tokenAuctionAddress) {
                  console.log(`Found contract address in deployment file: ${tokenAuctionAddress}`);
                  
                  // Ask if user wants to verify the contract with this address
                  const verifyReadline = require("readline").createInterface({
                    input: process.stdin,
                    output: process.stdout
                  });
                  
                  verifyReadline.question(`\nDo you want to verify the contract at ${tokenAuctionAddress} on Basescan? (y/n): `, async (verifyAnswer: string) => {
                    verifyReadline.close();
                    
                    if (verifyAnswer.toLowerCase() === "y") {
                      console.log("\n--- Verifying Contract ---");
                      try {
                        // Use the improved verification script
                        console.log("\n--- Running improved verification script ---");
                        const verifyCommand = `npx hardhat run scripts/verify-token-auction-improved.ts ${tokenAuctionAddress}`;
                        console.log(`Executing: ${verifyCommand}`);
                        execSync(verifyCommand, { stdio: "inherit" });
                        console.log("\n--- Verification Completed Successfully ---");
                      } catch (verifyError) {
                        console.error("\n--- Verification Failed ---");
                        console.error(verifyError);
                        
                        // Provide manual verification instructions
                        console.log("\n--- Instructions for manual verification ---");
                        console.log("1. Go to https://basescan.org/address/" + tokenAuctionAddress + "#code");
                        console.log("2. Click on 'Verify & Publish'");
                        console.log("3. Enter the contract name: TokenAuction");
                        console.log("4. Use the following constructor arguments:");
                        console.log(`   - Token Address: ${initialTokenAddressForBid}`);
                        console.log(`   - Resource Name: "QR Destination URL"`);
                        console.log(`   - Default Value: "https://qrcoin.fun"`);
                      }
                    }
                    resolve();
                  });
                  return;
                }
              }
              
              console.log("\n--- Deployment Completed, but couldn't extract contract address ---");
              console.log("Please check the deployment output for the contract address");
              readline.close();
              resolve();
            } catch (error) {
              console.error("\n--- Error reading deployment files ---");
              console.error(error);
              console.log("Please check the deployment output for the contract address");
              readline.close();
              resolve();
            }
          }
        } catch (error) {
          console.error("\n--- Deployment Failed ---");
          console.error(error);
          process.exitCode = 1;
          readline.close();
          resolve();
        }
      } else {
        console.log("Deployment cancelled");
        readline.close();
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