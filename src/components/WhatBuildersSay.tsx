"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const testimonials = [
  {
    name: "jesse.base.eth",
    handle: "@jessepollak",
    date: "Jun 16, 2025",
    content: "everyone should connect with jesseXBT",
    avatar: "/assets/jesse-avatar.jpg",
    comments: 2,
    retweets: 35,
    likes: 113
  },
  {
    name: "VMF Coin",
    handle: "@VMF",
    date: "Jun 18, 2025",
    content: "love jesseXBT, its really working out well for me, using all the feedback to build.",
    avatar: "/assets/test1.jpg",
    comments: 5,
    retweets: 20,
    likes: 80
  },
  {
    name: "goyaben",
    handle: "@goyaben",
    date: "Jun 19, 2025",
    content: "I've been using it, very cool. Actually helpful.",
    avatar: "/assets/test2.jpg",
    comments: 1,
    retweets: 10,
    likes: 50
  },
  {
    name: "ReKs | LINK",
    handle: "@ReKs",
    date: "Jun 20, 2025",
    content: "JesseXBT is great! the language was similar to how jesse tweets so that's great.",
    avatar: "/assets/test3.jpg",
    comments: 3,
    retweets: 15,
    likes: 60
  },
  {
    name: "XAlpha AI",
    handle: "@XAlphaAI",
    date: "Jun 21, 2025",
    content: "A big shoutout to A0x for making Jesse accesible to everyone by building jesseXBT.",
    avatar: "/assets/test4.jpg",
    comments: 4,
    retweets: 25,
    likes: 90
  }
];

export default function WhatBuildersSay() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const testimonial = testimonials[index];
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const next = () => {
    setDirection(1);
    setIndex((i) => (i + 1) % testimonials.length);
  };
  const prev = () => {
    setDirection(-1);
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);
  const handleFocus = () => setIsPaused(true);
  const handleBlur = () => setIsPaused(false);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        x: { type: "spring", stiffness: 60, damping: 20 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.3 },
        rotateY: { duration: 0.4 }
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? -45 : 45,
    }),
  };

  return (
    <section className="relative flex flex-col items-center justify-start sm:justify-center bg-black py-8 sm:py-24 overflow-hidden min-h-0 sm:min-h-screen">
      {/* Dot matrix background */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.05) 2px, transparent 2px)`,
        backgroundSize: '48px 48px',
      }} />

      {/* 3D floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            y: [-20, 20],
            rotate: [0, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
          className="absolute w-[800px] h-[800px] -top-[400px] -left-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(0,82,255,0.12), transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <motion.div
          animate={{
            y: [20, -20],
            rotate: [360, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
          className="absolute w-[600px] h-[600px] -bottom-[200px] -right-[200px] rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(0,82,255,0.08), transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-[40px] sm:text-[64px] md:text-[80px] font-bold text-white tracking-[-0.02em]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            what builders say
          </motion.h2>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative perspective-[2000px] mb-12 sm:mb-24">
          <AnimatePresence custom={direction} mode="wait" initial={false}>
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full flex justify-center items-center"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onFocus={handleFocus}
              onBlur={handleBlur}
              tabIndex={0}
              style={{ 
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
              }}
            >
              {/* Card */}
              <div className="w-full max-w-xl mx-auto">
                <div className="relative group h-[420px] sm:h-[480px] flex flex-col">
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0052FF]/20 to-transparent rounded-2xl blur opacity-50 group-hover:opacity-70 transition duration-1000"></div>
                  
                  {/* Card content */}
                  <div className="relative bg-[#030712]/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto hide-scrollbar">
                    {/* Header */}
                    <div className="flex flex-col gap-3 mb-5 sm:mb-6">
                      {/* Avatar */}
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0052FF]/30 to-transparent rounded-full blur opacity-50"></div>
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          width={40}
                          height={40}
                          className="rounded-full relative border border-white/[0.08]"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight max-w-[70%]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                            {testimonial.name}
                          </h3>
                          <span className="text-white/40 font-[JetBrains_Mono] text-xs whitespace-nowrap ml-2">
                            {testimonial.date}
                          </span>
                        </div>
                        <a 
                          href={`https://x.com/${testimonial.handle.slice(1)}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[#0052FF] hover:text-[#0052FF]/80 font-[JetBrains_Mono] text-sm transition-colors duration-200"
                        >
                          {testimonial.handle}
                        </a>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-[28px] sm:text-[32px] md:text-[36px] text-white mb-8 leading-[1.2] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {testimonial.content}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center gap-6 text-white/60">
                      <span className="flex items-center gap-2 text-sm font-[JetBrains_Mono]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {testimonial.comments}
                      </span>
                      <span className="flex items-center gap-2 text-sm font-[JetBrains_Mono]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {testimonial.retweets}
                      </span>
                      <span className="flex items-center gap-2 text-sm font-[JetBrains_Mono]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {testimonial.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation - Now positioned absolutely */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[-48px] sm:bottom-[-80px] flex justify-center gap-4 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={prev}
              className="w-12 h-12 sm:w-12 sm:h-12 rounded-full bg-[#0052FF] flex items-center justify-center text-white hover:bg-[#0052FF]/90 transition-colors duration-300"
            >
              ←
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={next}
              className="w-12 h-12 sm:w-12 sm:h-12 rounded-full bg-black/40 border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:border-[#0052FF] transition-all duration-300 backdrop-blur-xl"
            >
              →
            </motion.button>
          </div>
        </div>

        {/* Add bottom padding to account for absolute positioned navigation */}
        <div className="h-16 sm:h-24"></div>
      </div>
    </section>
  );
} 