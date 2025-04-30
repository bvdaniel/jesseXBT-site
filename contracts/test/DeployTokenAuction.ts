import { expect } from "chai";
import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { parseEther, parseGwei } from "viem";

describe("TokenAuction Deployment Script", function () {
  // Skip actual deployment tests in CI environments
  const shouldSkipDeploymentTests = process.env.CI === "true";
  
  before(function() {
    if (shouldSkipDeploymentTests) {
      this.skip();
    }
  });
  
  it("Should have correct deployment script structure", function () {
    // Read the deployment script
    const scriptPath = path.join(__dirname, "../scripts/deploy-token-auction.ts");
    const scriptContent = fs.readFileSync(scriptPath, "utf8");
    
    // Check for essential components
    expect(scriptContent).to.include("import { execSync } from \"child_process\"");
    expect(scriptContent).to.include("import { parseGwei, parseEther, formatEther, formatGwei } from \"viem\"");
    expect(scriptContent).to.include("import { createPublicClient, http } from \"viem\"");
    expect(scriptContent).to.include("import { privateKeyToAccount } from \"viem/accounts\"");
    expect(scriptContent).to.include("import { base } from \"viem/chains\"");
    expect(scriptContent).to.include("import \"dotenv/config\"");
    
    // Check for environment variable checks
    expect(scriptContent).to.include("if (!process.env.BASE_RPC_URL)");
    expect(scriptContent).to.include("if (!process.env.PRIVATE_KEY)");
    
    // Check for gas estimation
    expect(scriptContent).to.include("const gasPrice = await publicClient.getGasPrice()");
    expect(scriptContent).to.include("const feeData = await publicClient.estimateFeesPerGas()");
    
    // Check for Ignition deployment
    expect(scriptContent).to.include("npx hardhat ignition deploy ignition/modules/TokenAuction.ts");
  });

  it("Should have correct Ignition module structure", function () {
    // Read the Ignition module
    const modulePath = path.join(__dirname, "../ignition/modules/TokenAuction.ts");
    const moduleContent = fs.readFileSync(modulePath, "utf8");
    
    // Check for essential components
    expect(moduleContent).to.include("import { buildModule } from \"@nomicfoundation/hardhat-ignition/modules\"");
    expect(moduleContent).to.include("export default buildModule(\"TokenAuctionModule\"");
    
    // Check for parameters
    expect(moduleContent).to.include("biddingTokenAddress");
    expect(moduleContent).to.include("resourceName");
    expect(moduleContent).to.include("defaultResourceValue");
    
    // Check for contract deployment
    expect(moduleContent).to.include("const tokenAuction = m.contract(\"TokenAuction\"");
  });
  
  it("Should have correct default values in Ignition module", function () {
    // Read the Ignition module
    const modulePath = path.join(__dirname, "../ignition/modules/TokenAuction.ts");
    const moduleContent = fs.readFileSync(modulePath, "utf8");
    
    // Check for default values
    expect(moduleContent).to.include("\"0x2b5050F01d64FBb3e4Ac44dc07f0732BFb5ecadF\"");
    expect(moduleContent).to.include("\"QR Destination URL\"");
    expect(moduleContent).to.include("\"https://qrcoin.fun\"");
    expect(moduleContent).to.include("parseGwei(\"1.5\")");
    expect(moduleContent).to.include("parseGwei(\"0.1\")");
  });
  
  it("Should export the tokenAuction contract from Ignition module", function () {
    // Read the Ignition module
    const modulePath = path.join(__dirname, "../ignition/modules/TokenAuction.ts");
    const moduleContent = fs.readFileSync(modulePath, "utf8");
    
    // Check for export
    expect(moduleContent).to.include("return { tokenAuction }");
  });
  
  it("Should have correct parameters in deployment script", function () {
    // Read the deployment script
    const scriptPath = path.join(__dirname, "../scripts/deploy-token-auction.ts");
    const scriptContent = fs.readFileSync(scriptPath, "utf8");
    
    // Check for parameters
    expect(scriptContent).to.include("biddingTokenAddress=");
    expect(scriptContent).to.include("maxFeePerGas=");
    expect(scriptContent).to.include("maxPriorityFeePerGas=");
    expect(scriptContent).to.include("resourceName=QR Destination URL");
    expect(scriptContent).to.include("defaultResourceValue=https://qrcoin.fun");
  });
});