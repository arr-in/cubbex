"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import "./ScrollProgress.css";

export default function ScrollProgress() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const { scrollYProgress } = useScroll();

  // Smooth physics spring for progress bar motion
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 35,
    restDelta: 0.001,
  });

  const percentage = useTransform(scrollYProgress, [0, 1], [0, 100]);

  useEffect(() => {
    const unsubscribe = percentage.on("change", (latest) => {
      const rounded = Math.round(latest);
      setScrollPercent(rounded);
      setIsVisible(rounded > 2);
    });

    return () => unsubscribe();
  }, [percentage]);

  return (
    <>
      {/* Top Fixed Progress Bar Line */}
      <motion.div
        className="scroll-progress-bar-fixed"
        style={{ scaleX }}
        aria-hidden="true"
      />

      {/* Floating HUD Scroll Counter Pill */}
      <motion.div
        className={`scroll-hud-pill ${isVisible ? "hud-visible" : "hud-hidden"}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
        transition={{ duration: 0.3 }}
      >
        <span
          className={`hud-status-dot ${
            scrollPercent >= 98 ? "dot-complete" : "dot-active"
          }`}
        />
        <span className="hud-label">
          {scrollPercent >= 98 ? "BOTTOM REACHED" : "SCROLL"}
        </span>
        <span className="hud-value">{scrollPercent}%</span>
      </motion.div>
    </>
  );
}
