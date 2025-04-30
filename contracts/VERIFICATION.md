# TokenAuction Contract Deployment and Verification Guide

This guide explains how to deploy and verify the TokenAuction contract on the Base network.

## Prerequisites

1. Make sure you have the following environment variables set in your `.env` file:
   ```
   BASE_RPC_URL=https://base-rpc.publicnode.com
   PRIVATE_KEY=your_private_key_here
   INITIAL_TOKEN_ADDRESS_FOR_BID=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
   BASESCAN_API_KEY=your_basescan_api_key_here
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Deployment Options

You have two options for deploying the TokenAuction contract:

### Option 1: Deploy using Hardhat Ignition

```
npx hardhat run scripts/deploy-token-auction.ts --network base
```

This script will:
1. Calculate optimal gas prices from the Base network
2. Compile the contract
3. Estimate deployment costs
4. Deploy the contract using Hardhat Ignition
5. Extract the deployed contract address
6. Offer to verify the contract on Basescan

### Option 2: Deploy directly (without Ignition)

```
npx hardhat run scripts/deploy-token-auction-direct.ts --network base
```

This script will:
1. Calculate optimal gas prices from the Base network
2. Compile the contract
3. Estimate gas for deployment with a safety buffer
4. Deploy the contract directly using viem
5. Save deployment information to a file
6. Offer to verify the contract on Basescan immediately after deployment

## Verification

The deployment script includes automatic verification. If verification fails during deployment, you can manually verify the contract using:

```
npx hardhat run scripts/verify-token-auction-improved.ts <contract_address>
```

If you don't provide a contract address, the script will attempt to read it from the deployment files.

### Troubleshooting Verification Issues

If automatic verification fails, you can try these steps:

1. **Check your Basescan API key**: Make sure your `BASESCAN_API_KEY` is correct in the `.env` file.

2. **Manual verification**:
   - Go to https://basescan.org/address/YOUR_CONTRACT_ADDRESS#code
   - Click on "Verify & Publish"
   - Enter contract details:
     - Contract Name: TokenAuction
     - Compiler Version: v0.8.28
     - Open Source License Type: MIT
   - Enter constructor arguments:
     - Token Address: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
     - Resource Name: "QR Destination URL"
     - Default Resource Value: "https://qrcoin.fun"

3. **Verify with encoded constructor arguments**:
   If you need the ABI-encoded constructor arguments, run:
   ```
   npx hardhat run scripts/test-verification.ts
   ```
   This will output the encoded constructor arguments that you can use for manual verification.

## Common Issues

1. **Duplicate Deployment**: The script has been updated to prevent duplicate deployments.

2. **Contract Address Extraction**: If the script can't extract the contract address from the output, it will try to read it from the deployment files.

3. **Node.js Version Warning**: Hardhat shows warnings about Node.js v23.9.0 not being supported. While this doesn't directly cause verification issues, consider using a supported Node.js version for better compatibility.

4. **Verification Failures**: If verification fails with "Unable to verify. Please check if the correct constructor argument was entered", try using the improved verification script or follow the manual verification instructions.