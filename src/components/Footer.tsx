"use client";

import Link from "next/link";
import Image from "next/image";
import { FaTelegram } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="relative z-20 bg-gradient-to-t from-[#111111] to-[#111111]/90 border-t border-white/10 w-full">
      <div className="max-w-7xl mx-auto px-4 w-full">
        {/* Main footer content */}
        <div className="flex flex-col items-center space-y-0 py-1 sm:grid sm:grid-cols-[1fr,auto,1fr] sm:gap-4 sm:items-center sm:space-y-2 sm:py-4 w-full">
          {/* Left - Controls with modern styling */}
          <div className="w-full flex flex-col items-center sm:justify-start sm:items-center mb-6 sm:mb-0">
            {/* On mobile, grid for main buttons */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-xs sm:flex sm:space-x-2 sm:gap-0 sm:max-w-none">
               <Link 
                href="/assets/JesseXBT ToS & Privacy Notice.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 col-span-1"
              >
                <span className="text-white/70 group-hover:text-white font-mono text-sm tracking-wider transition-all duration-300">TOS</span>
                <svg 
                  className="w-4 h-4 text-white/70 group-hover:text-white transform group-hover:translate-x-1 transition-all duration-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link 
                href="https://jessexbt.gitbook.io/jessexbt-docs/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 col-span-1"
              >
                <span className="text-white/70 group-hover:text-white font-mono text-sm tracking-wider transition-all duration-300">DOCS</span>
                <svg 
                  className="w-4 h-4 text-white/70 group-hover:text-white transform group-hover:translate-x-1 transition-all duration-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link 
                href="https://linktr.ee/jessexbt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 col-span-1"
              >
                <span className="text-white/70 group-hover:text-white font-mono text-sm tracking-wider transition-all duration-300">CONTACT</span>
                <svg 
                  className="w-4 h-4 text-white/70 group-hover:text-white transform group-hover:translate-x-1 transition-all duration-300" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
  
            </div>
          </div>

          {/* Right - Social Links with modern hover effects */}
          <div className="flex justify-center sm:justify-end items-center space-x-8 mt-6 mb-4 sm:mt-0 sm:mb-0">
            <Link href="https://x.com/JesseXBT_ai" target="_blank" rel="noopener noreferrer" className="group">
              <div className="relative">
                <Image
                  src="/assets/x.png"
                  alt="X"
                  width={24}
                  height={24}
                  className="opacity-80 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-125 group-hover:-translate-y-1"
                />
                <div className="absolute -bottom-1 left-1/2 w-6 h-0.5 bg-white transform -translate-x-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </div>
            </Link>
            <Link href="https://warpcast.com/jessexbt" target="_blank" rel="noopener noreferrer" className="group">
              <div className="relative">
                <Image
                  src="/assets/farcaster.png"
                  alt="Farcaster"
                  width={24}
                  height={24}
                  className="opacity-80 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-125 group-hover:-translate-y-1"
                />
                <div className="absolute -bottom-1 left-1/2 w-6 h-0.5 bg-white transform -translate-x-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </div>
            </Link>

            <Link href="https://t.me/jessexbt_basebot" target="_blank" rel="noopener noreferrer" className="group">
              <div className="relative">
                <FaTelegram className="w-6 h-6 text-white/80 group-hover:text-white transition-all duration-300 transform group-hover:scale-125 group-hover:-translate-y-1" />
                <div className="absolute -bottom-1 left-1/2 w-6 h-0.5 bg-white transform -translate-x-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </div>
            </Link>

          </div>

          {/* Desktop: supported by base and jesse pollak | built with love by a0x, all in one row */}
          <div className="hidden sm:flex flex-row items-center justify-end w-full space-x-3">
            <span className="text-white/60 font-mono text-base tracking-wider">
              supported by <a href="https://base.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">base</a> & <a href="https://x.com/jessepollak" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">jesse pollak</a>
            </span>
            <span className="text-white/60 font-mono text-base tracking-wider">|</span>
            <span className="text-white/60 font-mono text-base tracking-wider">
              built with <span className="inline-block align-middle">🤍</span> by <a href="https://a0x.co" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">a0x</a>
            </span>
          </div>
        </div>

        {/* Mobile: center both lines and remove the bar */}
        <div className="block sm:hidden w-full pt-2 pb-4">
          <div className="flex flex-col items-center justify-center space-y-1">
            <span className="text-white/60 font-mono text-xs tracking-wider text-center">
              supported by <a href="https://base.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">base</a> & <a href="https://x.com/jessepollak" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">jesse pollak</a>
            </span>
            <span className="text-white/60 font-mono text-xs tracking-wider text-center">
              built with <span className="inline-block align-middle">🤍</span> by <a href="https://a0x.co" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">a0x</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer; 