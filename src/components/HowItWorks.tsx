"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const BASE_BLUE = "#0052FF";

const instructions = [
  {
    number: 1,
    text: "say hi to jesseXBT on telegram, farcaster or X."
  },
  {
    number: 2,
    text: "send him your website/docs/miniapp/demo links and ask him for feedback."
  },
  {
    number: 3,
    text: "discuss and implement the recommendations."
  },
  {
    number: 4,
    text: "repeat for more feedback and growth as you unlock benefits on your builder journey."
  },
  {
    number: 5,
    text: "be in the top 10% of builders to get a warm intro to Jesse Pollak."
  },
];

const chatMessages = [
  {
    sender: "user",
    avatar: "/assets/avataruser.avif",
    time: "10:01",
    text: "hey jesse, can you check out my app? https://a0x.co",
  },
  {
    sender: "jesse",
    avatar: "/assets/jessexbtavatar.jpg",
    time: "10:02",
    text: "sure! here's my feedback:\nthe landing page is clear and fast.\nadd a FAQ for new users.\nalso consider a demo video for onboarding",
  },
  {
    sender: "user",
    avatar: "/assets/avataruser.avif",
    time: "10:03",
    text: "Thanks! I'll make those changes.",
  },
  {
    sender: "jesse",
    avatar: "/assets/jessexbtavatar.jpg",
    time: "10:04",
    text: "let me know when you're ready",
  },
];

function autoLink(text: string) {
  if (!text) return "";
  const urlRegex = /(https?:\/\/[\w.-]+(?:\.[\w\.-]+)+(?:[\w\-\._~:/?#[\]@!$&'()*+,;=]+)?)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-[#0052FF] hover:text-[#0052FF]/80 underline transition-colors duration-200">{part}</a>;
    }
    return part.split('\n').map((line, j) => j > 0 ? [<br key={j} />, line] : line);
  });
}

type TypewriterProps = { text: string; speed?: number; className?: string };
function Typewriter({ text, speed = 18, className }: TypewriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setIsComplete(false);
    let i = 0;
    if (typeof text !== "string" || !text) return;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed((prev) => prev + text[i]);
        i++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className={className}>
      {isComplete ? autoLink(text) : displayed}
      {!isComplete && (
        <span className="inline-block w-2 h-4 ml-1 bg-[#0052FF] animate-pulse" />
      )}
    </span>
  );
}

const HowItWorks = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-black py-24 overflow-hidden">
      {/* Dot matrix background */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.05) 2px, transparent 2px)`,
        backgroundSize: '48px 48px',
      }} />

      {/* 3D floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            y: [20, -20],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
          className="absolute w-[600px] h-[600px] -top-[300px] -right-[200px] rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(0,82,255,0.15), transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <motion.div
          animate={{
            y: [-20, 20],
            rotate: [360, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
          className="absolute w-[500px] h-[500px] -bottom-[200px] -left-[150px] rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(0,82,255,0.1), transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-[64px] md:text-[80px] font-bold text-white mb-6 tracking-[-0.02em]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            how it works
          </motion.h2>
        </div>

        {/* Main Content */}
        <div className="relative flex flex-col lg:flex-row items-start">
          {/* Steps Container - Now with narrower width */}
          <div className="w-full lg:w-[48%] z-10">
            {/* Steps */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="w-full"
            >
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-8 top-0 bottom-0 w-[1px]" 
                  style={{
                    background: 'linear-gradient(180deg, #0052FF 0%, rgba(0,82,255,0.1) 100%)',
                  }} 
                />
                
                {/* Steps list */}
                <div className="space-y-16">
                  {instructions.map((step, idx) => (
                    <motion.div
                      key={step.number}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      className="relative pl-16 md:pl-20"
                    >
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-[#0052FF]" />
                        <span className="absolute left-8 text-[#0052FF] text-[16px] md:text-[20px] font-bold tracking-tighter translate-y-[1px]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {String(step.number).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="pl-4 md:pl-8">
                        <p className="text-[20px] md:text-[24px] text-white/90 leading-[1.3] md:leading-[1.2] tracking-[-0.02em] break-words" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {step.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Chat Demo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="hidden lg:block absolute top-0 right-0 w-[48%]"
          >
            <div className="relative">
              {/* Glassmorphic container */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0052FF]/20 to-transparent rounded-2xl blur opacity-50"></div>
              <div className="relative bg-[#030712]/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 space-y-4">
                {chatMessages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-end gap-3`}
                  >
                    {msg.sender === "jesse" && (
                      <div className="flex-shrink-0 relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0052FF]/30 to-transparent rounded-full blur opacity-50"></div>
                        <Image
                          src={msg.avatar}
                          alt="JesseXBT avatar"
                          width={32}
                          height={32}
                          className="rounded-full relative border border-white/[0.08]"
                        />
                      </div>
                    )}
                    <div 
                      className={`max-w-[80%] ${
                        msg.sender === "user" 
                          ? "bg-[#0052FF]/[0.08] border-[#0052FF]/20" 
                          : "bg-[#030712]/60 border-white/[0.08]"
                      } backdrop-blur-xl px-4 py-3 rounded-2xl border`}
                    >
                      <Typewriter
                        text={msg.text}
                        className="text-white/90 text-base font-[JetBrains_Mono] leading-relaxed"
                        speed={16}
                      />
                      <div className="text-right mt-1">
                        <span className="text-white/40 text-xs font-[JetBrains_Mono]">{msg.time}</span>
                      </div>
                    </div>
                    {msg.sender === "user" && (
                      <div className="flex-shrink-0 relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0052FF]/30 to-transparent rounded-full blur opacity-50"></div>
                        <Image
                          src={msg.avatar}
                          alt="User avatar"
                          width={32}
                          height={32}
                          className="rounded-full relative border border-white/[0.08]"
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
