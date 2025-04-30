import { useState, useEffect } from 'react';
import { useContractRead } from 'wagmi';
import { formatEther } from 'viem';
import { AUCTION_CONTRACT_ADDRESS, AUCTION_ABI } from '@/constants/contracts';

export interface ResourceValue {
  url: string;
  metadata?: string;
}

export interface AuctionData {
  currentAuctionId: bigint | undefined;
  timeRemaining: bigint | undefined;
  formattedTimeLeft: string;
  currentBidder: `0x${string}` | undefined;
  currentBidAmount: bigint | undefined;
  formattedBidAmount: string;
  currentResourceValue: string | undefined;
  parsedResourceValue: ResourceValue | null;
  isLoading: boolean;
}

export function useAuctionData(): AuctionData {
  // Get current auction ID
  const { data: currentAuctionIdData, isLoading: isLoadingId } = useContractRead({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'currentAuctionId',
    watch: true,
  });

  // Get time remaining
  const { data: timeRemainingData, isLoading: isLoadingTime } = useContractRead({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'getTimeRemaining',
    watch: true,
  });

  // Get current bid info
  const { data: currentBidInfoData, isLoading: isLoadingBid } = useContractRead({
    address: AUCTION_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'getBid',
    args: currentAuctionIdData ? [currentAuctionIdData as bigint] : undefined,
    watch: true,
    enabled: !!currentAuctionIdData,
  });

  // Format time remaining
  const formatTime = (seconds: bigint | undefined): string => {
    if (!seconds || seconds <= 0n) return "00:00:00";
    const totalSeconds = Number(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Parse resource value
  const parseResourceValue = (value: string | undefined): ResourceValue | null => {
    if (!value) return null;
    try {
      return JSON.parse(value) as ResourceValue;
    } catch (e) {
      console.error('Failed to parse resource value:', e);
      return null;
    }
  };

  // Extract and format bid info
  const [currentBidder, currentBidAmount, currentResourceValue] = (currentBidInfoData as [string, bigint, string] | undefined) ?? [undefined, undefined, undefined];

  return {
    currentAuctionId: currentAuctionIdData as bigint | undefined,
    timeRemaining: timeRemainingData as bigint | undefined,
    formattedTimeLeft: formatTime(timeRemainingData as bigint | undefined),
    currentBidder: currentBidder as `0x${string}` | undefined,
    currentBidAmount: currentBidAmount,
    formattedBidAmount: currentBidAmount ? `${formatEther(currentBidAmount)} A0X` : "0 A0X",
    currentResourceValue,
    parsedResourceValue: parseResourceValue(currentResourceValue),
    isLoading: isLoadingId || isLoadingTime || isLoadingBid,
  };
} 