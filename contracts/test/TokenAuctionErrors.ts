import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther, zeroAddress } from "viem";
import { TEST_VALUES } from "./test-config";

describe("TokenAuction Error Handling", function () {
  // We define a fixture to reuse the same setup in every test
  async function deployTokenAuctionFixture() {
    const ONE_DAY_IN_SECS = 24 * 60 * 60;
    
    // Get wallet clients
    const [owner, bidder1, bidder2, bidder3] = await hre.viem.getWalletClients();
    
    // Deploy mock ERC20 token
    const mockToken = await hre.viem.deployContract("MockERC20", [
      TEST_VALUES.TOKEN_NAME,
      TEST_VALUES.TOKEN_SYMBOL,
      TEST_VALUES.INITIAL_SUPPLY
    ]);
    
    // Mint tokens to bidders
    await mockToken.write.mint([bidder1.account.address, TEST_VALUES.BIDDER_BALANCE], { account: owner.account });
    await mockToken.write.mint([bidder2.account.address, TEST_VALUES.BIDDER_BALANCE], { account: owner.account });
    await mockToken.write.mint([bidder3.account.address, TEST_VALUES.BIDDER_BALANCE], { account: owner.account });
    
    // Deploy TokenAuction contract
    const tokenAuction = await hre.viem.deployContract("TokenAuction", [
      mockToken.address,
      TEST_VALUES.RESOURCE_NAME,
      TEST_VALUES.DEFAULT_VALUE
    ]);
    
    // Approve token spending for bidders
    await mockToken.write.approve([tokenAuction.address, TEST_VALUES.BIDDER_BALANCE], { account: bidder1.account });
    await mockToken.write.approve([tokenAuction.address, TEST_VALUES.BIDDER_BALANCE], { account: bidder2.account });
    await mockToken.write.approve([tokenAuction.address, TEST_VALUES.BIDDER_BALANCE], { account: bidder3.account });
    
    // Get public client for reading state
    const publicClient = await hre.viem.getPublicClient();
    
    return {
      tokenAuction,
      mockToken,
      owner,
      bidder1,
      bidder2,
      bidder3,
      publicClient,
      ONE_DAY_IN_SECS
    };
  }
  
  describe("Constructor Validation", function () {
    it("Should revert if bidding token is zero address", async function () {
      const [owner] = await hre.viem.getWalletClients();
      
      await expect(
        hre.viem.deployContract("TokenAuction", [
          zeroAddress,
          TEST_VALUES.RESOURCE_NAME,
          TEST_VALUES.DEFAULT_VALUE
        ])
      ).to.be.rejected;
    });
    
    it("Should revert if resource name is empty", async function () {
      const [owner] = await hre.viem.getWalletClients();
      const mockToken = await hre.viem.deployContract("MockERC20", [
        TEST_VALUES.TOKEN_NAME,
        TEST_VALUES.TOKEN_SYMBOL,
        TEST_VALUES.INITIAL_SUPPLY
      ]);
      
      await expect(
        hre.viem.deployContract("TokenAuction", [
          mockToken.address,
          "",
          TEST_VALUES.DEFAULT_VALUE
        ])
      ).to.be.rejected;
    });
  });
  
  describe("Bidding Validation", function () {
    it("Should revert if bid amount is zero", async function () {
      const { tokenAuction, bidder1 } = await loadFixture(deployTokenAuctionFixture);
      
      await expect(
        tokenAuction.write.placeBid([0n, TEST_VALUES.RESOURCE_VALUE_1], { account: bidder1.account })
      ).to.be.rejected;
    });
    
    it("Should revert if resource value is empty", async function () {
      const { tokenAuction, bidder1 } = await loadFixture(deployTokenAuctionFixture);
      
      await expect(
        tokenAuction.write.placeBid([parseEther("10"), ""], { account: bidder1.account })
      ).to.be.rejected;
    });
    
    it("Should revert if bid is not higher than current highest bid", async function () {
      const { tokenAuction, bidder1, bidder2, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      // Place initial bid
      const hash = await tokenAuction.write.placeBid([parseEther("10"), TEST_VALUES.RESOURCE_VALUE_1], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Try to place same bid amount
      await expect(
        tokenAuction.write.placeBid([parseEther("10"), TEST_VALUES.RESOURCE_VALUE_2], { account: bidder2.account })
      ).to.be.rejected;
      
      // Try to place lower bid
      await expect(
        tokenAuction.write.placeBid([parseEther("9"), TEST_VALUES.RESOURCE_VALUE_2], { account: bidder2.account })
      ).to.be.rejected;
    });
    
    it("Should revert if token transfer fails", async function () {
      const { tokenAuction, bidder1, mockToken } = await loadFixture(deployTokenAuctionFixture);
      
      // Revoke approval
      await mockToken.write.approve([tokenAuction.address, 0n], { account: bidder1.account });
      
      // Try to place bid without approval
      await expect(
        tokenAuction.write.placeBid([parseEther("10"), TEST_VALUES.RESOURCE_VALUE_1], { account: bidder1.account })
      ).to.be.rejected;
    });
  });
  
  describe("Auction Finalization Validation", function () {
    it("Should revert if auction has not ended yet", async function () {
      const { tokenAuction } = await loadFixture(deployTokenAuctionFixture);
      
      await expect(tokenAuction.write.finalizeAuction()).to.be.rejected;
    });
    
    it("Should handle case where there are no bids", async function () {
      const { tokenAuction, ONE_DAY_IN_SECS, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      // Advance time past auction duration
      await time.increase(BigInt(ONE_DAY_IN_SECS + 1));
      
      // Finalize auction
      const hash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check that a new auction was started
      expect(await tokenAuction.read.currentAuctionId()).to.equal(2n);
      
      // Check that the default resource value was used
      const auctionEndedEvents = await tokenAuction.getEvents.AuctionEnded() as unknown[];
      const auctionEndedEvent = auctionEndedEvents[0] as unknown as { args: { resourceValue: string } };
      expect(auctionEndedEvent.args.resourceValue).to.equal(TEST_VALUES.DEFAULT_VALUE);
    });
  });
  
  describe("Owner Function Validation", function () {
    it("Should revert if non-owner tries to set bidding token", async function () {
      const { tokenAuction, mockToken, bidder1 } = await loadFixture(deployTokenAuctionFixture);
      
      await expect(
        tokenAuction.write.setBiddingToken([mockToken.address], { account: bidder1.account })
      ).to.be.rejected;
    });
    
    it("Should revert if setting bidding token to zero address", async function () {
      const { tokenAuction, owner } = await loadFixture(deployTokenAuctionFixture);
      
      await expect(
        tokenAuction.write.setBiddingToken([zeroAddress], { account: owner.account })
      ).to.be.rejected;
    });
    
    it("Should revert if non-owner tries to set auction duration", async function () {
      const { tokenAuction, bidder1, ONE_DAY_IN_SECS } = await loadFixture(deployTokenAuctionFixture);
      
      await expect(
        tokenAuction.write.setAuctionDuration([BigInt(2 * ONE_DAY_IN_SECS)], { account: bidder1.account })
      ).to.be.rejected;
    });
    
    it("Should revert if non-owner tries to set default resource value", async function () {
      const { tokenAuction, bidder1 } = await loadFixture(deployTokenAuctionFixture);
      
      await expect(
        tokenAuction.write.setDefaultResourceValue(["https://newdefault.com"], { account: bidder1.account })
      ).to.be.rejected;
    });
  });
  
  describe("Edge Cases", function () {
    it("Should handle multiple bids from the same bidder", async function () {
      const { tokenAuction, bidder1, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      // First bid
      let hash = await tokenAuction.write.placeBid([parseEther("10"), TEST_VALUES.RESOURCE_VALUE_1], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Second bid (higher)
      hash = await tokenAuction.write.placeBid([parseEther("20"), TEST_VALUES.RESOURCE_VALUE_2], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check that the bid was updated
      const [bidder, amount, resourceValue] = await tokenAuction.read.getBid([1n]);
      const bid = { bidder, amount, resourceValue };
      expect(bid.bidder).to.equal(getAddress(bidder1.account.address));
      expect(bid.amount).to.equal(parseEther("20"));
      expect(bid.resourceValue).to.equal(TEST_VALUES.RESOURCE_VALUE_2);
    });
    
    it("Should handle auction finalization with exactly the auction duration passed", async function () {
      const { tokenAuction, bidder1, ONE_DAY_IN_SECS, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      // Place a bid
      let hash = await tokenAuction.write.placeBid([parseEther("10"), TEST_VALUES.RESOURCE_VALUE_1], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Advance time to exactly the auction duration
      await time.increase(BigInt(ONE_DAY_IN_SECS));
      
      // Finalize auction
      hash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check that a new auction was started
      expect(await tokenAuction.read.currentAuctionId()).to.equal(2n);
    });
    
    it("Should handle changing bidding token mid-auction", async function () {
      const { tokenAuction, owner, bidder1, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      // Place a bid
      let hash = await tokenAuction.write.placeBid([parseEther("10"), TEST_VALUES.RESOURCE_VALUE_1], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Deploy a new token
      const newToken = await hre.viem.deployContract("MockERC20", [
        "New Token",
        "NTK",
        parseEther("1000000")
      ]);
      
      // Set new token
      hash = await tokenAuction.write.setBiddingToken([newToken.address], { account: owner.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check token was updated
      expect(await tokenAuction.read.biddingToken()).to.equal(getAddress(newToken.address));
    });
  });
});