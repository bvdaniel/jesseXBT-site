"use client";

import { useEffect, useState, useRef } from "react";
import Reveal from "reveal.js";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/black.css";
import "./pitch-deck.css";
import Link from "next/link";
import { BouncingLogo } from "@/components/TerminalHero";
import Image from "next/image";
import KnowledgeGraphAnimation from "./KnowledgeGraphAnimation";
import React from "react";
import { motion } from "framer-motion";

export default function PitchDeck() {
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    const deck = new Reveal({
      controls: true,
      progress: true,
      center: true,
      hash: true,
      transition: "slide",
      backgroundTransition: "fade",
      width: "100%",
      height: "100%",
      margin: 0.04,
      minScale: 0.2,
      maxScale: 2.0,
      keyboard: true,
      touch: true,
      overview: true,
      autoPlayMedia: true,
      autoSlide: 0,
      loop: false,
      rtl: false,
      shuffle: false,
      fragments: true,
      fragmentInURL: true,
      embedded: false,
      help: true,
      showNotes: false,
      autoAnimate: false,
      disableLayout: false,
      pdfSeparateFragments: true,
      pdfMaxPagesPerSlide: 1,
      display: "block",
      hideInactiveCursor: true,
      hideCursorTime: 2000,
      mobileViewDistance: 3,
      viewDistance: 3,
      parallaxBackgroundImage: "",
      parallaxBackgroundSize: "",
      parallaxBackgroundHorizontal: null,
      parallaxBackgroundVertical: null
    });

    deck.initialize();

    // Add event listeners for slide changes
    deck.on('slidechanged', () => {
      setShowLogo(deck.getState().indexh === 0);
    });

    return () => {
      deck.destroy();
    };
  }, []);

  return (
    <div className="reveal">
      {/* Home Button */}
      <div className="pitchdeck-home-btn" style={{ position: 'absolute', top: 10, right: 16, zIndex: 1000 }}>
        <Link href="/" legacyBehavior>
          <a style={{
            display: 'inline-block',
            padding: '0',
            background: 'transparent',
            color: '#7a8bb7',
            fontWeight: 400,
            fontSize: '0.82em',
            textDecoration: 'none',
            border: 'none',
            transition: 'color 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.color = '#1752F0'; }}
          onMouseOut={e => { e.currentTarget.style.color = '#7a8bb7'; }}
          >
            ← Home
          </a>
        </Link>
      </div>

      {/* Bouncing Logo - Only visible on first slide */}
      {showLogo && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            <BouncingLogo key="logo1" initialX={40} initialY={80} randomSeed={1} />
          </div>
          <div style={{ position: 'absolute', top: 0, left: '50%', width: '50%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            <BouncingLogo key="logo2" initialX={200} initialY={300} randomSeed={2} />
          </div>
        </>
      )}

      {/* a0x watermark - bottom left, clickable, semi-transparent */}
      <a
        href="https://a0x.co"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          left: 24,
          bottom: 24,
          zIndex: 1001,
          opacity: 0.18,
          transition: 'opacity 0.2s',
        }}
        onMouseOver={e => { e.currentTarget.style.opacity = '0.38'; }}
        onMouseOut={e => { e.currentTarget.style.opacity = '0.18'; }}
        tabIndex={-1}
        aria-label="a0x.co"
      >
        <img
          src="/assets/a0x-logo.png"
          alt="a0x.co logo watermark"
          width={80}
          height={80}
          style={{ display: 'block', pointerEvents: 'auto' }}
        />
      </a>

      <div className="slides">
        {/* Title Slide */}
        <section>
          <h1>jesseXBT</h1>
          <div className="fragment fade-in" style={{ marginBottom: '1.5em', fontSize: '1.5em' }}>
            Scaling Builder Support
          </div>
        </section>

        {/* The Problem */}
        <section>
          <h2>The Problem</h2>
          <ul style={{ fontSize: '1em' }}>
            <li className="fragment fade-in">Builder support doesn't scale — too many requests, not enough time</li>
            <li className="fragment fade-in">Missed opportunities for high-potential builders</li>
            <li className="fragment fade-in">Funding and advice bottlenecked by human bandwidth</li>
            <li className="fragment fade-in">Community growth limited by 1:1 interactions</li>
          </ul>
        </section>

        {/* Our Vision */}
        <section>
          <h2>Our Vision</h2>
          <ul style={{ fontSize: '1em' }}>
            <li className="fragment fade-in">What if every builder could get Jesse's help, instantly?</li>
            <li className="fragment fade-in">Personal, high-quality support for 1000+ builders daily</li>
            <li className="fragment fade-in">Faster access to funding and resources</li>
            <li className="fragment fade-in">A thriving, global onchain builder community</li>
          </ul>
        </section>

        {/* The Solution: JesseXBT */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3em', width: '90vw', maxWidth: '1500px', margin: '0 auto', minHeight: '420px' }}>
            <div style={{ flex: 1, minWidth: 0, maxWidth: '48%' }}>
              <h2 style={{ textAlign: 'left', marginBottom: '0.7em' }}>The Solution: JesseXBT</h2>
              <ul style={{ fontSize: '1em', textAlign: 'left' }}>
                <li className="fragment fade-in">AI-powered digital sidekick for builders</li>
                <li className="fragment fade-in">Trained on Jesse's writing, social, and video content</li>
                <li className="fragment fade-in">Delivers advice, talent qualification, and microgrants</li>
                <li className="fragment fade-in">Accessible via X, Farcaster and Telegram.</li>
              </ul>
            </div>
            <div style={{ flex: 1, minWidth: 0, maxWidth: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 8px 32px rgba(23,82,240,0.10)', padding: '1.5em', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '380px' }}>
                <video
                  src="/assets/jesseXBT-idea.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ width: '100%', height: 'auto', borderRadius: '14px', boxShadow: '0 2px 12px rgba(23,82,240,0.08)' }}
                  aria-label="JesseXBT Idea video"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How JesseXBT Works */}
        <section>
          <div
            className="how-jessexbt-works-slide"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2em',
              width: '90vw',
              maxWidth: '1500px',
              margin: '0 auto',
              minHeight: '420px',
              flexDirection: 'row',
            }}
          >
            <div
              className="how-jessexbt-works-text"
              style={{ fontSize: '1em', flex: 1, minWidth: 0, maxWidth: '48%' }}
            >
              <h2 style={{ textAlign: 'left', marginBottom: '0.7em' }}>How JesseXBT Works</h2>
              <ul>
                <li className="fragment fade-in">Pre-training on Jesse's persona & expertise</li>
                <li className="fragment fade-in">Fine-tuning with dashboard feedback</li>
                <li className="fragment fade-in">Retrieval-Augmented Generation (RAG) for real-time knowledge</li>
                <li className="fragment fade-in">Continuous improvement via feedback loop</li>
              </ul>
            </div>
            <div
              className="how-jessexbt-works-image"
              style={{ flex: 1, minWidth: 0, maxWidth: '52%', display: 'flex', justifyContent: 'center' }}
            >
              <img
                src="/assets/fine tuning jesse.webp"
                alt="Fine tuning Jesse"
                style={{ width: '100%', height: 'auto', maxWidth: '600px', maxHeight: '70vh', borderRadius: '16px', boxShadow: '0 4px 32px rgba(0,0,0,0.10)' }}
              />
            </div>
          </div>
        </section>

        {/* Dashboard & Feedback */}
        <section>
          <div
            className="dashboard-feedback-slide"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3em',
              width: '90vw',
              maxWidth: '1500px',
              margin: '0 auto',
              minHeight: '420px',
              flexDirection: 'row',
            }}
          >
            <div
              className="dashboard-feedback-text"
              style={{ flex: 1, minWidth: 0, maxWidth: '48%' }}
            >
              <h2 style={{ textAlign: 'left', marginBottom: '0.7em' }}>Dashboard & Feedback</h2>
              <ul style={{ fontSize: '1em', textAlign: 'left' }}>
                <li className="fragment fade-in">Review and improve agent responses</li>
                <li className="fragment fade-in">Manage microgrants and builder interactions</li>
                <li className="fragment fade-in">Analytics and insights for continuous growth</li>
              </ul>
            </div>
            <div
              className="dashboard-feedback-carousel"
              style={{ flex: 1, minWidth: 0, maxWidth: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <DashboardCarousel />
            </div>
          </div>
        </section>

        {/* Real Impact */}
        <section>
          <div style={{ position: 'relative', width: '100%', minHeight: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <h2>Real Impact</h2>
            <ul style={{ fontSize: '1em', marginBottom: '2em', position: 'relative', zIndex: 2 }}>
              <li className="fragment fade-in">1000+ builders supported daily (goal)</li>
              <li className="fragment fade-in">Faster, fairer access to funding</li>
              <li className="fragment fade-in">More innovation, less bottleneck</li>
              <li className="fragment fade-in">A stronger, more inclusive Base community</li>
            </ul>
          </div>
        </section>

           {/* Vision for the Future */}
           <section>
          <h2>Vision for the Future</h2>
          <ul style={{ fontSize: '1em' }}>
            <li className="fragment fade-in">Increased awareness of crypto, tech, and Base developments</li>
            <li className="fragment fade-in">Sharper answers to provide the best feedback</li>
            <li className="fragment fade-in">Ability to test products directly</li>
            <li className="fragment fade-in">Analyze more context for deeper insights</li>
          </ul>
        </section>

        {/* Why Now: Base Batches Context */}
        <section>
          <h2>Why Now?</h2>
          <ul style={{ fontSize: '1em' }}>
            <li className="fragment fade-in">Base Batches: the perfect launchpad to scale JesseXBT's impact</li>
            <li className="fragment fade-in">Access to top builders, mentors, and resources</li>
            <li className="fragment fade-in">Accelerating our mission to empower every builder on Base</li>
          </ul>
        </section>

        {/* Call to Action */}
        <section>
          <h2>Join Us</h2>
          <ul style={{ fontSize: '1em' }}>
            <li className="fragment fade-in">Help us build the future of onchain builder support</li>
            <li className="fragment fade-in">Collaborate, support, or try JesseXBT</li>
            <li className="fragment fade-in">
              Follow @jessexbt on 
              <a href="https://x.com/jessepollakxbt" target="_blank" rel="noopener noreferrer" style={{ color: '#7a8bb7', textDecoration: 'underline', margin: '0 0.3em' }}>X</a>,
              <a href="https://warpcast.com/jessexbt" target="_blank" rel="noopener noreferrer" style={{ color: '#7a8bb7', textDecoration: 'underline', margin: '0 0.3em' }}>Farcaster</a>,
              and
              <a href="https://t.me/jessepollak_bot" target="_blank" rel="noopener noreferrer" style={{ color: '#7a8bb7', textDecoration: 'underline', margin: '0 0.3em' }}>Telegram</a>
            </li>
          </ul>
        </section>

     
      </div>
    </div>
  );
}

// Carousel component for Dashboard & Feedback slide
function DashboardCarousel() {
  const images = [
    { src: "/assets/feedback ui.png", alt: "Feedback UI" },
    { src: "/assets/jesse character.png", alt: "JesseXBT Character" },
    { src: "/assets/grant jesse.png", alt: "Code Evaluation" },
  ];
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 900);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Carousel logic (always call, but skip if mobile)
  useEffect(() => {
    if (isMobile) return;
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % images.length);
        setFade(true);
      }, 250);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length, isMobile]);

  const handleDotClick = (i: number) => {
    if (i === index) return;
    setFade(false);
    setTimeout(() => {
      setIndex(i);
      setFade(true);
    }, 250);
  };

  // Only render carousel on desktop
  if (isMobile) {
    return null;
  }

  return (
    <div className="dashboard-card">
      <div style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '2em' }}>
        <img
          src={images[index].src}
          alt={images[index].alt}
          style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '14px', boxShadow: '0 2px 12px rgba(23,82,240,0.08)', opacity: fade ? 1 : 0, transition: 'opacity 0.4s' }}
        />
      </div>
      <div style={{ marginTop: '0.7em', color: '#1752F0', fontSize: '1.1em', opacity: 0.7, textAlign: 'center', minHeight: '1.5em' }}>
        {images[index].alt}
      </div>
      <div style={{ display: 'flex', gap: '0.5em', marginTop: '0.3em', marginBottom: '2.2em', justifyContent: 'center' }}>
        {images.map((img, i) => (
          <button
            key={img.src}
            onClick={() => handleDotClick(i)}
            style={{ width: 12, height: 12, borderRadius: '50%', background: i === index ? '#1752F0' : '#b6d0fa', border: 'none', cursor: 'pointer', opacity: 0.7 }}
            aria-label={`Show ${img.alt}`}
          />
        ))}
      </div>
    </div>
  );
}

