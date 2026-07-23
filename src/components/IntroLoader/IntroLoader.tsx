"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./IntroLoader.css";

export default function IntroLoader() {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Prevent body scroll during intro loading
    document.body.style.overflow = "hidden";

    const duration = 2400; // 2.4s sleek animation
    const intervalTime = 24;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsComplete(true);
            document.body.style.overflow = "";
            setTimeout(() => setShouldRender(false), 900);
          }, 200);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => {
      clearInterval(timer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          className="intro-loader-stage"
          initial={{ opacity: 1 }}
          exit={{
            clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* Ambient Radial Background Glows */}
          <div className="intro-bg-glow glow-cyan" aria-hidden="true" />
          <div className="intro-bg-glow glow-purple" aria-hidden="true" />

          <div className="intro-content-container">
            {/* 3D Pure CSS Geometric Isometric Rubik's Cube */}
            <div className="cube-3d-wrapper" aria-hidden="true">
              <div className="cube-3d-scene">
                <div className="cube-3d-object">
                  {/* Front Face */}
                  <div className="cube-face face-front">
                    <span className="sticker sticker--green" />
                    <span className="sticker sticker--white" />
                    <span className="sticker sticker--green" />
                    <span className="sticker sticker--red" />
                    <span className="sticker sticker--green" />
                    <span className="sticker sticker--blue" />
                    <span className="sticker sticker--green" />
                    <span className="sticker sticker--yellow" />
                    <span className="sticker sticker--green" />
                  </div>
                  {/* Right Face */}
                  <div className="cube-face face-right">
                    <span className="sticker sticker--red" />
                    <span className="sticker sticker--blue" />
                    <span className="sticker sticker--red" />
                    <span className="sticker sticker--orange" />
                    <span className="sticker sticker--red" />
                    <span className="sticker sticker--green" />
                    <span className="sticker sticker--red" />
                    <span className="sticker sticker--white" />
                    <span className="sticker sticker--red" />
                  </div>
                  {/* Top Face */}
                  <div className="cube-face face-top">
                    <span className="sticker sticker--white" />
                    <span className="sticker sticker--yellow" />
                    <span className="sticker sticker--white" />
                    <span className="sticker sticker--blue" />
                    <span className="sticker sticker--white" />
                    <span className="sticker sticker--orange" />
                    <span className="sticker sticker--white" />
                    <span className="sticker sticker--red" />
                    <span className="sticker sticker--white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Typography Header */}
            <div className="intro-text-block">
              <motion.div
                className="intro-badge"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="badge-dot" />
                <span>SYSTEM INITIALIZING</span>
              </motion.div>

              <h1 className="intro-title">
                CUBEX <span className="title-gradient">ENGINE</span>
              </h1>

              <div className="intro-credit-line">
                <span className="credit-label">CREATIVE DEVELOPER</span>
                <span className="credit-name">ARIN V JAIN</span>
              </div>
            </div>

            {/* Telemetry Counter & Progress Bar */}
            <div className="intro-progress-block">
              <div className="progress-info-row">
                <span className="telemetry-text">
                  SYNTHESIZING KOCIEMBA 2-PHASE MATRIX...
                </span>
                <span className="progress-percentage">
                  {Math.floor(progress).toString().padStart(2, "0")}%
                </span>
              </div>

              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Grid Footnote */}
          <div className="intro-footer-hud">
            <span>43 QUINTILLION GEOMETRY</span>
            <span>•</span>
            <span>20 MOVES OPTIMAL</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
