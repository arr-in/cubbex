"use client";

import { motion } from "motion/react";
import "./FeaturesGrid.css";

const features = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="14" height="14" rx="3" stroke="url(#fg1)" strokeWidth="2" />
        <rect x="6" y="28" width="14" height="14" rx="3" stroke="url(#fg1)" strokeWidth="2" />
        <rect x="28" y="6" width="14" height="14" rx="3" stroke="url(#fg1)" strokeWidth="2" />
        <rect x="28" y="28" width="14" height="14" rx="3" stroke="url(#fg1)" strokeWidth="2" />
        <defs>
          <linearGradient id="fg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#48D1FF" />
            <stop offset="100%" stopColor="#7DD3C8" />
          </linearGradient>
        </defs>
      </svg>
    ),
    title: "AI-Powered Scanning",
    description:
      "Point your camera at any scrambled cube. Our neural network identifies all 54 facets in under 200ms with near-perfect accuracy.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" stroke="url(#fg2)" strokeWidth="2" />
        <path d="M24 4V24M6 14L24 24M42 14L24 24" stroke="url(#fg2)" strokeWidth="1.5" opacity="0.5" />
        <defs>
          <linearGradient id="fg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#B8A9FF" />
          </linearGradient>
        </defs>
      </svg>
    ),
    title: "3D State Mapping",
    description:
      "Each scan builds a complete 3D model of your cube's state, mapping every sticker position with spatial precision.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="18" stroke="url(#fg3)" strokeWidth="2" strokeDasharray="4 3" />
        <path d="M16 24L22 30L34 18" stroke="url(#fg3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="fg3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7DD3C8" />
            <stop offset="100%" stopColor="#48D1FF" />
          </linearGradient>
        </defs>
      </svg>
    ),
    title: "Optimal Solutions",
    description:
      "Using Kociemba's two-phase algorithm, CUBEX finds solutions within 20 moves — the theoretical minimum.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 34V14L24 6L40 14V34L24 42L8 34Z" stroke="url(#fg4)" strokeWidth="2" />
        <circle cx="24" cy="24" r="6" stroke="url(#fg4)" strokeWidth="2" />
        <path d="M24 18V6M24 42V30M18 21L8 14M40 14L30 21M18 27L8 34M40 34L30 27" stroke="url(#fg4)" strokeWidth="1" opacity="0.4" />
        <defs>
          <linearGradient id="fg4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#48D1FF" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    ),
    title: "Real-Time Visualization",
    description:
      "Watch each move animate on a 3D cube model in real-time. Follow along step by step at your own pace.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 36L24 8L36 36" stroke="url(#fg5)" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 28H32" stroke="url(#fg5)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="8" r="3" stroke="url(#fg5)" strokeWidth="1.5" />
        <defs>
          <linearGradient id="fg5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B8A9FF" />
            <stop offset="100%" stopColor="#48D1FF" />
          </linearGradient>
        </defs>
      </svg>
    ),
    title: "Algorithm Library",
    description:
      "Access a curated library of CFOP, Roux, and ZZ methods. Compare approaches and discover which path suits your style.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="32" height="32" rx="6" stroke="url(#fg6)" strokeWidth="2" />
        <path d="M18 24H30M24 18V30" stroke="url(#fg6)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="38" cy="10" r="5" fill="url(#fg6)" opacity="0.6" />
        <defs>
          <linearGradient id="fg6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7DD3C8" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    ),
    title: "Cross-Platform",
    description:
      "Works on any device, any browser. No installs needed — just open and solve. Built with the modern web in mind.",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="features-section">
      <div className="features-ambient" aria-hidden="true" />

      <motion.div
        className="features-header"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="features-title">
          Why <span className="features-title-accent">CUBEX</span>?
        </h2>
        <p className="features-subtitle">
          A fusion of advanced algorithms, real-time 3D rendering, and intuitive design.
        </p>
      </motion.div>

      <div className="features-grid">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            className="feature-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.5,
              delay: i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-card-title">{feature.title}</h3>
            <p className="feature-card-desc">{feature.description}</p>
            <div className="feature-card-shine" aria-hidden="true" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
