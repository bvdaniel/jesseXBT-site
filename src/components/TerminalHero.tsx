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
      'X': 'https://x.com/jessepollakxbt',
      'Farcaster': 'https://warpcast.com/jessexbt',
      'Telegram': 'https://t.me/jessepollak_bot',
      'Zora': 'https://zora.co/@jessexbt'
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

const BouncingLogo = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
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

        // Add floating motion
        const floatX = Math.sin(Date.now() / 2000) * 2;
        const floatY = Math.cos(Date.now() / 1500) * 2;

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
  }, [mousePosition]);

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
        "Mi mission is to scale the number of builders that jessepollak can support from ~10-100 per day to ~1000+ per day, while delivering high quality support and increasing access to funding."
       },
    {
    username: "jesseXBT",
    message:
    "You can chat with me on X, Farcaster and Telegram, and also find my publications on Zora.",
    },
    {
      username: "jesseXBT",
      message: "I'm trained on jessepollak's writing, social media, videos and websites like base.org to have a deep knowledge base..."
    },
    {
    username: "agentbot",
    message: "Deploying..."
  }
  ];

  const conversations2 = [
    {
      username: "builder",
      message:
        "Your custommer service, influencers or fans in your community, powered by Ai-agents that can chat like a human and use natural language to solve questions ",
    },
    {
    username: "agentbot",
    message: "Loading AI agent infrastructure... Monitoring agent Activity...",
    },
    {
      username: "agentbot",
      message:
        "Training knowledge... Unique personalities... Connecting to data sources... ",
    },
    {
      username: "agentbot",
      message: "Connecting to X, Farcaster, Telegram, Website... Setting automations...",
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
    <div className="h-screen bg-[#1752F0] flex flex-col">
      <div className="relative flex flex-1">
        {/* Terminal Content */}
        <div
          ref={terminalRef}
          className="flex-1 font-mono text-white pt-24 sm:pt-32 md:pt-32 lg:pt-32 xl:pt-36 px-3 sm:px-6 md:px-12 lg:px-16 xl:px-24 pb-16 overflow-y-auto relative"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            backgroundColor: "#1752F0",
            fontSize: "13px",
            letterSpacing: "0.05em",
          }}
        >
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
                {line.username && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 sm:mb-0">
                    <span className="text-white/50 font-bold tracking-wider text-xs sm:text-sm">[{line.timestamp}]</span>
                    <span className="text-white font-bold tracking-wider text-xs sm:text-sm">{line.username}:</span>
                  </div>
                )}
                <TypeWriter 
                  text={line.message}
                  className={`${!line.username ? 'font-bold text-white tracking-wider text-[8px] xs:text-[10px] sm:text-xs md:text-sm whitespace-pre cursor-pointer' : 'text-white/90 pl-0 sm:pl-4 text-xs sm:text-sm md:text-base break-words'} flex items-center ${line.message.includes('Current Bid:') ? 'text-blue-300 font-bold' : ''} ${line.message.includes('Click here') ? 'text-blue-200 animate-pulse' : ''}`}
                  onClick={(!line.username && (line.message.includes('BID NOW') || line.message.includes('Current Bid:') || line.message.includes('Click here'))) ? handleBidVideo : undefined}
                />
              </motion.div>
            ))}
            {isPlaying && (
              <motion.span
                className="inline-block h-4 sm:h-5 w-1 sm:w-2 bg-white ml-2 sm:ml-4"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>
        </div>

        {/* Video Section */}
        <div className="hidden lg:block w-[400px] h-full relative">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/assets/jessexbt.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1752F0] via-transparent to-transparent" />
        </div>
      </div>

      {/* Modern Footer */}
      <div className="relative z-20 bg-gradient-to-t from-[#00008B] to-[#00008B]/90 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          {/* Main footer content */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-4 items-center py-4">
            {/* Left - Controls with modern styling */}
            <div className="flex justify-center sm:justify-start items-center">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="group flex items-center space-x-3 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-2 h-2 bg-white/70 rounded-full group-hover:bg-white group-hover:animate-pulse transition-all duration-300" />
                <span className="text-white/70 group-hover:text-white font-mono text-sm tracking-wider transition-all duration-300">PAUSE</span>
              </button>
            </div>

            {/* Center - Mission Link */}
            <div className="order-first sm:order-none mb-4 sm:mb-0">
              <Link 
                href="https://docs.google.com/document/d/1e1ok-cyJdm83ImQzlPshE8uDt4oci7uxaigGqqh_seA/edit?tab=t.0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
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
            </div>

            {/* Right - Social Links with modern hover effects */}
            <div className="flex justify-center sm:justify-end items-center space-x-8">
              <Link href="https://x.com/jessepollakxbt" target="_blank" rel="noopener noreferrer" className="group">
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

              <Link href="https://t.me/jessepollak_bot" target="_blank" rel="noopener noreferrer" className="group">
                <div className="relative">
                  <FaTelegram className="w-6 h-6 text-white/80 group-hover:text-white transition-all duration-300 transform group-hover:scale-125 group-hover:-translate-y-1" />
                  <div className="absolute -bottom-1 left-1/2 w-6 h-0.5 bg-white transform -translate-x-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              </Link>
  
              <Link href="https://zora.co/@jessexbt" target="_blank" rel="noopener noreferrer" className="group">
                <div className="relative">
                  <Image
                    src="/assets/zora.png"
                    alt="Zora"
                    width={24}
                    height={24}
                    className="opacity-80 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-125 group-hover:-translate-y-1"
                  />
                  <div className="absolute -bottom-1 left-1/2 w-6 h-0.5 bg-white transform -translate-x-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              </Link>
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
          background: rgba(23, 82, 240, 0.1);
        }

        ::-webkit-scrollbar-thumb {
          background: #1752F0;
          border-radius: 4px;
          border: 2px solid #00008B;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #1142c0;
        }

        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #1752F0 rgba(23, 82, 240, 0.1);
        }
      `}</style>
    </div>
  );
};

export default TerminalHero; 