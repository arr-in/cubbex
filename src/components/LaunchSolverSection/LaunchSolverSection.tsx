"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "./LaunchSolverSection.css";

export default function LaunchSolverSection() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth 3D tilt tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 180 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
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
    <section
      id="launch-solver"
      className="launch-solver-section"
      aria-labelledby="launch-solver-heading"
    >
      <div className="launch-solver-ambient-glow" aria-hidden="true" />

      <div className="launch-solver-container">
        {/* Header HUD */}
        <motion.div
          className="launch-solver-header"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Authentic Rubik's Primary Palette Indicator */}
          <div className="primary-dots-badge">
            <span className="dot dot--red" />
            <span className="dot dot--blue" />
            <span className="dot dot--yellow" />
            <span className="dot dot--green" />
            <span className="dot dot--orange" />
            <span className="dot dot--white" />
            <span className="badge-label">KOCIEMBA 2-PHASE ALGORITHM</span>
          </div>

          <h2 id="launch-solver-heading" className="launch-solver-title">
            LAUNCH THE <span className="launch-solver-title-glow">SOLVER</span>
          </h2>

          <p className="launch-solver-subtitle">
            Enter the 3D interactive solving environment. From scrambled chaos to 
            theoretical minimum 20-move optimal solutions in real time.
          </p>
        </motion.div>

        {/* Minimal 3D Stage Card */}
        <motion.div
          ref={cardRef}
          className="launch-solver-card-container"
          initial={{ opacity: 0, y: 35, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: 1200 }}
        >
          <motion.div
            className="launch-solver-card"
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Minimal Image Render Container */}
            <div className="minimal-cube-stage">
              <Image
                src="/minimal_rubiks_cube.jpg"
                alt="Minimalist 3D Rubik's Cube with Primary Colors"
                fill
                priority
                className="minimal-cube-img"
                sizes="(max-width: 768px) 90vw, 850px"
              />
              <div className="minimal-stage-overlay" />

              {/* Minimal Color Facet Telemetry Overlay */}
              <div className="stage-telemetry">
                <div className="telemetry-pill">
                  <span className="telemetry-dot dot--blue" />
                  UPPER: BLUE
                </div>
                <div className="telemetry-pill">
                  <span className="telemetry-dot dot--red" />
                  FRONT: RED
                </div>
                <div className="telemetry-pill">
                  <span className="telemetry-dot dot--yellow" />
                  RIGHT: YELLOW
                </div>
                <div className="telemetry-pill">
                  <span className="telemetry-dot dot--green" />
                  BASE: GREEN
                </div>
              </div>
            </div>

            {/* Bottom HUD Bar */}
            <div className="launch-hud-bar">
              <div className="hud-info">
                <span className="hud-title">REAL-TIME 3D SOLVER</span>
                <span className="hud-desc">43 Quintillion States • 20 Moves Max</span>
              </div>

              {/* Launch CTA */}
              <motion.button
                onClick={handleLaunch}
                className="minimal-launch-btn"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Launch 3D Rubik's Cube Solver Engine"
              >
                <span>LAUNCH SOLVER ENGINE</span>
                <svg
                  width="18"
                  height="18"
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

        {/* Footnote */}
        <p className="launch-solver-footnote">
          Pressing Launch transfers control to the interactive 3D WebGL solver environment.
        </p>
      </div>
    </section>
  );
}
