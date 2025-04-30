import { execSync } from "child_process";
import { parseGwei, parseEther, formatEther, formatGwei } from "viem";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import "dotenv/config";
import * as fs from "fs";

// Import the contract artifact
import TokenAuctionArtifact from "../artifacts/contracts/TokenAuction.sol/TokenAuction.json";

/**
 * This script deploys the TokenAuction contract directly (without Ignition)
 * with automatically calculated gas prices and performs verification immediately
 */
async function main() {
  console.log("Preparing to deploy TokenAuction contract directly with auto gas calculation...");

  // Check for required environment variables
  if (!process.env.BASE_RPC_URL) {
    throw new Error("BASE_RPC_URL environment variable is required");
  }
  
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is required");
  }

  // Get QR token address from environment or use default
  const initialTokenAddressForBid = process.env.INITIAL_TOKEN_ADDRESS_FOR_BID || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  console.log(`Using initial token address for bid: ${initialTokenAddressForBid}`);

  // Create viem clients
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL)
  });

  // Create account from private key
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
  
  // Create wallet client
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(process.env.BASE_RPC_URL)
  });
  
  console.log(`Using account: ${account.address}`);
  
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
  
  // Constructor arguments
  const resourceName = "QR Destination URL";
  const defaultResourceValue = "https://qrcoin.fun";
  
  // Prepare contract deployment
  const contractBytecode = TokenAuctionArtifact.bytecode;
  const contractAbi = TokenAuctionArtifact.abi;
  
  // Encode constructor arguments
  const encodedArgs = encodeConstructorArgs(contractAbi, [
    initialTokenAddressForBid,
    resourceName,
    defaultResourceValue
  ]);
  
  // Combine bytecode with encoded constructor arguments
  const deploymentBytecode = contractBytecode + encodedArgs.slice(2); // Remove 0x prefix
  
  // Estimate gas for deployment
  console.log("\nEstimating gas for deployment...");
  const gasEstimate = await publicClient.estimateGas({
    account: account.address,
    data: deploymentBytecode as `0x${string}`,
  });
  
  // Add a buffer to the gas estimate (20%)
  const gasLimit = BigInt(Math.floor(Number(gasEstimate) * 1.2));
  console.log(`Estimated gas: ${gasEstimate}`);
  console.log(`Using gas limit with buffer: ${gasLimit}`);
  
  // Calculate the estimated cost of deployment
  const baseFee = maxFeePerGas - maxPriorityFeePerGas;
  const estimatedGasCost = (baseFee + maxPriorityFeePerGas) * gasLimit;
  
  console.log(`\nEstimated deployment cost: ${formatEther(estimatedGasCost)} ETH`);
  
  // Ask for confirmation before proceeding
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise<void>((resolve) => {
    readline.question("\nProceed with deployment? (y/n): ", async (answer: string) => {
      if (answer.toLowerCase() === "y") {
        console.log("\n--- Starting Deployment ---");
        
        try {
          // Deploy the contract
          console.log("Deploying TokenAuction contract...");
          const txHash = await walletClient.deployContract({
            abi: contractAbi,
            bytecode: contractBytecode as `0x${string}`,
            args: [initialTokenAddressForBid, resourceName, defaultResourceValue],
            gas: gasLimit,
            maxFeePerGas,
            maxPriorityFeePerGas,
          });
          
          console.log(`Transaction hash: ${txHash}`);
          console.log("Waiting for transaction to be mined...");
          
          // Wait for transaction receipt
          const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
          const contractAddress = receipt.contractAddress;
          
          if (!contractAddress) {
            throw new Error("Contract address not found in transaction receipt");
          }
          
          console.log(`\n--- Deployment Completed Successfully ---`);
          console.log(`Contract deployed at: ${contractAddress}`);
          console.log(`\nView on Basescan: https://basescan.org/address/${contractAddress}`);
          
          // Save deployment info to a file
          const deploymentInfo = {
            contractAddress,
            txHash,
            deployedAt: new Date().toISOString(),
            network: "base",
            constructorArgs: {
              biddingTokenAddress: initialTokenAddressForBid,
              resourceName,
              defaultResourceValue
            }
          };
          
          // Create deployments directory if it doesn't exist
          const deploymentsDir = './deployments';
          if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir);
          }
          
          fs.writeFileSync(
            `${deploymentsDir}/TokenAuction-${new Date().toISOString().replace(/:/g, '-')}.json`,
            JSON.stringify(deploymentInfo, null, 2)
          );
          
          // Proceed with verification
          readline.question("\nDo you want to verify the contract on Basescan? (y/n): ", async (verifyAnswer: string) => {
            if (verifyAnswer.toLowerCase() === "y") {
              console.log("\n--- Verifying Contract ---");
              try {
                // Wait a bit for the transaction to be fully processed
                console.log("Waiting a few seconds before verification...");
                await new Promise(r => setTimeout(r, 5000));
                
                // Verify the contract directly
                console.log("\n--- Verifying contract directly ---");
                
                // Check if BASESCAN_API_KEY is set
                if (!process.env.BASESCAN_API_KEY) {
                  console.warn("WARNING: BASESCAN_API_KEY environment variable is not set. Verification may fail.");
                }
                
                try {
                  // Try direct verification first
                  console.log("Attempting verification with direct arguments...");
                  const verifyCommand = `npx hardhat verify --network base ${contractAddress} "${initialTokenAddressForBid}" "${resourceName}" "${defaultResourceValue}"`;
                  console.log(`Executing: ${verifyCommand}`);
                  execSync(verifyCommand, { stdio: "inherit" });
                  console.log("\n--- Verification Completed Successfully ---");
                } catch (error) {
                  console.error("Direct verification failed, trying with constructor-args file...");
                  
                  try {
                    // Create the verify-args.js file
                    const verifyArgsContent = `
module.exports = [
  "${initialTokenAddressForBid}",
  "${resourceName}",
  "${defaultResourceValue}"
];
                    `;
                    fs.writeFileSync('scripts/verify-args.js', verifyArgsContent);
                    console.log("Created verify-args.js with content:");
                    console.log(verifyArgsContent);
                    
                    // Try with constructor-args file
                    const altVerifyCommand = `npx hardhat verify --network base --constructor-args scripts/verify-args.js ${contractAddress}`;
                    console.log(`Executing: ${altVerifyCommand}`);
                    execSync(altVerifyCommand, { stdio: "inherit" });
                    console.log("\n--- Verification Completed Successfully ---");
                  } catch (innerError) {
                    console.error("Constructor-args verification failed, trying with encoded arguments...");
                    
                    try {
                      // Create encoded arguments file
                      const { ethers } = require('ethers');
                      const abiCoder = new ethers.AbiCoder();
                      const encodedArgs = abiCoder.encode(
                        ['address', 'string', 'string'],
                        [initialTokenAddressForBid, resourceName, defaultResourceValue]
                      );
                      
                      fs.writeFileSync('scripts/encoded-args.txt', encodedArgs.slice(2)); // Remove 0x prefix
                      console.log("Created encoded-args.txt with content:");
                      console.log(encodedArgs.slice(2));
                      
                      // Try with encoded arguments
                      const encodedVerifyCommand = `npx hardhat verify --network base --constructor-args-path scripts/encoded-args.txt ${contractAddress}`;
                      console.log(`Executing: ${encodedVerifyCommand}`);
                      execSync(encodedVerifyCommand, { stdio: "inherit" });
                      console.log("\n--- Verification Completed Successfully ---");
                    } catch (finalError) {
                      console.error("\n--- All automatic verification methods failed ---");
                      
                      // Provide manual verification instructions
                      console.log("\n--- Instructions for manual verification ---");
                      console.log("1. Go to https://basescan.org/address/" + contractAddress + "#code");
                      console.log("2. Click on 'Verify & Publish'");
                      console.log("3. Enter the contract name: TokenAuction");
                      console.log("4. Select compiler version: v0.8.28");
                      console.log("5. Select Open Source License Type: MIT");
                      console.log("6. Use the following constructor arguments:");
                      console.log(`   - Token Address: ${initialTokenAddressForBid}`);
                      console.log(`   - Resource Name: "${resourceName}"`);
                      console.log(`   - Default Value: "${defaultResourceValue}"`);
                      
                      // Also provide the ABI-encoded constructor arguments
                      const { ethers } = require('ethers');
                      const abiCoder = new ethers.AbiCoder();
                      const encodedArgs = abiCoder.encode(
                        ['address', 'string', 'string'],
                        [initialTokenAddressForBid, resourceName, defaultResourceValue]
                      );
                      
                      console.log("\n7. Or use these ABI-encoded constructor arguments:");
                      console.log(encodedArgs.slice(2));
                    }
                  }
                }
              } catch (verifyError) {
                console.error("\n--- Verification Failed ---");
                console.error(verifyError);
                
                // Provide manual verification instructions
                console.log("\n--- Instructions for manual verification ---");
                console.log("1. Go to https://basescan.org/address/" + contractAddress + "#code");
                console.log("2. Click on 'Verify & Publish'");
                console.log("3. Enter the contract name: TokenAuction");
                console.log("4. Select compiler version: v0.8.28");
                console.log("5. Select Open Source License Type: MIT");
                console.log("6. Use the following constructor arguments:");
                console.log(`   - Token Address: ${initialTokenAddressForBid}`);
                console.log(`   - Resource Name: "${resourceName}"`);
                console.log(`   - Default Value: "${defaultResourceValue}"`);
                
                // Also provide the ABI-encoded constructor arguments
                const { ethers } = require('ethers');
                const abiCoder = new ethers.AbiCoder();
                const encodedArgs = abiCoder.encode(
                  ['address', 'string', 'string'],
                  [initialTokenAddressForBid, resourceName, defaultResourceValue]
                );
                
                console.log("\n7. Or use these ABI-encoded constructor arguments:");
                console.log(encodedArgs.slice(2));
              }
            }
            
            readline.close();
            resolve();
          });
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

/**
 * Helper function to encode constructor arguments
 */
function encodeConstructorArgs(abi: any[], args: any[]) {
  // Find the constructor ABI
  const constructorAbi = abi.find(item => item.type === 'constructor');
  
  if (!constructorAbi) {
    return '0x';
  }
  
  // Use ethers.js to encode the arguments
  const { ethers } = require('ethers');
  const abiCoder = new ethers.AbiCoder();
  
  // Get the parameter types from the constructor ABI
  const paramTypes = constructorAbi.inputs.map((input: any) => input.type);
  
  // Encode the arguments
  return abiCoder.encode(paramTypes, args);
}

// Execute the main function
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});