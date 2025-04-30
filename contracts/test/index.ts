/**
 * TokenAuction Test Suite
 * 
 * This file serves as the main entry point for all TokenAuction tests.
 * It imports and runs all test files in a specific order to ensure proper test execution.
 * 
 * To run all tests:
 * npx hardhat test
 * 
 * To run a specific test file:
 * npx hardhat test test/TokenAuction.ts
 */

// Import test files in order of dependency
import "./MockERC20";
import "./TokenAuction";
import "./TokenAuctionErrors";
import "./TokenAuctionEvents";
import "./TokenAuctionGas";
import "./DeployTokenAuction";
import "./IgnitionModule";
import "./TokenAuctionIntegration";

// This file doesn't contain any tests itself, it just imports all test files
describe("TokenAuction Test Suite", function () {
  it("Should run all tests", function () {
    // This test is just a placeholder to ensure the test suite runs
    // All actual tests are in the imported files
  });
});