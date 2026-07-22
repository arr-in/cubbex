"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "./LaunchSolverSection.css";

export default function LaunchSolverSection() {
  const router = RouterHook();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position values for 3D tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleLaunch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cubex:playMicro"));
    }
    router.push("/solve");
  };

  return (
    <section className="launch-solver-section" aria-labelledby="launch-solver-heading">
      {/* Background ambient lighting */}
      <div className="launch-solver-glow launch-solver-glow--cyan" aria-hidden="true" />
      <div className="launch-solver-glow launch-solver-glow--purple" aria-hidden="true" />

      <div className="launch-solver-container">
        {/* Header HUD */}
        <motion.div
          className="launch-solver-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="launch-solver-badge">
            <span className="launch-solver-badge-dot" />
            <span className="launch-solver-badge-text">
              KOCIEMBA 2-PHASE ENGINE • READY
            </span>
          </div>

          <h2 id="launch-solver-heading" className="launch-solver-title">
            LAUNCH THE <span className="launch-solver-title-accent">SOLVER</span>
          </h2>

          <p className="launch-solver-subtitle">
            Experience sub-200ms neural state mapping and 3D real-time solution pathing. 
            Scrambled chaos to 20-move perfection in seconds.
          </p>
        </motion.div>

        {/* Interactive 3D Holographic Card */}
        <motion.div
          ref={cardRef}
          className="launch-solver-card-wrapper"
          initial={{ opacity: 0, scale: 0.92, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            perspective: 1000,
          }}
        >
          <motion.div
            className="launch-solver-card"
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Holographic Glare Overlay */}
            <div
              className="launch-solver-card-glare"
              style={{
                background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(72, 209, 255, 0.35), transparent 65%)`,
              }}
              aria-hidden="true"
            />

            {/* Corner Tech Brackets */}
            <div className="corner-bracket corner-bracket--tl" aria-hidden="true" />
            <div className="corner-bracket corner-bracket--tr" aria-hidden="true" />
            <div className="corner-bracket corner-bracket--bl" aria-hidden="true" />
            <div className="corner-bracket corner-bracket--br" aria-hidden="true" />

            {/* 3D Visual Asset Canvas Container */}
            <div className="launch-solver-image-container">
              <Image
                src="/launch_solver_3d_cube.jpg"
                alt="3D Holographic Rubik's Cube Solver Render"
                fill
                priority
                className="launch-solver-image"
                sizes="(max-width: 768px) 90vw, 800px"
              />
              <div className="launch-solver-image-overlay" />

              {/* Orbital Light Pulse Ring */}
              <div className="launch-solver-orbit-ring" aria-hidden="true">
                <div className="launch-solver-orbit-dot" />
              </div>
            </div>

            {/* HUD Glass Metrics Bar */}
            <div className="launch-solver-hud">
              <div className="hud-metric">
                <span className="hud-metric-val">200ms</span>
                <span className="hud-metric-lbl">NEURAL SCAN</span>
              </div>
              <div className="hud-divider" />
              <div className="hud-metric">
                <span className="hud-metric-val">20 MOVES</span>
                <span className="hud-metric-lbl">OPTIMAL PATH</span>
              </div>
              <div className="hud-divider" />
              <div className="hud-metric">
                <span className="hud-metric-val">60 FPS</span>
                <span className="hud-metric-lbl">3D RENDER</span>
              </div>
            </div>

            {/* Interactive Action Button inside the 3D Stage */}
            <div className="launch-solver-action">
              <motion.button
                onClick={handleLaunch}
                className="launch-solver-btn"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Launch interactive 3D solver application"
              >
                <span className="launch-solver-btn-glow" />
                <span className="launch-solver-btn-text">LAUNCH SOLVER ENGINE</span>
                <svg
                  className="launch-solver-btn-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          className="launch-solver-pills"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="launch-pill">
            <span className="launch-pill-icon">✨</span> Real-Time WebGL
          </div>
          <div className="launch-pill">
            <span className="launch-pill-icon">🧠</span> AI Camera Scan
          </div>
          <div className="launch-pill">
            <span className="launch-pill-icon">⚡</span> Zero Latency Solve
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function RouterHook() {
  return useRouter();
}
