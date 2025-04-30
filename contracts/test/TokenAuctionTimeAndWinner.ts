import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther } from "viem";

describe("TokenAuction Time and Winner Tracking", function () {
  // We define a fixture to reuse the same setup in every test
  async function deployTokenAuctionFixture() {
    const ONE_DAY_IN_SECS = 24 * 60 * 60;
    
    // Contract parameters
    const resourceName = "QR Destination URL";
    const defaultValue = "https://qrcoin.fun";
    
    // Get wallet clients
    const [owner, bidder1, bidder2, bidder3] = await hre.viem.getWalletClients();
    
    // Deploy mock ERC20 token
    const mockToken = await hre.viem.deployContract("MockERC20", [
      "Mock Token", 
      "MTK", 
      parseEther("1000000")
    ]);
    
    // Mint tokens to bidders
    await mockToken.write.mint([bidder1.account.address, parseEther("1000")], { account: owner.account });
    await mockToken.write.mint([bidder2.account.address, parseEther("1000")], { account: owner.account });
    await mockToken.write.mint([bidder3.account.address, parseEther("1000")], { account: owner.account });
    
    // Deploy TokenAuction contract
    const tokenAuction = await hre.viem.deployContract("TokenAuction", [
      mockToken.address,
      resourceName,
      defaultValue
    ]);
    
    // Approve token spending for bidders
    await mockToken.write.approve([tokenAuction.address, parseEther("1000")], { account: bidder1.account });
    await mockToken.write.approve([tokenAuction.address, parseEther("1000")], { account: bidder2.account });
    await mockToken.write.approve([tokenAuction.address, parseEther("1000")], { account: bidder3.account });
    
    // Get public client for reading state
    const publicClient = await hre.viem.getPublicClient();
    
    return {
      tokenAuction,
      mockToken,
      resourceName,
      defaultValue,
      owner,
      bidder1,
      bidder2,
      bidder3,
      publicClient,
      ONE_DAY_IN_SECS
    };
  }

  describe("Time Remaining", function () {
    it("Should return correct time remaining at start of auction", async function () {
      const { tokenAuction, ONE_DAY_IN_SECS } = await loadFixture(deployTokenAuctionFixture);
      
      const timeRemaining = await tokenAuction.read.getTimeRemaining();
      const difference = Number(timeRemaining >= BigInt(ONE_DAY_IN_SECS) ? 
        timeRemaining - BigInt(ONE_DAY_IN_SECS) : 
        BigInt(ONE_DAY_IN_SECS) - timeRemaining);
      expect(difference).to.be.lessThanOrEqual(5); // Allow small deviation due to block time
    });

    it("Should return zero time remaining after auction duration", async function () {
      const { tokenAuction, ONE_DAY_IN_SECS } = await loadFixture(deployTokenAuctionFixture);
      
      // Advance time past auction duration
      await time.increase(BigInt(ONE_DAY_IN_SECS + 1));
      
      const timeRemaining = await tokenAuction.read.getTimeRemaining();
      expect(timeRemaining).to.equal(0n);
    });

    it("Should not allow bids when time remaining is zero", async function () {
      const { tokenAuction, bidder1, ONE_DAY_IN_SECS } = await loadFixture(deployTokenAuctionFixture);
      
      // Advance time past auction duration
      await time.increase(BigInt(ONE_DAY_IN_SECS + 1));
      
      // Try to place a bid
      await expect(
        tokenAuction.write.placeBid([parseEther("10"), "https://example.com"], { account: bidder1.account })
      ).to.be.rejected;
    });
  });

  describe("Last Auction Winner", function () {
    it("Should initialize with zero values for last auction winner", async function () {
      const { tokenAuction } = await loadFixture(deployTokenAuctionFixture);
      
      const [winner, amount, resourceValue] = await tokenAuction.read.getLastAuctionWinner();
      expect(winner).to.equal(getAddress("0x0000000000000000000000000000000000000000"));
      expect(amount).to.equal(0n);
      expect(resourceValue).to.equal("");
    });

    it("Should update last auction winner after successful auction", async function () {
      const { tokenAuction, bidder1, ONE_DAY_IN_SECS, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      // Place a bid
      const bidAmount = parseEther("10");
      const resourceValue = "https://example.com";
      let hash = await tokenAuction.write.placeBid([bidAmount, resourceValue], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Advance time past auction duration
      await time.increase(BigInt(ONE_DAY_IN_SECS + 1));
      
      // Finalize auction
      hash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check last auction winner
      const [winner, amount, value] = await tokenAuction.read.getLastAuctionWinner();
      expect(winner).to.equal(getAddress(bidder1.account.address));
      expect(amount).to.equal(bidAmount);
      expect(value).to.equal(resourceValue);
    });

    it("Should set last auction winner to default values when no bids", async function () {
      const { tokenAuction, ONE_DAY_IN_SECS, defaultValue, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      // Advance time past auction duration
      await time.increase(BigInt(ONE_DAY_IN_SECS + 1));
      
      // Finalize auction
      const hash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check last auction winner
      const [winner, amount, value] = await tokenAuction.read.getLastAuctionWinner();
      expect(winner).to.equal(getAddress("0x0000000000000000000000000000000000000000"));
      expect(amount).to.equal(0n);
      expect(value).to.equal(defaultValue);
    });

    it("Should update last auction winner correctly with multiple auctions", async function () {
      const { tokenAuction, bidder1, bidder2, ONE_DAY_IN_SECS, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      // First auction
      let hash = await tokenAuction.write.placeBid([parseEther("10"), "https://first.com"], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      await time.increase(BigInt(ONE_DAY_IN_SECS + 1));
      hash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Second auction
      hash = await tokenAuction.write.placeBid([parseEther("20"), "https://second.com"], { account: bidder2.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      await time.increase(BigInt(ONE_DAY_IN_SECS + 1));
      hash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check last auction winner (should be from second auction)
      const [winner, amount, value] = await tokenAuction.read.getLastAuctionWinner();
      expect(winner).to.equal(getAddress(bidder2.account.address));
      expect(amount).to.equal(parseEther("20"));
      expect(value).to.equal("https://second.com");
    });
  });
}); 