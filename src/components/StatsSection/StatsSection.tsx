"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import "./StatsSection.css";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  prefix?: string;
}

const stats: StatItem[] = [
  { value: 43, suffix: " Quintillion", label: "Possible Combinations", prefix: "" },
  { value: 0.5, suffix: "s", label: "Average Solve Time", prefix: "<" },
  { value: 20, suffix: "", label: "Moves or Fewer (God's Number)", prefix: "≤" },
  { value: 99.8, suffix: "%", label: "Algorithm Accuracy", prefix: "" },
];

function AnimatedCounter({ value, suffix, prefix = "", duration = 2 }: { value: number; suffix: string; prefix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Number(current.toFixed(1)));
      }
    }, (duration * 1000) / steps);
    return () => clearInterval(timer);
  }, [inView, value, duration]);

  const display = Number.isInteger(value) ? Math.round(count) : count.toFixed(1);

  return (
    <span ref={ref} className="stat-value">
      {prefix}{display}{suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="stats-section">
      {/* Ambient glow */}
      <div className="stats-ambient-glow" aria-hidden="true" />

      <motion.div
        className="stats-header"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="stats-title">
          Built for <span className="stats-title-accent">Precision</span>
        </h2>
        <p className="stats-subtitle">
          Every millisecond counts. CUBEX pushes the boundaries of computational speed and accuracy.
        </p>
      </motion.div>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="stat-card"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.6,
              delay: i * 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="stat-card-glow" aria-hidden="true" />
            <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
            <span className="stat-label">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
