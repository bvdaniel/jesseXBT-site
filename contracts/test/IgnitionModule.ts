import { expect } from "chai";
import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { parseEther, parseGwei } from "viem";

describe("TokenAuction Ignition Module", function () {
  it("Should have correct module structure", function () {
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
    
    // Check for gas configuration
    expect(moduleContent).to.include("maxFeePerGas");
    expect(moduleContent).to.include("maxPriorityFeePerGas");
    
    // Check for contract deployment
    expect(moduleContent).to.include("const tokenAuction = m.contract(\"TokenAuction\"");
    
    // Check for parameter passing
    expect(moduleContent).to.include("biddingTokenAddress");
    expect(moduleContent).to.include("resourceName");
    expect(moduleContent).to.include("defaultResourceValue");
  });

  it("Should have correct default values", function () {
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

  it("Should export the tokenAuction contract", function () {
    // Read the Ignition module
    const modulePath = path.join(__dirname, "../ignition/modules/TokenAuction.ts");
    const moduleContent = fs.readFileSync(modulePath, "utf8");
    
    // Check for export
    expect(moduleContent).to.include("return { tokenAuction }");
  });
  
  it("Should have proper documentation", function () {
    // Read the Ignition module
    const modulePath = path.join(__dirname, "../ignition/modules/TokenAuction.ts");
    const moduleContent = fs.readFileSync(modulePath, "utf8");
    
    // Check for documentation
    expect(moduleContent).to.include("/**");
    expect(moduleContent).to.include("* Ignition Module for deploying the TokenAuction contract");
    expect(moduleContent).to.include("* Example usage:");
    expect(moduleContent).to.include("```");
    expect(moduleContent).to.include("npx hardhat ignition deploy ignition/modules/TokenAuction.ts");
  });
  
  it("Should have parameter overrides", function () {
    // Read the Ignition module
    const modulePath = path.join(__dirname, "../ignition/modules/TokenAuction.ts");
    const moduleContent = fs.readFileSync(modulePath, "utf8");
    
    // Check for parameter overrides
    expect(moduleContent).to.include("m.getParameter(");
    expect(moduleContent).to.include("\"biddingTokenAddress\"");
    expect(moduleContent).to.include("\"resourceName\"");
    expect(moduleContent).to.include("\"defaultResourceValue\"");
    expect(moduleContent).to.include("\"maxFeePerGas\"");
    expect(moduleContent).to.include("\"maxPriorityFeePerGas\"");
  });
});