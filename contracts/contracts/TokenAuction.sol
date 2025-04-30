// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenAuction is Ownable {
    IERC20 public biddingToken;
    string public resourceName;
    string public defaultResourceValue;
    
    struct Bid {
        address bidder;
        uint256 amount;
        string resourceValue;
    }
    
    mapping(uint256 => Bid) private _bids;
    
    // Public view functions to access bids with normalized addresses
    function getBid(uint256 auctionId) public view returns (address, uint256, string memory) {
        Bid memory bid = _bids[auctionId];
        return (bid.bidder, bid.amount, bid.resourceValue);
    }
    
    function getBidder(uint256 auctionId) public view returns (address) {
        return _bids[auctionId].bidder;
    }
    uint256 public currentAuctionId;
    uint256 public auctionDuration = 1 days;
    
    // Track the start time of each auction
    mapping(uint256 => uint256) public auctionStartTimes;
    
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount, string resourceValue);
    event BidRefunded(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed auctionId, address winner, uint256 amount, string resourceValue);
    
    constructor(address _biddingToken, string memory _resourceName, string memory _defaultValue) Ownable(msg.sender) {
        require(_biddingToken != address(0), "Token address cannot be zero");
        require(bytes(_resourceName).length > 0, "Resource name cannot be empty");
        biddingToken = IERC20(_biddingToken);
        resourceName = _resourceName;
        defaultResourceValue = _defaultValue;
        _startNewAuction();
    }
    
    function placeBid(uint256 amount, string calldata resourceValue) external {
        require(address(biddingToken) != address(0), "Bidding token not set");
        require(amount > _bids[currentAuctionId].amount, "Bid too low");
        require(bytes(resourceValue).length > 0, "Resource value required");
        
        address previousBidder = _bids[currentAuctionId].bidder;
        uint256 previousAmount = _bids[currentAuctionId].amount;
        
        if (previousBidder != address(0)) {
            require(biddingToken.transfer(previousBidder, previousAmount), "Refund failed");
            emit BidRefunded(currentAuctionId, previousBidder, previousAmount);
            emit BidPlaced(currentAuctionId, previousBidder, previousAmount, _bids[currentAuctionId].resourceValue);
        }
        
        require(biddingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        _bids[currentAuctionId] = Bid({
            bidder: msg.sender,
            amount: amount,
            resourceValue: resourceValue
        });
        
        emit BidPlaced(currentAuctionId, msg.sender, amount, resourceValue);
    }
    
    function finalizeAuction() external {
        Bid storage currentBid = _bids[currentAuctionId];
        uint256 auctionStartTime = auctionStartTimes[currentAuctionId];
        require(block.timestamp > auctionStartTime + auctionDuration, "Auction not ended");
        
        if (currentBid.bidder != address(0)) {
            emit AuctionEnded(currentAuctionId, currentBid.bidder, currentBid.amount, currentBid.resourceValue);
        } else {
            emit AuctionEnded(currentAuctionId, address(0), 0, defaultResourceValue);
        }
        
        _startNewAuction();
    }
    
    function _startNewAuction() private {
        currentAuctionId++;
        _bids[currentAuctionId] = Bid({
            bidder: address(0),
            amount: 0,
            resourceValue: ""
        });
        // Record the start time of the new auction
        auctionStartTimes[currentAuctionId] = block.timestamp;
    }
    
    // Funciones de configuración para el owner
    function setBiddingToken(address newToken) external onlyOwner {
        require(newToken != address(0), "Invalid token address");
        biddingToken = IERC20(newToken);
    }
    
    function setAuctionDuration(uint256 newDuration) external onlyOwner {
        auctionDuration = newDuration;
    }
    
    function setDefaultResourceValue(string calldata newValue) external onlyOwner {
        defaultResourceValue = newValue;
    }
}