"use client";

import { useEffect, useState } from "react";
import Reveal from "reveal.js";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/black.css";
import "./pitch-deck.css";
import Link from "next/link";
import { BouncingLogo } from "@/components/TerminalHero";
import Image from "next/image";

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
      <div style={{ position: 'absolute', top: 10, right: 16, zIndex: 1000 }}>
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
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
          <BouncingLogo />
        </div>
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
          <h2>The Solution: JesseXBT</h2>
          <ul style={{ fontSize: '1em' }}>
            <li className="fragment fade-in">AI-powered digital sidekick for builders</li>
            <li className="fragment fade-in">Trained on Jesse's writing, social, and video content</li>
            <li className="fragment fade-in">Delivers advice, talent qualification, and microgrants</li>
            <li className="fragment fade-in">Accessible via X, Farcaster, Telegram, Zora</li>
          </ul>
        </section>

        {/* How JesseXBT Works */}
        <section>
          <h2>How JesseXBT Works</h2>
          <ul style={{ fontSize: '1em' }}>
            <li className="fragment fade-in">Pre-training on Jesse's persona & expertise</li>
            <li className="fragment fade-in">Fine-tuning with dashboard feedback</li>
            <li className="fragment fade-in">Retrieval-Augmented Generation (RAG) for real-time knowledge</li>
            <li className="fragment fade-in">Continuous improvement via feedback loop</li>
          </ul>
        </section>

        {/* Dashboard & Feedback */}
        <section>
          <h2>Dashboard & Feedback</h2>
          <ul style={{ fontSize: '1em' }}>
            <li className="fragment fade-in">Review and improve agent responses</li>
            <li className="fragment fade-in">Manage microgrants and builder interactions</li>
            <li className="fragment fade-in">Analytics and insights for continuous growth</li>
          </ul>
        </section>

        {/* Real Impact */}
        <section>
          <h2>Real Impact</h2>
          <ul style={{ fontSize: '1em' }}>
            <li className="fragment fade-in">1000+ builders supported daily (goal)</li>
            <li className="fragment fade-in">Faster, fairer access to funding</li>
            <li className="fragment fade-in">More innovation, less bottleneck</li>
            <li className="fragment fade-in">A stronger, more inclusive Base community</li>
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
            <li className="fragment fade-in">Contact: @jessexbt on X, Farcaster, Telegram</li>
          </ul>
        </section>
      </div>
    </div>
  );
} 