// Animated bouncing Base logos for Real Impact slide
function BouncingLogoCluster() {
  const [count, setCount] = useState(1);
  const fragmentListenerRef = useRef(false);

  useEffect(() => {
    function updateCount() {
      const visible = document.querySelectorAll('.reveal .slides .present .fragment.visible').length;
      setCount(Math.max(1, visible));
    }
    if (!fragmentListenerRef.current && typeof window !== 'undefined' && window.Reveal) {
      window.Reveal.addEventListener('fragmentshown', updateCount);
      window.Reveal.addEventListener('fragmenthidden', updateCount);
      fragmentListenerRef.current = true;
    }
    updateCount();
    return () => {
      if (window.Reveal) {
        window.Reveal.removeEventListener('fragmentshown', updateCount);
        window.Reveal.removeEventListener('fragmenthidden', updateCount);
      }
    };
  }, []);

  // Growth: more logos per fragment
  const logoCounts = [10, 40, 100, 200];
  const showCount = logoCounts[Math.max(0, Math.min(count - 1, logoCounts.length - 1))];

  // Arrange logos in a dense grid
  const gridCols = Math.ceil(Math.sqrt(showCount));
  const gridRows = Math.ceil(showCount / gridCols);
  const grid = Array.from({ length: showCount });

  return (
    <div style={{ position: 'relative', width: gridCols * 18, height: gridRows * 18 + 20, marginTop: 10 }}>
      {grid.map((_, i) => {
        const col = i % gridCols;
        const row = Math.floor(i / gridCols);
        // Staggered pop-in delay for wave effect
        return (
          <MiniBouncingLogo key={i} x={col * 18 + 9} y={row * 18 + 9} randomSeed={i + 1} delay={i * 0.01} />
        );
      })}
    </div>
  );
}

