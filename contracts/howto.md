# TokenAuction Smart Contract - Technical Manual

## Overview
A time-based auction system where participants bid ERC20 tokens to win a resource (represented by a string value). Features include:
- ERC20 token bidding
- Automatic refunds for outbid participants
- Configurable auction duration
- Owner-controlled parameters

## Key Functions

### Core Functions
| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `placeBid(amount, resourceValue)` | Place a new bid (must be higher than current bid) | `uint256 amount`, `string resourceValue` | - |
| `finalizeAuction()` | Finalizes current auction and starts a new one | - | - |
| `getTimeRemaining()` | Returns remaining time (seconds) for current auction | - | `uint256` |

### View Functions
| Function | Description | Returns |
|----------|-------------|---------|
| `getBid(auctionId)` | Returns full bid details | `(address bidder, uint256 amount, string resourceValue)` |
| `getBidder(auctionId)` | Returns bidder address for an auction | `address` |
| `getLastAuctionWinner()` | Returns last winner's details | `(address winner, uint256 amount, string resourceValue)` |

### Admin Functions (Owner Only)
| Function | Description |
|----------|-------------|
| `setBiddingToken(newToken)` | Changes the ERC20 token used for bidding |
| `setAuctionDuration(newDuration)` | Updates auction duration (in seconds) |
| `setDefaultResourceValue(newValue)` | Changes default resource value |

## Key Variables
```solidity
IERC20 public biddingToken;         // ERC20 token used for bids
string public resourceName;         // Name of the resource being auctioned
string public defaultResourceValue; // Default value if no bids
uint256 public currentAuctionId;    // ID of active auction
uint256 public auctionDuration;     // Duration in seconds (default: 86400)
```

## Events
| Event | Description | Parameters |
|-------|-------------|------------|
| `BidPlaced` | Emitted on new bid | `auctionId, bidder, amount, resourceValue` |
| `BidRefunded` | Emitted when outbid | `auctionId, bidder, amount` |
| `AuctionEnded` | Emitted when auction closes | `auctionId, winner, amount, resourceValue` |

## Usage Guide

### 1. Deployment
```bash
npx hardhat run scripts/deploy-token-auction.ts --network base
```
Constructor parameters:
- `_biddingToken`: ERC20 token address (e.g., USDC on Base)
- `_resourceName`: Name of resource (e.g., "QR Destination URL")
- `_defaultValue`: Default value (e.g., "https://qrcoin.fun")

### 2. Placing a Bid (Frontend Example)
```javascript
const tokenAuction = new ethers.Contract(contractAddress, abi, signer);
const bidAmount = ethers.parseUnits("100", 6); // 100 USDC (6 decimals)
await tokenAuction.placeBid(
  bidAmount,
  "https://custom-url.example" // Custom resource value
);
```

### 3. Finalizing an Auction
```javascript
// Call after auction duration ends
await tokenAuction.finalizeAuction();
```

### 4. Querying Information
```javascript
// Get current highest bid
const [bidder, amount, resource] = await tokenAuction.getBid(
  await tokenAuction.currentAuctionId()
);

// Get time remaining
const remaining = await tokenAuction.getTimeRemaining();
```

## Security Notes
1. Bidders must approve the contract to spend their tokens first
2. All bids must include a non-empty `resourceValue`
3. The contract automatically refunds outbid participants

## Typical Workflow
1. User approves token spending
2. User places bid with custom resource value
3. (Optional) User gets outbid and receives refund
4. Admin finalizes auction when time expires
5. Repeat for next auction