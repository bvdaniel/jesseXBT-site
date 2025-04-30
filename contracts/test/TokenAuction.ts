import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther, parseGwei } from "viem";

// Define types for contract structures
type Bid = {
  bidder: string;
  amount: bigint;
  resourceValue: string;
};

type BidPlacedEvent = {
  args: {
    auctionId: bigint;
    bidder: string;
    amount: bigint;
    resourceValue: string;
  };
};

type AuctionEndedEvent = {
  args: {
    auctionId: bigint;
    winner: string;
    amount: bigint;
    resourceValue: string;
  };
};

describe("TokenAuction", function () {
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
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { tokenAuction, owner } = await loadFixture(deployTokenAuctionFixture);
      expect(await tokenAuction.read.owner()).to.equal(getAddress(owner.account.address));
    });
    
    it("Should set the correct bidding token", async function () {
      const { tokenAuction, mockToken } = await loadFixture(deployTokenAuctionFixture);
      expect(await tokenAuction.read.biddingToken()).to.equal(getAddress(mockToken.address));
    });
    
    it("Should set the correct resource name", async function () {
      const { tokenAuction, resourceName } = await loadFixture(deployTokenAuctionFixture);
      expect(await tokenAuction.read.resourceName()).to.equal(resourceName);
    });
    
    it("Should set the correct default resource value", async function () {
      const { tokenAuction, defaultValue } = await loadFixture(deployTokenAuctionFixture);
      expect(await tokenAuction.read.defaultResourceValue()).to.equal(defaultValue);
    });
    
    it("Should start with auction ID 1", async function () {
      const { tokenAuction } = await loadFixture(deployTokenAuctionFixture);
      expect(await tokenAuction.read.currentAuctionId()).to.equal(1n);
    });
    
    it("Should set the auction duration to 1 day", async function () {
      const { tokenAuction, ONE_DAY_IN_SECS } = await loadFixture(deployTokenAuctionFixture);
      expect(await tokenAuction.read.auctionDuration()).to.equal(BigInt(ONE_DAY_IN_SECS));
    });
  });
  
  describe("Bidding", function () {
    it("Should allow placing a bid", async function () {
      const { tokenAuction, bidder1, publicClient } = await loadFixture(deployTokenAuctionFixture);
      const bidAmount = parseEther("10");
      const resourceValue = "https://example.com";
      
      const hash = await tokenAuction.write.placeBid([bidAmount, resourceValue], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check bid was recorded correctly using getter function
      const [bidder, amount, resource] = await tokenAuction.read.getBid([1n]);
      expect(bidder).to.equal(getAddress(bidder1.account.address));
      expect(amount).to.equal(bidAmount);
      expect(resource).to.equal(resourceValue);
      
      // Check event was emitted
      const bidEvents = await tokenAuction.getEvents.BidPlaced() as unknown[];
      expect(bidEvents).to.have.lengthOf(1);
      
      // Use type assertion with unknown first
      const bidEvent = bidEvents[0] as unknown as BidPlacedEvent;
      expect(bidEvent.args.auctionId).to.equal(1n);
      expect(bidEvent.args.bidder).to.equal(getAddress(bidder1.account.address));
      expect(bidEvent.args.amount).to.equal(bidAmount);
      expect(bidEvent.args.resourceValue).to.equal(resourceValue);
    });
    
    it("Should reject bids with empty resource value", async function () {
      const { tokenAuction, bidder1 } = await loadFixture(deployTokenAuctionFixture);
      const bidAmount = parseEther("10");
      
      await expect(
        tokenAuction.write.placeBid([bidAmount, ""], { account: bidder1.account })
      ).to.be.rejected;
    });
    
    it("Should reject bids lower than current highest bid", async function () {
      const { tokenAuction, bidder1, bidder2, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      // Place initial bid
      const hash = await tokenAuction.write.placeBid([parseEther("10"), "https://example.com"], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Try to place lower bid
      await expect(
        tokenAuction.write.placeBid([parseEther("9"), "https://example2.com"], { account: bidder2.account })
      ).to.be.rejected;
    });
    
    it("Should refund previous bidder when outbid", async function () {
      const { tokenAuction, mockToken, bidder1, bidder2, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      // Get initial balances
      const initialBalance1 = await mockToken.read.balanceOf([bidder1.account.address]) as bigint;
      const initialBalance2 = await mockToken.read.balanceOf([bidder2.account.address]) as bigint;
      
      // First bid
      let hash = await tokenAuction.write.placeBid([parseEther("10"), "https://example.com"], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Second bid (higher)
      hash = await tokenAuction.write.placeBid([parseEther("20"), "https://example2.com"], { account: bidder2.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check balances after bidding
      const finalBalance1 = await mockToken.read.balanceOf([bidder1.account.address]) as bigint;
      const finalBalance2 = await mockToken.read.balanceOf([bidder2.account.address]) as bigint;
      
      // Bidder1 should have been refunded
      expect(finalBalance1).to.equal(initialBalance1);
      
      // Bidder2 should have paid 20 ETH
      expect(finalBalance2).to.equal(initialBalance2 - parseEther("20"));
    });
    
    it("Should update bid correctly when same bidder increases their bid", async function () {
      const { tokenAuction, bidder1, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      // First bid
      let hash = await tokenAuction.write.placeBid([parseEther("10"), "https://example.com"], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Same bidder increases bid
      hash = await tokenAuction.write.placeBid([parseEther("20"), "https://example-updated.com"], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check bid was updated correctly using getBid function
      const [bidder, amount, resource] = await tokenAuction.read.getBid([1n]);
      expect(bidder).to.equal(getAddress(bidder1.account.address));
      expect(amount).to.equal(parseEther("20"));
      expect(resource).to.equal("https://example-updated.com");
    });
  });
  
  describe("Auction Finalization", function () {
    it("Should not allow finalizing auction before duration ends", async function () {
      const { tokenAuction } = await loadFixture(deployTokenAuctionFixture);
      
      await expect(tokenAuction.write.finalizeAuction()).to.be.rejected;
    });
    
    it("Should finalize auction with a winner", async function () {
      const { tokenAuction, bidder1, ONE_DAY_IN_SECS, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      // Place a bid
      let hash = await tokenAuction.write.placeBid([parseEther("10"), "https://example.com"], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Advance time past auction duration
      await time.increase(BigInt(ONE_DAY_IN_SECS + 1));
      
      // Finalize auction
      hash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check that a new auction was started
      expect(await tokenAuction.read.currentAuctionId()).to.equal(2n);
      
      // Check event was emitted
      const auctionEndedEvents = await tokenAuction.getEvents.AuctionEnded() as unknown[];
      expect(auctionEndedEvents).to.have.lengthOf(1);
      
      // Use type assertion with unknown first
      const auctionEndedEvent = auctionEndedEvents[0] as unknown as AuctionEndedEvent;
      expect(auctionEndedEvent.args.auctionId).to.equal(1n);
      expect(auctionEndedEvent.args.winner).to.equal(getAddress(bidder1.account.address));
      expect(auctionEndedEvent.args.amount).to.equal(parseEther("10"));
      expect(auctionEndedEvent.args.resourceValue).to.equal("https://example.com");
    });
    
    it("Should finalize auction with no bids", async function () {
      const { tokenAuction, ONE_DAY_IN_SECS, defaultValue, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      // Advance time past auction duration
      await time.increase(BigInt(ONE_DAY_IN_SECS + 1));
      
      // Finalize auction
      const hash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check that a new auction was started
      expect(await tokenAuction.read.currentAuctionId()).to.equal(2n);
      
      // Check event was emitted
      const auctionEndedEvents = await tokenAuction.getEvents.AuctionEnded() as unknown[];
      expect(auctionEndedEvents).to.have.lengthOf(1);
      
      // Use type assertion with unknown first
      const auctionEndedEvent = auctionEndedEvents[0] as unknown as AuctionEndedEvent;
      expect(auctionEndedEvent.args.auctionId).to.equal(1n);
      expect(auctionEndedEvent.args.winner).to.equal("0x0000000000000000000000000000000000000000");
      expect(auctionEndedEvent.args.amount).to.equal(0n);
      expect(auctionEndedEvent.args.resourceValue).to.equal(defaultValue);
    });
    
    it("Should start a new auction after finalization", async function () {
      const { tokenAuction, bidder1, ONE_DAY_IN_SECS, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      // Place a bid
      let hash = await tokenAuction.write.placeBid([parseEther("10"), "https://example.com"], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Advance time past auction duration
      await time.increase(BigInt(ONE_DAY_IN_SECS + 1));
      
      // Finalize auction
      hash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check new auction ID
      expect(await tokenAuction.read.currentAuctionId()).to.equal(2n);
      
      // Check that the new auction has no bids using getBid function
      const [bidder, amount, resource] = await tokenAuction.read.getBid([2n]);
      expect(bidder).to.equal("0x0000000000000000000000000000000000000000");
      expect(amount).to.equal(0n);
    });
  });
  
  describe("Owner Functions", function () {
    it("Should allow owner to set bidding token", async function () {
      const { tokenAuction, owner, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      // Deploy a new token
      const newToken = await hre.viem.deployContract("MockERC20", [
        "New Token", 
        "NTK", 
        parseEther("1000000")
      ]);
      
      // Set new token
      const hash = await tokenAuction.write.setBiddingToken([newToken.address], { account: owner.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check token was updated
      expect(await tokenAuction.read.biddingToken()).to.equal(getAddress(newToken.address));
    });
    
    it("Should not allow non-owner to set bidding token", async function () {
      const { tokenAuction, mockToken, bidder1 } = await loadFixture(deployTokenAuctionFixture);
      
      await expect(
        tokenAuction.write.setBiddingToken([mockToken.address], { account: bidder1.account })
      ).to.be.rejected;
    });
    
    it("Should allow owner to set auction duration", async function () {
      const { tokenAuction, owner, ONE_DAY_IN_SECS, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      const newDuration = BigInt(2 * ONE_DAY_IN_SECS); // 2 days
      const hash = await tokenAuction.write.setAuctionDuration([newDuration], { account: owner.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      expect(await tokenAuction.read.auctionDuration()).to.equal(newDuration);
    });
    
    it("Should not allow non-owner to set auction duration", async function () {
      const { tokenAuction, bidder1, ONE_DAY_IN_SECS } = await loadFixture(deployTokenAuctionFixture);
      
      await expect(
        tokenAuction.write.setAuctionDuration([BigInt(2 * ONE_DAY_IN_SECS)], { account: bidder1.account })
      ).to.be.rejected;
    });
    
    it("Should allow owner to set default resource value", async function () {
      const { tokenAuction, owner, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      const newDefaultValue = "https://newdefault.com";
      const hash = await tokenAuction.write.setDefaultResourceValue([newDefaultValue], { account: owner.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      expect(await tokenAuction.read.defaultResourceValue()).to.equal(newDefaultValue);
    });
    
    it("Should not allow non-owner to set default resource value", async function () {
      const { tokenAuction, bidder1 } = await loadFixture(deployTokenAuctionFixture);
      
      await expect(
        tokenAuction.write.setDefaultResourceValue(["https://newdefault.com"], { account: bidder1.account })
      ).to.be.rejected;
    });
  });
  
  describe("Multiple Auctions", function () {
    it("Should handle multiple auction cycles correctly", async function () {
      const { tokenAuction, bidder1, bidder2, bidder3, ONE_DAY_IN_SECS, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      // First auction
      let hash = await tokenAuction.write.placeBid([parseEther("10"), "https://example1.com"], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Advance time past auction duration
      await time.increase(BigInt(ONE_DAY_IN_SECS + 1));
      
      // Finalize first auction
      hash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Second auction
      hash = await tokenAuction.write.placeBid([parseEther("20"), "https://example2.com"], { account: bidder2.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Advance time past auction duration
      await time.increase(BigInt(ONE_DAY_IN_SECS + 1));
      
      // Finalize second auction
      hash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Third auction
      hash = await tokenAuction.write.placeBid([parseEther("30"), "https://example3.com"], { account: bidder3.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check current auction ID
      expect(await tokenAuction.read.currentAuctionId()).to.equal(3n);
      
      // Check third auction bid using getBid function
      const [bidder, amount, resource] = await tokenAuction.read.getBid([3n]);
      expect(bidder).to.equal(getAddress(bidder3.account.address));
      expect(amount).to.equal(parseEther("30"));
      expect(resource).to.equal("https://example3.com");
    });
  });
});