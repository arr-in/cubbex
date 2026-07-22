"use client";

import { motion } from "motion/react";
import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    title: "Scan Your Cube",
    description:
      "Hold your scrambled cube up to the camera. Our AI identifies every color on every face in milliseconds.",
    accent: "#48D1FF",
  },
  {
    number: "02",
    title: "Algorithm Computes",
    description:
      "Kociemba's two-phase algorithm crunches through billions of states to find the shortest solve path.",
    accent: "#8b5cf6",
  },
  {
    number: "03",
    title: "Follow the Moves",
    description:
      "Step-by-step animated instructions guide you through each twist. Solve at your own pace, perfectly.",
    accent: "#7DD3C8",
  },
];

export default function HowItWorks() {
  return (
    <section className="hiw-section">
      {/* Ambient aurora */}
      <div className="hiw-aurora" aria-hidden="true">
        <div className="hiw-aurora-blob hiw-aurora-blob--1" />
        <div className="hiw-aurora-blob hiw-aurora-blob--2" />
      </div>

      <motion.div
        className="hiw-header"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="hiw-title">
          How It <span className="hiw-title-accent">Works</span>
        </h2>
        <p className="hiw-subtitle">
          Three simple steps from scrambled chaos to solved perfection.
        </p>
      </motion.div>

      <div className="hiw-steps">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            className="hiw-step"
            initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.6,
              delay: i * 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div
              className="hiw-step-number"
              style={{
                background: `linear-gradient(135deg, ${step.accent}, transparent)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {step.number}
            </div>
            <div className="hiw-step-content">
              <h3 className="hiw-step-title">{step.title}</h3>
              <p className="hiw-step-desc">{step.description}</p>
            </div>
            <div
              className="hiw-step-line"
              style={{ background: `linear-gradient(to bottom, ${step.accent}33, transparent)` }}
              aria-hidden="true"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
