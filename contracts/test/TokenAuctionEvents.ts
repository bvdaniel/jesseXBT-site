import { 
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther } from "viem";
import { TEST_VALUES } from "./test-config";

describe("TokenAuction Event Tests", function () {
  async function deployTokenAuctionFixture() {
    const ONE_DAY_IN_SECS = 24 * 60 * 60;
    const [owner, bidder1, bidder2, bidder3] = await hre.viem.getWalletClients();
    
    const mockToken = await hre.viem.deployContract("MockERC20", [
      TEST_VALUES.TOKEN_NAME,
      TEST_VALUES.TOKEN_SYMBOL,
      TEST_VALUES.INITIAL_SUPPLY
    ]);
    
    await mockToken.write.mint([bidder1.account.address, TEST_VALUES.BIDDER_BALANCE], { account: owner.account });
    await mockToken.write.mint([bidder2.account.address, TEST_VALUES.BIDDER_BALANCE], { account: owner.account });
    await mockToken.write.mint([bidder3.account.address, TEST_VALUES.BIDDER_BALANCE], { account: owner.account });
    
    const tokenAuction = await hre.viem.deployContract("TokenAuction", [
      mockToken.address,
      TEST_VALUES.RESOURCE_NAME,
      TEST_VALUES.DEFAULT_VALUE
    ]);
    
    await mockToken.write.approve([tokenAuction.address, TEST_VALUES.BIDDER_BALANCE], { account: bidder1.account });
    await mockToken.write.approve([tokenAuction.address, TEST_VALUES.BIDDER_BALANCE], { account: bidder2.account });
    await mockToken.write.approve([tokenAuction.address, TEST_VALUES.BIDDER_BALANCE], { account: bidder3.account });
    
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

  describe("Bid Events", function() {
    it("should handle bid events correctly", async function() {
      const { tokenAuction, bidder1, publicClient } = await loadFixture(deployTokenAuctionFixture);
      const bidAmount = parseEther("10");
      const resourceValue = TEST_VALUES.RESOURCE_VALUE_1;
      
      const hash = await tokenAuction.write.placeBid([bidAmount, resourceValue], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      const events = await tokenAuction.getEvents.BidPlaced();
      expect(events).to.have.length(1);
      
      const event = events[0] as {
        args: {
          auctionId: bigint;
          bidder: string;
          amount: bigint;
          resourceValue: string;
        }
      };
      
      expect(event.args.auctionId).to.equal(1n);
      expect(event.args.bidder.toLowerCase()).to.equal(bidder1.account.address.toLowerCase());
      expect(event.args.amount).to.equal(bidAmount);
      expect(event.args.resourceValue).to.equal(resourceValue);
    });
  });

  describe("Auction End Events", function() {
    it("should handle auction end events correctly", async function() {
      const { tokenAuction, bidder1, ONE_DAY_IN_SECS, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      const hash = await tokenAuction.write.placeBid([parseEther("10"), TEST_VALUES.RESOURCE_VALUE_1], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      await time.increase(BigInt(ONE_DAY_IN_SECS + 1));
      
      const endHash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash: endHash });
      
      const events = await tokenAuction.getEvents.AuctionEnded();
      expect(events).to.have.length(1);
      
      const event = events[0] as {
        args: {
          auctionId: bigint;
          winner: string;
          amount: bigint;
          resourceValue: string;
        }
      };
      
      expect(event.args.auctionId).to.equal(1n);
      expect(event.args.winner.toLowerCase()).to.equal(bidder1.account.address.toLowerCase());
      expect(event.args.amount).to.equal(parseEther("10"));
      expect(event.args.resourceValue).to.equal(TEST_VALUES.RESOURCE_VALUE_1);
    });
  });

  describe("Multiple Events", function() {
    it("should handle multiple events correctly", async function() {
      const { tokenAuction, bidder1, bidder2, ONE_DAY_IN_SECS, publicClient } = await loadFixture(deployTokenAuctionFixture);
      
      const hash1 = await tokenAuction.write.placeBid([parseEther("10"), TEST_VALUES.RESOURCE_VALUE_1], { account: bidder1.account });
      await publicClient.waitForTransactionReceipt({ hash: hash1 });
      
      const hash2 = await tokenAuction.write.placeBid([parseEther("20"), TEST_VALUES.RESOURCE_VALUE_2], { account: bidder2.account });
      await publicClient.waitForTransactionReceipt({ hash: hash2 });
      
      await time.increase(BigInt(ONE_DAY_IN_SECS + 1));
      
      const endHash = await tokenAuction.write.finalizeAuction();
      await publicClient.waitForTransactionReceipt({ hash: endHash });
      
      // Get the BidPlaced event topic hash
      const bidPlacedTopic = '0x30a2a69b40adbe12d54a071518bad8cd2b2882425282bcd63857bf99aa1fe0a9';
      
      // Get all logs for the contract that match the BidPlaced event signature
      const logs = await publicClient.getLogs({
        address: tokenAuction.address,
        event: {
          type: 'event',
          name: 'BidPlaced',
          inputs: [
            { type: 'uint256', name: 'auctionId', indexed: true },
            { type: 'address', name: 'bidder', indexed: true },
            { type: 'uint256', name: 'amount' },
            { type: 'string', name: 'resourceValue' }
          ]
        },
        fromBlock: 0n
      });
      
      console.log("BidPlaced logs:", logs);
      
      // These are our BidPlaced events
      expect(logs).to.have.length(3); // 3 events: 1 from first bid, 2 from second bid (refund + new bid)
      
      const endEvents = await tokenAuction.getEvents.AuctionEnded();
      expect(endEvents).to.have.length(1);
      
      // Use the first and third logs (first bid and second bidder's bid)
      const bidEvent1 = logs[0] as {
        args: {
          auctionId: bigint;
          bidder: string;
          amount: bigint;
          resourceValue: string;
        }
      };
      
      const bidEvent2 = logs[2] as {
        args: {
          auctionId: bigint;
          bidder: string;
          amount: bigint;
          resourceValue: string;
        }
      };
      
      expect(bidEvent1.args.auctionId).to.equal(1n);
      expect(bidEvent1.args.bidder.toLowerCase()).to.equal(bidder1.account.address.toLowerCase());
      expect(bidEvent2.args.bidder.toLowerCase()).to.equal(bidder2.account.address.toLowerCase());
    });
  });
});