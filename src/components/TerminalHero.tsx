"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { useChatSheet } from "@/context/ChatSheetContext";
import { FaTwitter, FaTelegram, FaLinkedin, FaInstagram, FaTiktok } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TerminalLine {
  id: string;
  username: string;
  message: string;
  timestamp: string;
}

const TypeWriter = ({ 
  text, 
  className,
  onClick 
}: { 
  text: string; 
  className: string;
  onClick?: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const char = text[currentIndex];
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + char);
        setCurrentIndex(c => c + 1);
        if (currentIndex === text.length - 1) {
          setIsComplete(true);
        }
      }, 15);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  const renderText = () => {
    if (!isComplete) return displayedText;

    // Replace social media mentions with links
    const socialLinks = {
      'X': 'https://x.com/JesseXBT_ai',
      'Farcaster': 'https://warpcast.com/jessexbt',
      'Telegram': 'https://t.me/jessexbt_basebot',
      'Zora': 'https://zora.co/@jessexbt',
      'Jesse Pollak': 'https://x.com/jessepollak'
    };

    let processedText = displayedText;
    Object.entries(socialLinks).forEach(([platform, url]) => {
      const regex = new RegExp(`\\b${platform}\\b`, 'g');
      processedText = processedText.replace(regex, `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-300 hover:text-blue-200 transition-colors duration-300">${platform}</a>`);
    });

    return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
  };

  return (
    <div className={className} onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
      {renderText()}
      {!isComplete && (
        <span className="inline-block w-2 h-4 ml-1 bg-white/80 animate-pulse" />
      )}
    </div>
  );
};

const BouncingLogo = ({ initialX = 0, initialY = 0, randomSeed = 0 }: { initialX?: number; initialY?: number; randomSeed?: number }) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!logoRef.current || !containerRef.current) return;

    const logo = logoRef.current;
    const container = containerRef.current;
    let animationFrameId: number;

    const updatePosition = () => {
      setPosition(prev => {
        // Calculate center of logo
        const logoRect = logo.getBoundingClientRect();
        const logoCenterX = prev.x + logoRect.width / 2;
        const logoCenterY = prev.y + logoRect.height / 2;

        // Calculate distance and direction to mouse
        const dx = mousePosition.x - logoCenterX;
        const dy = mousePosition.y - logoCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Add floating motion with random seed
        const now = Date.now();
        const floatX = Math.sin((now + randomSeed * 1000) / (1800 + randomSeed * 300)) * (2 + (randomSeed % 2));
        const floatY = Math.cos((now + randomSeed * 2000) / (1300 + randomSeed * 200)) * (2 + ((randomSeed + 1) % 2));

        // Calculate new position with mouse repulsion and floating
        let newX = prev.x + floatX;
        let newY = prev.y + floatY;

        // Add mouse repulsion when close
        if (distance < 200) {
          const repulsion = (200 - distance) / 20;
          newX -= (dx / distance) * repulsion;
          newY -= (dy / distance) * repulsion;
        }

        // Keep within bounds
        const containerRect = container.getBoundingClientRect();
        newX = Math.max(0, Math.min(newX, containerRect.width - logoRect.width));
        newY = Math.max(0, Math.min(newY, containerRect.height - logoRect.height));

        return { x: newX, y: newY };
      });

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const containerRect = container.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePosition, randomSeed]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden"
    >
      <motion.div
        ref={logoRef}
        className="absolute w-8 h-8 cursor-pointer"
        animate={{
          x: position.x,
          y: position.y,
          rotate: isHovered ? [0, 360] : [0, 0],
          scale: isHovered ? 1.2 : 1
        }}
        transition={{
          x: { duration: 0.1 },
          y: { duration: 0.1 },
          rotate: { duration: 1, repeat: Infinity, ease: "linear" },
          scale: { duration: 0.2 }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src="/assets/baselogo.png"
          alt="Base Logo"
          width={32}
          height={32}
          className="opacity-50 hover:opacity-100 transition-opacity duration-300"
        />
      </motion.div>
    </div>
  );
};

export { BouncingLogo };

const TerminalHero = () => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const { setTrigger, setIsOpen } = useChatSheet();
  const indexRef = useRef(0);
  const bannerStartedRef = useRef(false);
  const bannerIndexRef = useRef(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isAuctionOpen, setIsAuctionOpen] = useState(false);
  const [currentBid, setCurrentBid] = useState("0.00");


