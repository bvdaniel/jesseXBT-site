import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const sources = [
  { label: 'basebatches.xyz', angle: -60 },
  { label: 'launchonbase.xyz', angle: -30 },
  { label: 'paragraph.com/@bedrock', angle: 0 },
  { label: 'jessexbt-roadmap.pdf', angle: 30 },
  { label: 'twitter.com/jessepollak', angle: 60 },
  { label: 'docs.base.org', angle: 120 },
  { label: '@jessepollak', angle: 150 },
  { label: 'base.org', angle: 180 },
];

const center = { x: 400, y: 250 };
const radius = 170;

export default function KnowledgeGraphAnimation() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start(i => ({
      opacity: 1,
      x: center.x + radius * Math.cos((sources[i].angle * Math.PI) / 180) - center.x,
      y: center.y + radius * Math.sin((sources[i].angle * Math.PI) / 180) - center.y,
      transition: { delay: i * 0.25, duration: 0.7, type: 'spring', bounce: 0.3 },
    }));
  }, [controls]);

  return (
    <svg width={800} height={500} style={{ width: '100%', height: 'auto', maxWidth: 800, display: 'block', margin: '0 auto' }}>
      {/* Dotted grid background */}
      <defs>
        <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="#dbeafe" opacity="0.25" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="800" height="500" fill="#f8fafc" />
      <rect x="0" y="0" width="800" height="500" fill="url(#dots)" />

      {/* Central node */}
      <g>
        <rect x={center.x - 70} y={center.y - 32} width={140} height={64} rx={12} fill="#e0edff" stroke="#1752F0" strokeWidth={2} />
        <g>
          <rect x={center.x - 18} y={center.y - 18} width={36} height={36} rx={8} fill="#1752F0" />
          <text x={center.x} y={center.y + 6} textAnchor="middle" fontSize={22} fontWeight="bold" fill="#fff" fontFamily="monospace">🤖</text>
        </g>
        <text x={center.x} y={center.y + 38} textAnchor="middle" fontSize={22} fontWeight="bold" fill="#1752F0" fontFamily="Inter, sans-serif">jessexbt</text>
      </g>

      {/* Animated source nodes and lines */}
      {sources.map((source, i) => {
        const angleRad = (source.angle * Math.PI) / 180;
        const x2 = center.x + radius * Math.cos(angleRad);
        const y2 = center.y + radius * Math.sin(angleRad);
        return (
          <g key={source.label}>
            {/* Animated line */}
            <motion.line
              x1={center.x}
              y1={center.y}
              x2={x2}
              y2={y2}
              stroke="#1752F0"
              strokeDasharray="4 4"
              strokeWidth={2}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: i * 0.25, duration: 0.7 }}
            />
            {/* Animated node */}
            <motion.g
              custom={i}
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={controls}
            >
              <rect x={x2 - 90} y={y2 - 28} width={180} height={56} rx={10} fill="#fff" stroke="#b6d0fa" strokeWidth={2} />
              <text x={x2} y={y2 + 6} textAnchor="middle" fontSize={18} fontFamily="Inter, monospace" fill="#1752F0">{source.label}</text>
            </motion.g>
          </g>
        );
      })}

      {/* Add knowledge button (bottom right, pulsing) */}
      <motion.g
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        <rect x={650} y={420} width={140} height={48} rx={12} fill="#1752F0" />
        <text x={720} y={450} textAnchor="middle" fontSize={20} fontWeight="bold" fill="#fff" fontFamily="Inter, sans-serif">+ Add knowledge</text>
      </motion.g>
    </svg>
  );
} 