'use client';

import { useState } from 'react';
import { useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AUCTION_CONTRACT_ADDRESS, AUCTION_ABI } from '@/constants/contracts';

interface BidFormProps {
  isApproved: boolean;
  onApproveClick: () => void;
  isApproving: boolean;
  isBidding: boolean;
  isConfirmingApproval: boolean;
  isConfirmingBid: boolean;
}

export function BidForm({
  isApproved,
  onApproveClick,
  isApproving,
  isBidding,
  isConfirmingApproval,
  isConfirmingBid
}: BidFormProps) {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [resourceUrl, setResourceUrl] = useState<string>('');
  const [resourceMetadata, setResourceMetadata] = useState<string>('');

  // Contract write hook for placing bid
  const { writeAsync: placeBid } = useContractWrite({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'placeBid',
  });

  const handleBidSubmit = async () => {
    if (!bidAmount || !resourceUrl) return;

    try {
      const resourceValue = JSON.stringify({
        url: resourceUrl,
        metadata: resourceMetadata || 'N/A'
      });

      await placeBid({
        args: [parseEther(bidAmount), resourceValue],
      });

      // Reset form after successful bid
      setBidAmount('');
      setResourceUrl('');
      setResourceMetadata('');
    } catch (error) {
      console.error('Error placing bid:', error);
    }
  };

  const isFormDisabled = isApproving || isBidding || isConfirmingApproval || isConfirmingBid;
  const buttonText = isConfirmingApproval ? 'Approving...' :
                    isApproving ? 'Check Wallet to Approve...' :
                    isConfirmingBid ? 'Placing Bid...' :
                    isBidding ? 'Check Wallet to Place Bid...' :
                    !isApproved ? 'Approve A0X Token' :
                    'Place Bid';

  return (
    <div className="space-y-4">
      <Input
        type="number"
        placeholder="Your bid amount (e.g., 10.5)"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
        className="bg-[#1a237e]/30 border-white/10 text-white placeholder:text-white/50"
        disabled={isFormDisabled}
      />
      
      <Input
        type="url"
        placeholder="Resource URL (e.g., https://...)"
        value={resourceUrl}
        onChange={(e) => setResourceUrl(e.target.value)}
        className="bg-[#1a237e]/30 border-white/10 text-white placeholder:text-white/50"
        disabled={isFormDisabled}
      />
      
      <Textarea
        placeholder="Additional Metadata (optional)"
        value={resourceMetadata}
        onChange={(e) => setResourceMetadata(e.target.value)}
        className="bg-[#1a237e]/30 border-white/10 text-white placeholder:text-white/50"
        rows={2}
        disabled={isFormDisabled}
      />

      <Button
        onClick={!isApproved ? onApproveClick : handleBidSubmit}
        className="w-full bg-[#ffeb3b]/80 hover:bg-[#ffeb3b] text-[#1a237e] font-bold"
        disabled={isFormDisabled || !bidAmount || !resourceUrl}
      >
        {buttonText}
      </Button>

      {(isConfirmingApproval || isConfirmingBid) && (
        <p className="text-xs text-center text-yellow-300/80">
          Processing transaction on the blockchain...
        </p>
      )}
    </div>
  );
} 