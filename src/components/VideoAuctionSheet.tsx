"use client";

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../shadcn/sheet";
import Image from "next/image";
import { motion } from "framer-motion";

interface VideoAuctionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoAuctionSheet({ isOpen, onClose }: VideoAuctionSheetProps) {
  const [timeLeft, setTimeLeft] = useState("00:25:23");
  const currentBid = "52M $A0X";
  const currentBidUSD = "$169.78";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-4xl bg-[#121212] border border-[rgb(63,63,63)] p-6">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold text-white">Auction #50</SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left side - Video and Today's Winner */}
          <div className="space-y-6">
            <div className="bg-black rounded-lg p-4 aspect-square flex items-center justify-center overflow-hidden">
              <video
                src="/assets/jessicaxbt1.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover rounded"
              />
            </div>
            
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <h3 className="text-white text-lg font-semibold mb-4">🏆 Today's Winner 🏆</h3>
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                  <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
                  <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                </div>
                <span className="text-white/60 text-sm">contentment.fun</span>
              </div>
            </div>
          </div>

          {/* Right side - Bid Information */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white/60 text-sm">Current bid</h3>
                <div className="flex items-baseline space-x-2">
                  <span className="text-white text-3xl font-bold">{currentBid}</span>
                  <span className="text-white/60">({currentBidUSD})</span>
                </div>
              </div>
              <div>
                <h3 className="text-white/60 text-sm text-right">Time left</h3>
                <span className="text-white text-3xl font-bold">{timeLeft}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="57.2 or more"
                  className="flex-1 bg-[#1a1a1a] border border-[#333] rounded px-4 py-2 text-white"
                />
                <span className="text-white/60">M $A0X</span>
              </div>

              <input
                type="text"
                placeholder="URL"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded px-4 py-2 text-white"
              />

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition-colors">
                Place Bid
              </button>

              <div className="bg-[#1a1a1a] rounded p-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Current bid website:</span>
                  <a href="https://zora.co/@ledgerville" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                    zora.co/@ledgerville
                  </a>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-white/60">Highest bidder:</span>
                  <span className="text-white">@thecryptos.eth</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 