const bannerLines = [

"       _                    _  __ ____ ______",
"      (_)__  _____________ | |/ // __ )_  __/",
"     / / _  / ___/ ___/ _  |   // __  |/ /   ",
"    / /  __(__  |__  )  __/   |/ /_/ // /    ",
" __/ / ___/____/____/ ___/_/|_/_____//_/      ",
"/___/                                         ",                                                                                                                        
];   
                              
                              
                              

  const conversations = [
    {
      username: "jesseXBT",
      message:
        "i'm helping builders on base succeed with 24/7 high quality support and increasing access to funding."
       },
    {
      username: "jesseXBT",
      message:
        "you can chat with me on Telegram now to start getting support and feedback on your project.",
    },
    {
      username: "jesseXBT",
      message: "i'm trained on jesse pollak's writing, social media, videos, and websites like base.org to maintain a deep knowledge base."
    },
    {
    username: "agentbot",
    message: "Deploying..."
  }
  ];


  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { hour12: false });
  };

  const handleCreateAgent = () => {
    setTrigger("create_agent");
    setIsOpen(true);
  };

  const handleKnowMore = () => {
    router.push('/classic');
  };

  const handleBidVideo = () => {
    console.log('Opening auction sheet...');
    setIsAuctionOpen(true);
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let isActive = true;

    const addLine = () => {
      if (!isPlaying || !isActive) return;

      if (indexRef.current < conversations.length) {
        const timestamp = getTimestamp();
        const newLine = {
          ...conversations[indexRef.current],
          timestamp,
          id: `${timestamp}-${indexRef.current}`,
        };
        setLines((prev) => {
          if (prev.some((line) => line.id === newLine.id)) return prev;
          return [...prev, newLine];
        });
        indexRef.current++;
        // Shorter delays between lines
        const nextDelay = indexRef.current === 1 ? 1200 : 1600;
        timeout = setTimeout(addLine, nextDelay);
      } else if (!bannerStartedRef.current) {
        bannerStartedRef.current = true;
        timeout = setTimeout(addLine, 400); // Shorter delay before ASCII art
      } else if (bannerIndexRef.current < bannerLines.length) {
        const timestamp = getTimestamp();
        const newBannerLine = {
          username: "",
          message: bannerLines[bannerIndexRef.current],
          timestamp,
          id: `${timestamp}-banner-${bannerIndexRef.current}`,
        };
        setLines((prev) => {
          if (prev.some((line) => line.id === newBannerLine.id)) return prev;
          return [...prev, newBannerLine];
        });
        bannerIndexRef.current++;
        timeout = setTimeout(addLine, 100);
      } else {
        timeout = setTimeout(() => {
          if (!isActive) return;
          setLines([]);
          indexRef.current = 0;
          bannerStartedRef.current = false;
          bannerIndexRef.current = 0;
          setTimeout(addLine, 100);
        }, 15000); // Shorter delay before restart
      }
    };

    addLine();

    return () => {
      isActive = false;
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="h-screen bg-black flex flex-col justify-between">
      <div className="relative flex flex-1">
        {/* Terminal Content */}
        <div
          ref={terminalRef}
          className="flex-1 font-[JetBrains_Mono] text-white pt-8 sm:pt-16 md:pt-20 lg:pt-20 xl:pt-24 px-3 sm:px-6 md:px-12 lg:px-[56px] xl:px-[56px] pb-6 overflow-y-auto relative text-[16px] leading-[1.5] hide-scrollbar"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            backgroundColor: "#000000",
            fontSize: "16px",
            letterSpacing: "0.05em",
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {/* --- CTA: Start now button --- */}
          <div className="w-full flex justify-start mb-6 z-20 relative">
            <a
              href="https://t.me/jessexbt_basebot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-white text-black font-bold text-xl rounded-xl border-2 border-white px-8 py-4 transition-all duration-150 shadow-none hover:shadow-md hover:bg-gray-100 focus:outline-none font-[Space_Grotesk]"
            >
              <FaTelegram className="w-7 h-7 text-black" />
              Start now
              <svg className="w-5 h-5 ml-2 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 7l-10 10M17 7H7m10 0v10" /></svg>
            </a>
          </div>
          {/* --- END CTA --- */}
          {/* Scanline effect */}
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{
              background: 'linear-gradient(rgba(255,255,255,0.03) 50%, transparent 50%)',
              backgroundSize: '100% 4px',
              animation: 'scan 8s linear infinite'
            }}
          />

          {/* Bouncing Base Logo */}
          <BouncingLogo />

          {/* Terminal content */}
          <div className="relative z-10">
            {lines.map((line, index) => (
              <motion.div 
                key={line.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`${line.username ? 'mb-2 sm:mb-3 leading-relaxed' : 'leading-none'}`}
              >
                {!line.username ? (
                  <TypeWriter
                    text={line.message}
                    className={'font-bold text-white tracking-wider text-[8px] xs:text-[10px] sm:text-xs md:text-sm whitespace-pre cursor-pointer flex items-center'}
                    onClick={undefined}
                  />
                ) : line.username === "jesseXBT" && line.message === "i'm trained on jesse pollak's writing, social media, videos, and websites like base.org to maintain a deep knowledge base." ? (
                  <div className="hidden sm:block">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 sm:mb-0">
                      <span className="text-white/50 font-bold tracking-wider text-xs xs:text-sm sm:text-sm md:text-base lg:text-base xl:text-base">[{line.timestamp}]</span>
                      <span className="text-white font-bold tracking-wider text-xs xs:text-sm sm:text-sm md:text-base lg:text-base xl:text-base">{line.username}:</span>
                    </div>
                    <TypeWriter
                      text={line.message}
                      className={'pl-0 sm:pl-4 text-xs sm:text-sm md:text-lg lg:text-xl xl:text-xl break-words text-white/90 flex items-center'}
                      onClick={undefined}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 sm:mb-0">
                      <span className="text-white/40 font-bold tracking-wider text-[12px] font-[JetBrains_Mono]">[{line.timestamp}]</span>
                      <span className="text-white font-bold tracking-wider text-xs xs:text-sm sm:text-sm md:text-base lg:text-sm xl:text-sm">{line.username}:</span>
                    </div>
                    <TypeWriter
                      text={line.message}
                      className={'pl-0 sm:pl-4 text-xs sm:text-sm md:text-lg lg:text-lg xl:text-lg break-words text-white/90 flex items-center'}
                      onClick={undefined}
                    />
                  </>
                )}
              </motion.div>
            ))}
            {isPlaying && (
              <span className="inline-block h-4 sm:h-5 w-1 sm:w-2 bg-[#00f0ff] ml-2 sm:ml-4 animate-pulse-glow" />
            )}
          </div>
        </div>

        {/* Video Section */}
        <div className="hidden lg:block w-[400px] h-full relative">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/assets/jessecubes.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/assets/jesseXBT-poster.jpg"
          >
            <source src="/assets/jessecubes.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Modern Footer */}
      <div className="relative z-20 bg-gradient-to-t from-[#111111] to-[#111111]/90 border-t border-white/10 w-full">
        <div className="max-w-7xl mx-auto px-4 w-full">
          {/* Main footer content */}
          <div className="flex flex-col items-center space-y-0 py-1 sm:grid sm:grid-cols-[1fr,auto,1fr] sm:gap-4 sm:items-center sm:space-y-2 sm:py-4 w-full">
            {/* Left - Controls with modern styling */}
            <div className="w-full flex flex-col items-center sm:justify-start sm:items-center mb-6 sm:mb-0">
              {/* On mobile, grid for main buttons */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs sm:flex sm:space-x-2 sm:gap-0 sm:max-w-none">
                <Link 
                  href="https://docs.google.com/document/d/1e1ok-cyJdm83ImQzlPshE8uDt4oci7uxaigGqqh_seA/edit?tab=t.0" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 col-span-1"
                >
                  <span className="text-white/70 group-hover:text-white font-mono text-sm tracking-wider transition-all duration-300">MISSION</span>
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

      <style jsx global>{`
        @keyframes scan {
          from { transform: translateY(0); }
          to { transform: translateY(4px); }
        }
        @media (max-width: 640px) {
          .whitespace-pre {
            white-space: pre;
            font-size: 8px;
            letter-spacing: 0;
          }
        }
        @media (min-width: 641px) and (max-width: 768px) {
          .whitespace-pre {
            white-space: pre;
            font-size: 10px;
            letter-spacing: 0.02em;
          }
        }

        /* Custom Scrollbar Styles */
        ::-webkit-scrollbar {
          width: 10px;
          background: rgba(0, 0, 0, 0.1);
        }

        ::-webkit-scrollbar-thumb {
          background: #111111;
          border-radius: 4px;
          border: 2px solid #000000;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #222222;
        }

        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #111111 rgba(0, 0, 0, 0.1);
        }

        .ascii-art { @apply font-bold text-white text-[8px] xs:text-[10px] sm:text-xs md:text-sm whitespace-pre cursor-pointer; }
        .chat-line { @apply font-bold text-white text-lg xs:text-xl sm:text-2xl md:text-3xl flex items-center; }

        /* Custom CSS for .button-neon-glass, .hologram-glow, .animate-pulse-glow, .scroll-arrow */
        .button-neon-glass {
          position: relative;
          overflow: hidden;
        }

        .hologram-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.2) 0%, transparent 70%);
          pointer-events: none;
        }

        .animate-pulse-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.2) 0%, transparent 70%);
          pointer-events: none;
        }

        .scroll-arrow {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          z-index: 30;
        }

        .hide-scrollbar {
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default TerminalHero; 
