import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther } from "viem";
import * as fs from "fs";
import * as path from "path";
import { TEST_VALUES } from "./test-config";

describe("TokenAuction Integration Tests", function () {
  // Skip integration tests in CI environments
  const shouldSkipIntegrationTests = process.env.CI === "true";
  
  before(function() {
    if (shouldSkipIntegrationTests) {
      this.skip();
    }
  });
  
  describe("Contract and Ignition Module Integration", function () {
    it("Should have matching constructor parameters", async function () {
      // Read the Ignition module
      const modulePath = path.join(__dirname, "../ignition/modules/TokenAuction.ts");
      const moduleContent = fs.readFileSync(modulePath, "utf8");
      
      // Read the contract
      const contractPath = path.join(__dirname, "../contracts/TokenAuction.sol");
      const contractContent = fs.readFileSync(contractPath, "utf8");
      
      // Check that the contract has constructor parameters that match the module
      expect(contractContent).to.include("constructor(address _biddingToken, string memory _resourceName, string");
      
      // Check that the module passes these parameters
      expect(moduleContent).to.include("biddingTokenAddress");
      expect(moduleContent).to.include("resourceName");
      expect(moduleContent).to.include("defaultResourceValue");
      
      // Check that the module passes these parameters to the contract
      expect(moduleContent).to.include("const tokenAuction = m.contract(\"TokenAuction\", [");
      expect(moduleContent).to.include("biddingTokenAddress");
      expect(moduleContent).to.include("resourceName");
      expect(moduleContent).to.include("defaultResourceValue");
    });
    
    it("Should deploy successfully using parameters from the module", async function () {
      const [owner] = await hre.viem.getWalletClients();
      
      // Get default values from the module
      const modulePath = path.join(__dirname, "../ignition/modules/TokenAuction.ts");
      const moduleContent = fs.readFileSync(modulePath, "utf8");
      
      // Extract default values (simplified approach)
      const defaultTokenAddressMatch = moduleContent.match(/"biddingTokenAddress",\s*"([^"]+)"/);
      const defaultTokenAddress = defaultTokenAddressMatch ? defaultTokenAddressMatch[1] : TEST_VALUES.ZERO_ADDRESS;
      
      const defaultResourceNameMatch = moduleContent.match(/"resourceName",\s*"([^"]+)"/);
      const defaultResourceName = defaultResourceNameMatch ? defaultResourceNameMatch[1] : TEST_VALUES.RESOURCE_NAME;
      
      const defaultResourceValueMatch = moduleContent.match(/"defaultResourceValue",\s*"([^"]+)"/);
      const defaultResourceValue = defaultResourceValueMatch ? defaultResourceValueMatch[1] : TEST_VALUES.DEFAULT_VALUE;
      
      // Deploy mock token to use instead of the default token address
      const mockToken = await hre.viem.deployContract("MockERC20", [
        TEST_VALUES.TOKEN_NAME,
        TEST_VALUES.TOKEN_SYMBOL,
        TEST_VALUES.INITIAL_SUPPLY
      ]);
      
      // Deploy TokenAuction with parameters from the module
      const tokenAuction = await hre.viem.deployContract("TokenAuction", [
        mockToken.address, // Use our mock token instead of the default address
        defaultResourceName,
        defaultResourceValue
      ]);
      
      // Verify deployment was successful
      expect(await tokenAuction.read.owner()).to.not.be.null;
      expect(await tokenAuction.read.biddingToken()).to.equal(getAddress(mockToken.address));
      expect(await tokenAuction.read.resourceName()).to.equal(defaultResourceName);
      expect(await tokenAuction.read.defaultResourceValue()).to.equal(defaultResourceValue);
    });
  });
  
  describe("Deployment Script Integration", function () {
    it("Should have correct parameter handling in deployment script", async function () {
      // Read the deployment script
      const scriptPath = path.join(__dirname, "../scripts/deploy-token-auction.ts");
      const scriptContent = fs.readFileSync(scriptPath, "utf8");
      
      // Check for the parameter object construction and JSON handling
      expect(scriptContent).to.include("const paramObj = {");
      expect(scriptContent).to.include("biddingTokenAddress: initialTokenAddressForBid,");
      expect(scriptContent).to.include("resourceName: \"QR Destination URL\"");
      expect(scriptContent).to.include("defaultResourceValue: \"https://qrcoin.fun\"");
      
      // Check for proper command construction with JSON parameters
      expect(scriptContent).to.include("const command = `npx hardhat ignition deploy ignition/modules/TokenAuction.ts --network base --parameters \"${escapedJson}\"`");
      
      // Check that the script uses environment variables
      expect(scriptContent).to.include("process.env.BASE_RPC_URL");
      expect(scriptContent).to.include("process.env.PRIVATE_KEY");
    });
    
    it("Should use correct gas estimation in deployment script", async function () {
      // Read the deployment script
      const scriptPath = path.join(__dirname, "../scripts/deploy-token-auction.ts");
      const scriptContent = fs.readFileSync(scriptPath, "utf8");
      
      // Check that the script estimates gas correctly
      expect(scriptContent).to.include("const gasPrice = await publicClient.getGasPrice()");
      expect(scriptContent).to.include("const feeData = await publicClient.estimateFeesPerGas()");
      expect(scriptContent).to.include("const maxFeePerGas = feeData.maxFeePerGas || gasPrice");
      expect(scriptContent).to.include("const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || parseGwei(\"0.1\")");
      
      // Check that the script calculates estimated cost
      expect(scriptContent).to.include("const estimatedGasCost = (baseFee + maxPriorityFeePerGas) * gasLimit");
      expect(scriptContent).to.include("console.log(`\\nEstimated deployment cost: ${formatEther(estimatedGasCost)} ETH`);");
    });
  });
  
  describe("End-to-End Flow", function () {
    it("Should support the complete auction lifecycle", async function () {
      const [owner, bidder1, bidder2] = await hre.viem.getWalletClients();
      const publicClient = await hre.viem.getPublicClient();
      
      // 1. Deploy mock token
      const mockToken = await hre.viem.deployContract("MockERC20", [
        TEST_VALUES.TOKEN_NAME,
        TEST_VALUES.TOKEN_SYMBOL,
        TEST_VALUES.INITIAL_SUPPLY
      ]);
      
      // 2. Mint tokens to bidders
      await mockToken.write.mint([bidder1.account.address, parseEther("1000")], { account: owner.account });
      await mockToken.write.mint([bidder2.account.address, parseEther("1000")], { account: owner.account });
      
      // 3. Deploy TokenAuction
      const tokenAuction = await hre.viem.deployContract("TokenAuction", [
        mockToken.address,
        TEST_VALUES.RESOURCE_NAME,
        TEST_VALUES.DEFAULT_VALUE
      ]);
      
      // 4. Approve token spending
      await mockToken.write.approve([tokenAuction.address, parseEther("1000")], { account: bidder1.account });
      await mockToken.write.approve([tokenAuction.address, parseEther("1000")], { account: bidder2.account });
      
      // 5. Place bids
      let hash = await tokenAuction.write.placeBid([parseEther("10"), TEST_VALUES.RESOURCE_VALUE_1], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      hash = await tokenAuction.write.placeBid([parseEther("20"), TEST_VALUES.RESOURCE_VALUE_2], { account: bidder2.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 6. Advance time
      await hre.network.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
      await hre.network.provider.send("evm_mine", []);
      
      // 7. Finalize auction
      hash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash });
      
      // 8. Verify auction ended correctly
      expect(await tokenAuction.read.currentAuctionId()).to.equal(2n);
      
      // 9. Check events
      const auctionEndedEvents = await tokenAuction.getEvents.AuctionEnded() as unknown[];
      expect(auctionEndedEvents).to.have.lengthOf(1);
      
      const auctionEndedEvent = auctionEndedEvents[0] as unknown as { args: { winner: string; amount: bigint; resourceValue: string } };
      expect(auctionEndedEvent.args.winner).to.equal(getAddress(bidder2.account.address));
      expect(auctionEndedEvent.args.amount).to.equal(parseEther("20"));
      expect(auctionEndedEvent.args.resourceValue).to.equal(TEST_VALUES.RESOURCE_VALUE_2);
    });
  });
});