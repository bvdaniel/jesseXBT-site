"use client";

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../shadcn/sheet";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useContractWrite, useAccount, useDisconnect, useWaitForTransactionReceipt, useContractRead } from 'wagmi';
import { parseEther } from 'viem';
import { A0X_CONTRACT_ADDRESS, AUCTION_CONTRACT_ADDRESS, AUCTION_ABI } from '@/constants/contracts';
import { useAuctionData } from '@/hooks/useAuctionData';
import { BidForm } from './BidForm';

interface VideoAuctionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoAuctionSheet({ isOpen, onClose }: VideoAuctionSheetProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isApproving, setIsApproving] = useState(false);
  const [isBidding, setIsBidding] = useState(false);
  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | undefined>();
  const [bidTxHash, setBidTxHash] = useState<`0x${string}` | undefined>();
  const [wasConnected, setWasConnected] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [shouldShowSheet, setShouldShowSheet] = useState(isOpen);

  // Use the custom hook for auction data
  const {
    currentAuctionId,
    formattedTimeLeft,
    currentBidder,
    formattedBidAmount,
    parsedResourceValue,
    isLoading: isLoadingAuctionData
  } = useAuctionData();

  // Check token allowance
  const { data: allowanceData } = useContractRead({
    address: A0X_CONTRACT_ADDRESS,
    abi: AUCTION_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}` ?? '0x0', AUCTION_CONTRACT_ADDRESS],
    enabled: Boolean(address),
  });

  // Transaction confirmation hooks
  const { isLoading: isConfirmingApproval } = useWaitForTransactionReceipt({
    hash: approveTxHash,
    onSuccess: () => setIsApproving(false),
    onError: () => setIsApproving(false),
  });

  const { isLoading: isConfirmingBid } = useWaitForTransactionReceipt({
    hash: bidTxHash,
    onSuccess: () => setIsBidding(false),
    onError: () => setIsBidding(false),
  });

  // Handle wallet connection changes
  useEffect(() => {
    if (isConnected && !wasConnected) {
      setWasConnected(true);
      setIsWalletModalOpen(false);
      setTimeout(() => setShouldShowSheet(true), 500);
    } else if (!isConnected) {
      setWasConnected(false);
    }
  }, [isConnected, wasConnected]);

  useEffect(() => {
    if (!isWalletModalOpen) {
      setShouldShowSheet(isOpen);
    }
  }, [isOpen, isWalletModalOpen]);

  // Handle approve token
  const handleApproveClick = async () => {
    if (!address) return;

    try {
      setIsApproving(true);
      const { hash } = await writeContractAsync({
        address: A0X_CONTRACT_ADDRESS,
        abi: AUCTION_ABI,
        functionName: 'approve',
        args: [AUCTION_CONTRACT_ADDRESS, parseEther('1000000')], // Large approval
      });
      setApproveTxHash(hash);
    } catch (error) {
      console.error('Error approving token:', error);
      setIsApproving(false);
    }
  };

  // Wallet connection handlers
  const handleConnectClick = (openConnectModal: () => void) => {
    setIsWalletModalOpen(true);
    setShouldShowSheet(false);
    openConnectModal();
  };

  const handleChainClick = (openChainModal: () => void) => {
    setIsWalletModalOpen(true);
    setShouldShowSheet(false);
    openChainModal();
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setWasConnected(false);
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  // Custom wallet button renderer
  const renderWalletButton = () => (
    <div className="w-full">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                'style': {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={() => handleConnectClick(openConnectModal)}
                      type="button"
                      className="w-full py-2.5 px-4 bg-[#1a237e]/40 hover:bg-[#1a237e]/60 text-white font-mono text-sm rounded-lg border border-white/10 transition-all duration-300"
                    >
                      Connect Wallet
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={() => handleChainClick(openChainModal)}
                      type="button"
                      className="w-full py-2.5 px-4 bg-red-500/40 hover:bg-red-500/60 text-white font-mono text-sm rounded-lg border border-white/10 transition-all duration-300"
                    >
                      Wrong network
                    </button>
                  );
                }

                return (
                  <div className="bg-[#1a237e]/20 rounded-lg p-3 flex items-center justify-between">
                    <button
                      onClick={openAccountModal}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span className="font-mono text-sm text-white/80">{account.displayName}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white/50"
                      >
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="text-white/50 hover:text-white/80 transition-colors flex items-center gap-2"
                    >
                      <span className="font-mono text-sm">Disconnect</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );

  return (
    <Sheet
      open={shouldShowSheet}
      onOpenChange={(open) => {
        if (!open && !isWalletModalOpen) {
          onClose();
        }
        setShouldShowSheet(open);
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-[900px] bg-[#1752F0] border-none p-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-white">Exclusive Digital Item Auction</SheetTitle>
          {currentAuctionId !== undefined && (
            <p className="text-sm text-white/70">Auction #{currentAuctionId.toString()}</p>
          )}
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Auction Status Section */}
          <div className="bg-[#1a237e]/20 rounded-lg p-4 space-y-3">
            <h3 className="font-mono text-lg text-white/90">Current Auction Status</h3>
            {isLoadingAuctionData ? (
              <p className="text-white/70">Loading auction data...</p>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">Time Remaining:</span>
                  <span className="font-mono text-lg text-white">{formattedTimeLeft}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">Current Highest Bid:</span>
                  <span className="font-mono text-lg text-white">{formattedBidAmount}</span>
                </div>
                {parsedResourceValue?.url && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Current URL:</span>
                    <a
                      href={parsedResourceValue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-blue-300 hover:underline truncate max-w-[50%]"
                    >
                      {parsedResourceValue.url}
                    </a>
                  </div>
                )}
                {parsedResourceValue?.metadata && parsedResourceValue.metadata !== 'N/A' && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Metadata:</span>
                    <span className="font-mono text-sm text-white/80 truncate max-w-[50%]">
                      {parsedResourceValue.metadata}
                    </span>
                  </div>
                )}
                {currentBidder && currentBidder !== '0x0000000000000000000000000000000000000000' && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Highest Bidder:</span>
                    <span className="font-mono text-sm text-white/80 truncate max-w-[50%]">
                      {currentBidder}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Wallet Connection and Bid Form Section */}
          <div className="bg-[#1a237e]/20 rounded-lg p-4 space-y-4">
            {renderWalletButton()}

            {isConnected && (
              <BidForm
                isApproved={!!allowanceData && allowanceData > 0n}
                onApproveClick={handleApproveClick}
                isApproving={isApproving}
                isBidding={isBidding}
                isConfirmingApproval={isConfirmingApproval}
                isConfirmingBid={isConfirmingBid}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}