function MiniBouncingLogo({ x, y, randomSeed, delay = 0 }: { x: number; y: number; randomSeed: number; delay?: number }) {
  const [pos, setPos] = useState({ x, y });
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay * 1000);
    let frame: number;
    function animate() {
      const now = Date.now();
      const floatX = Math.sin((now + randomSeed * 1000) / (1200 + randomSeed * 200)) * 4;
      const floatY = Math.cos((now + randomSeed * 2000) / (900 + randomSeed * 150)) * 4;
      setPos({ x: x + floatX, y: y + floatY });
      frame = requestAnimationFrame(animate);
    }
    if (visible) animate();
    return () => { clearTimeout(t); cancelAnimationFrame(frame); };
  }, [x, y, randomSeed, delay, visible]);
  return (
    <img
      src="/assets/baselogo.png"
      alt="Base Logo"
      width={14}
      height={14}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        transform: 'translate(-50%, -50%)',
        filter: 'drop-shadow(0 1px 3px rgba(23,82,240,0.12))',
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s, transform 0.3s',
      }}
    />
  );
}

function FireworkBouncingLogos() {
  const [count, setCount] = useState(1);
  const [fireworkKey, setFireworkKey] = useState(0);
  const fragmentListenerRef = useRef(false);
  const slideListenerRef = useRef(false);

  // Helper to check if we're on the Real Impact slide
  function isRealImpactSlide() {
    const slide = document.querySelector('.reveal .slides .present');
    return slide && slide.querySelector('h2')?.textContent?.includes('Real Impact');
  }

  useEffect(() => {
    function updateCount() {
      const visible = document.querySelectorAll('.reveal .slides .present .fragment.visible').length;
      setCount(Math.max(1, visible));
    }
    if (!fragmentListenerRef.current && typeof window !== 'undefined' && window.Reveal) {
      window.Reveal.addEventListener('fragmentshown', updateCount);
      window.Reveal.addEventListener('fragmenthidden', updateCount);
      fragmentListenerRef.current = true;
    }
    updateCount();
    return () => {
      if (window.Reveal) {
        window.Reveal.removeEventListener('fragmentshown', updateCount);
        window.Reveal.removeEventListener('fragmenthidden', updateCount);
      }
    };
  }, []);

  // Restart animation when slide becomes active or Reveal is ready
  useEffect(() => {
    function resetFirework() {
      if (isRealImpactSlide()) {
        setFireworkKey(k => k + 1);
      }
    }
    if (!slideListenerRef.current && typeof window !== 'undefined' && window.Reveal) {
      window.Reveal.addEventListener('slidechanged', resetFirework);
      window.Reveal.addEventListener('ready', resetFirework);
      slideListenerRef.current = true;
    }
    return () => {
      if (window.Reveal) {
        window.Reveal.removeEventListener('slidechanged', resetFirework);
        window.Reveal.removeEventListener('ready', resetFirework);
      }
    };
  }, []);

  // Also reset animation if fragment count resets (e.g., when going back)
  useEffect(() => {
    if (count === 1 && isRealImpactSlide()) {
      setFireworkKey(k => k + 1);
    }
  }, [count]);

  // Only do fireworks on the last fragment
  const isFirework = count >= 4;
  const logoCount = isFirework ? 120 : 0;
  return (
    <div key={fireworkKey + '-' + count} style={{ position: 'relative', width: 600, height: 260, marginTop: 10 }}>
      {isFirework && Array.from({ length: logoCount }).map((_, i) => (
        <FireworkLogo key={i} idx={i} total={logoCount} />
      ))}
    </div>
  );
}

