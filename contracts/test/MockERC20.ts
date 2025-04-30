import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther } from "viem";
import { TEST_VALUES } from "./test-config";

describe("MockERC20", function () {
  // We define a fixture to reuse the same setup in every test
  async function deployMockTokenFixture() {
    // Get wallet clients
    const [owner, user1, user2] = await hre.viem.getWalletClients();
    
    // Deploy mock ERC20 token
    const mockToken = await hre.viem.deployContract("MockERC20", [
      TEST_VALUES.TOKEN_NAME,
      TEST_VALUES.TOKEN_SYMBOL,
      TEST_VALUES.INITIAL_SUPPLY
    ]);
    
    // Get public client for reading state
    const publicClient = await hre.viem.getPublicClient();
    
    return {
      mockToken,
      owner,
      user1,
      user2,
      publicClient
    };
  }
  
  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      const { mockToken } = await loadFixture(deployMockTokenFixture);
      
      expect(await mockToken.read.name()).to.equal(TEST_VALUES.TOKEN_NAME);
      expect(await mockToken.read.symbol()).to.equal(TEST_VALUES.TOKEN_SYMBOL);
    });
    
    it("Should set the right owner", async function () {
      const { mockToken, owner } = await loadFixture(deployMockTokenFixture);
      
      expect(await mockToken.read.owner()).to.equal(getAddress(owner.account.address));
    });
    
    it("Should assign the total supply of tokens to the owner", async function () {
      const { mockToken, owner } = await loadFixture(deployMockTokenFixture);
      
      expect(await mockToken.read.totalSupply()).to.equal(TEST_VALUES.INITIAL_SUPPLY);
      expect(await mockToken.read.balanceOf([owner.account.address])).to.equal(TEST_VALUES.INITIAL_SUPPLY);
    });
  });
  
  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const { mockToken, owner, user1, publicClient } = await loadFixture(deployMockTokenFixture);
      
      const mintAmount = parseEther("1000");
      const initialBalance = await mockToken.read.balanceOf([user1.account.address]) as bigint;
      const initialSupply = await mockToken.read.totalSupply() as bigint;
      
      // Mint tokens to user1
      const hash = await mockToken.write.mint([user1.account.address, mintAmount], { account: owner.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check balance and total supply
      const finalBalance = await mockToken.read.balanceOf([user1.account.address]) as bigint;
      const finalSupply = await mockToken.read.totalSupply() as bigint;
      
      expect(finalBalance).to.equal(initialBalance + mintAmount);
      expect(finalSupply).to.equal(initialSupply + mintAmount);
    });
    
    it("Should not allow non-owner to mint tokens", async function () {
      const { mockToken, user1, user2 } = await loadFixture(deployMockTokenFixture);
      
      const mintAmount = parseEther("1000");
      
      // Try to mint tokens as non-owner
      await expect(
        mockToken.write.mint([user2.account.address, mintAmount], { account: user1.account })
      ).to.be.rejected;
    });
  });
  
  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const { mockToken, owner, user1, publicClient } = await loadFixture(deployMockTokenFixture);
      
      const transferAmount = parseEther("100");
      
      // Get initial balances
      const initialOwnerBalance = await mockToken.read.balanceOf([owner.account.address]) as bigint;
      const initialUser1Balance = await mockToken.read.balanceOf([user1.account.address]) as bigint;
      
      // Transfer tokens from owner to user1
      const hash = await mockToken.write.transfer([user1.account.address, transferAmount], { account: owner.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check final balances
      const finalOwnerBalance = await mockToken.read.balanceOf([owner.account.address]) as bigint;
      const finalUser1Balance = await mockToken.read.balanceOf([user1.account.address]) as bigint;
      
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - transferAmount);
      expect(finalUser1Balance).to.equal(initialUser1Balance + transferAmount);
    });
    
    it("Should fail if sender doesn't have enough tokens", async function () {
      const { mockToken, user1, user2 } = await loadFixture(deployMockTokenFixture);
      
      const transferAmount = parseEther("100");
      
      // Try to transfer tokens without having any
      await expect(
        mockToken.write.transfer([user2.account.address, transferAmount], { account: user1.account })
      ).to.be.rejected;
    });
  });
  
  describe("Allowances", function () {
    it("Should approve tokens for delegated transfer", async function () {
      const { mockToken, owner, user1, publicClient } = await loadFixture(deployMockTokenFixture);
      
      const approveAmount = parseEther("100");
      
      // Approve user1 to spend owner's tokens
      const hash = await mockToken.write.approve([user1.account.address, approveAmount], { account: owner.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check allowance
      const allowance = await mockToken.read.allowance([owner.account.address, user1.account.address]);
      expect(allowance).to.equal(approveAmount);
    });
    
    it("Should allow for delegated token transfers", async function () {
      const { mockToken, owner, user1, user2, publicClient } = await loadFixture(deployMockTokenFixture);
      
      const approveAmount = parseEther("100");
      const transferAmount = parseEther("50");
      
      // Approve user1 to spend owner's tokens
      let hash = await mockToken.write.approve([user1.account.address, approveAmount], { account: owner.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Get initial balances
      const initialOwnerBalance = await mockToken.read.balanceOf([owner.account.address]) as bigint;
      const initialUser2Balance = await mockToken.read.balanceOf([user2.account.address]) as bigint;
      
      // User1 transfers tokens from owner to user2
      hash = await mockToken.write.transferFrom(
        [owner.account.address, user2.account.address, transferAmount],
        { account: user1.account }
      );
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Check final balances
      const finalOwnerBalance = await mockToken.read.balanceOf([owner.account.address]) as bigint;
      const finalUser2Balance = await mockToken.read.balanceOf([user2.account.address]) as bigint;
      
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - transferAmount);
      expect(finalUser2Balance).to.equal(initialUser2Balance + transferAmount);
      
      // Check remaining allowance
      const remainingAllowance = await mockToken.read.allowance([owner.account.address, user1.account.address]);
      expect(remainingAllowance).to.equal(approveAmount - transferAmount);
    });
    
    it("Should fail when trying to transfer more than allowed", async function () {
      const { mockToken, owner, user1, user2, publicClient } = await loadFixture(deployMockTokenFixture);
      
      const approveAmount = parseEther("50");
      const transferAmount = parseEther("100");
      
      // Approve user1 to spend owner's tokens
      const hash = await mockToken.write.approve([user1.account.address, approveAmount], { account: owner.account });
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Try to transfer more than allowed
      await expect(
        mockToken.write.transferFrom(
          [owner.account.address, user2.account.address, transferAmount],
          { account: user1.account }
        )
      ).to.be.rejected;
    });
  });
});