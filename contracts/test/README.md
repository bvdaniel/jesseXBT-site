# TokenAuction Tests

This directory contains comprehensive tests for the TokenAuction contract and related deployment scripts.

## Test Structure

The test suite is organized as follows:

### Main Contract Tests

- **TokenAuction.ts**: Main contract tests covering all functionality of the TokenAuction contract
  - Deployment verification
  - Bidding functionality
  - Auction finalization
  - Owner functions
  - Multiple auction cycles

### Specialized Test Files

- **TokenAuctionErrors.ts**: Tests for error handling and edge cases
  - Constructor validation
  - Bidding validation
  - Auction finalization validation
  - Owner function validation
  - Edge cases

- **TokenAuctionEvents.ts**: Tests for event emission
  - BidPlaced event validation
  - AuctionEnded event validation
  - Multiple auction cycles event validation

- **TokenAuctionGas.ts**: Tests for gas usage
  - Deployment gas
  - Bidding gas
  - Auction finalization gas
  - Owner function gas

- **TokenAuctionIntegration.ts**: Integration tests
  - Contract and Ignition module integration
  - Deployment script integration
  - End-to-end flow

### Deployment Tests

- **DeployTokenAuction.ts**: Tests for the deployment script structure
  - Verifies the script has all required components
  - Checks for proper parameter handling
  - Validates gas estimation logic

- **IgnitionModule.ts**: Tests for the Ignition module structure
  - Verifies the module has all required components
  - Checks for proper parameter handling
  - Validates default values

### Supporting Tests

- **MockERC20.ts**: Tests for the mock ERC20 token
  - Deployment verification
  - Minting functionality
  - Transfer functionality
  - Allowance functionality

### Helper Files

- **helpers/time.ts**: Helper functions for manipulating blockchain time in tests
  - `increaseTime`: Increases the blockchain time by a specified number of seconds
  - `getCurrentTime`: Gets the current block timestamp
  - `setTime`: Sets the blockchain time to a specific timestamp
  - `mineBlock`: Mines a new block
  - `mineBlocks`: Mines multiple blocks
  - `advanceTimeAndBlock`: Advances time and mines a new block

- **test-config.ts**: Shared configuration and utilities for tests
  - Common test values
  - Utility functions for setting up test environments

### Mock Contracts

- **MockERC20.sol**: A mock ERC20 token for testing purposes
  - Used as the bidding token in TokenAuction tests

## Running Tests

### Using NPM Scripts

The following npm scripts are available for running tests:

```bash
# Run all tests
npm test

# Run tests with gas reporting
npm run test:gas

# Run tests with coverage
npm run test:coverage

# Run specific test files
npm run test:main       # Main TokenAuction tests
npm run test:errors     # Error handling tests
npm run test:events     # Event emission tests
npm run test:gas-usage  # Gas usage tests
npm run test:integration # Integration tests
npm run test:mock       # Mock ERC20 tests
npm run test:deploy     # Deployment script tests
npm run test:ignition   # Ignition module tests
```

### Using Hardhat Directly

You can also run tests directly using Hardhat:

```bash
# Run all tests
npx hardhat test

# Run a specific test file
npx hardhat test test/TokenAuction.ts

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test

# Run tests with coverage
npx hardhat coverage
```

## Test Coverage

The test suite aims to provide comprehensive coverage of the TokenAuction contract and related files. To generate a test coverage report:

```bash
npm run test:coverage
```

This will create a coverage report in the `coverage/` directory.

## Continuous Integration

The tests are designed to be run in CI environments. Some tests that require external services or specific configurations will be skipped in CI environments.

## Test Dependencies

The tests depend on the following packages:

- Hardhat: For running the Ethereum development environment
- Chai: For assertions
- Viem: For interacting with the Ethereum blockchain
- Hardhat Network Helpers: For manipulating the blockchain state in tests

## Adding New Tests

When adding new tests:

1. Create a new test file in the `test/` directory
2. Import the necessary dependencies
3. Use the `loadFixture` pattern for test setup
4. Add the test file to `test/index.ts` to include it in the main test suite
5. Add a corresponding npm script to `package.json` if needed