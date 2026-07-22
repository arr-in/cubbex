"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import styles from "./CubeRouteTransition.module.css";

const RUBIK_COLORS = ["#ffffff", "#ffd500", "#ff5800", "#c41e3a", "#009b48", "#0051ba"];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function CubeRouteTransition({
  mode,
  onCovered,
  onFinished,
}: {
  mode: "idle" | "covering" | "covered" | "revealing";
  onCovered: () => void;
  onFinished: () => void;
}) {
  const reduce = useReducedMotion();
  const [coveredOnce, setCoveredOnce] = useState(false);

  const grid = useMemo(() => {
    const cols = 10;
    const rows = 10;
    const rand = mulberry32(42);
    const tiles = Array.from({ length: cols * rows }, (_, i) => {
      const c = RUBIK_COLORS[Math.floor(rand() * RUBIK_COLORS.length)];
      const r = (rand() - 0.5) * 140;
      const dx = (rand() - 0.5) * 240;
      const dy = (rand() - 0.5) * 240;
      const s = 0.35 + rand() * 0.35;
      return { i, c, r, dx, dy, s };
    });
    return { cols, rows, tiles };
  }, []);

  useEffect(() => {
    if (reduce) {
      const t = setTimeout(() => {
        onCovered();
        setCoveredOnce(true);
      }, 260);
      return () => clearTimeout(t);
    }
  }, [onCovered, reduce]);

  const tileVariants = useMemo(() => {
    const easing = [0.22, 1, 0.36, 1] as const;
    return {
      hidden: (t: { r: number; dx: number; dy: number; s: number }) => ({
        opacity: 0,
        scale: t.s,
        rotateZ: t.r,
        x: t.dx,
        y: t.dy,
        filter: "blur(10px)",
      }),
      cover: {
        opacity: 1,
        scale: 1,
        rotateZ: 0,
        x: 0,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.82, ease: easing },
      },
      reveal: (t: { r: number; dx: number; dy: number; s: number }) => ({
        opacity: 0,
        scale: t.s,
        rotateZ: -t.r * 0.6,
        x: -t.dx * 0.8,
        y: -t.dy * 0.8,
        filter: "blur(14px)",
        transition: { duration: 0.7, ease: easing },
      }),
    };
  }, []);

  useEffect(() => {
    if (reduce) return;
    if (mode !== "covering") return;
    const t = setTimeout(() => {
      if (coveredOnce) return;
      setCoveredOnce(true);
      onCovered();
    }, 950);
    return () => clearTimeout(t);
  }, [coveredOnce, mode, onCovered, reduce]);

  useEffect(() => {
    if (mode !== "revealing") return;
    const t = setTimeout(onFinished, reduce ? 180 : 780);
    return () => clearTimeout(t);
  }, [mode, onFinished, reduce]);

  return (
    <motion.div
      className={styles.root}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      aria-hidden="true"
    >
      <div className={styles.backdrop} />

      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
        }}
      >
        {grid.tiles.map((t) => (
          <motion.div
            key={t.i}
            className={styles.tile}
            style={{ backgroundColor: t.c }}
            custom={{ r: t.r, dx: t.dx, dy: t.dy, s: t.s }}
            variants={tileVariants}
            initial="hidden"
            animate={mode === "revealing" ? "reveal" : "cover"}
            transition={{
              delay: reduce ? 0 : Math.min(0.35, (t.i % grid.cols) * 0.012 + Math.floor(t.i / grid.cols) * 0.008),
            }}
          />
        ))}
      </div>

      <motion.div
        className={styles.center}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{
          opacity: mode === "covering" || mode === "covered" ? 1 : 0,
          scale: mode === "covering" || mode === "covered" ? 1 : 0.96,
        }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.logoLine}>
          <span className={styles.kicker}>CUBEX</span>
          <span className={styles.dot} />
          <span className={styles.kickerMuted}>Solve</span>
        </div>
        <motion.div
          className={styles.cubeGlyph}
          animate={reduce ? {} : { rotateX: [0, 18, 0], rotateY: [0, 24, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className={styles.cubeFace} />
          <div className={styles.cubeFace} />
          <div className={styles.cubeFace} />
        </motion.div>
        <div className={styles.sub}>
          Assembling the state space…
          <span className={styles.subPulse} />
        </div>
      </motion.div>
    </motion.div>
  );
}