function FireworkLogo({ idx, total }: { idx: number; total: number }) {
  const [pos, setPos] = useState({ x: 300, y: 220 });
  const [vel, setVel] = useState({ vx: 0, vy: 0 });
  const [launched, setLaunched] = useState(false);
  const [bounces, setBounces] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Random launch angle and speed
    const angle = Math.PI * (0.2 + 0.6 * (idx / total)) + (Math.random() - 0.5) * 0.2;
    const speed = 7 + Math.random() * 3;
    setVel({ vx: Math.cos(angle) * speed, vy: -Math.abs(Math.sin(angle) * speed) - 7 });
    setTimeout(() => setLaunched(true), 200 + idx * 4);
  }, [idx, total]);

  useEffect(() => {
    if (!launched) return;
    let frame: number;
    function animate() {
      setPos(prev => {
        let { x, y } = prev;
        let { vx, vy } = vel;
        vy += 0.28; // gravity
        x += vx;
        y += vy;
        // Bounce on floor
        if (y > 240) {
          y = 240;
          vy = -vy * 0.55;
          vx = vx * 0.92;
          if (Math.abs(vy) < 1.2) vy = 0;
          if (Math.abs(vx) < 0.2) vx = 0;
        }
        setVel({ vx, vy });
        return { x, y };
      });
      frame = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, [launched]);

  return (
    <img
      src="/assets/baselogo.png"
      alt="Base Logo"
      width={16}
      height={16}
      onLoad={() => setImageLoaded(true)}
      onError={(e) => console.error('Failed to load Base logo:', e)}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        transform: 'translate(-50%, -50%)',
        filter: 'drop-shadow(0 1px 3px rgba(23,82,240,0.12))',
        pointerEvents: 'none',
        opacity: launched && imageLoaded ? 1 : 0,
        transition: 'opacity 0.3s',
        backgroundColor: 'transparent',
      }}
    />
  );
} 