"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import "./Footer.css";

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="cubex-footer" aria-label="Site Footer">
      {/* Background ambient glow */}
      <div className="footer-glow" aria-hidden="true" />
      <div className="footer-line-divider" aria-hidden="true" />

      <div className="footer-container">
        {/* Top Header Grid */}
        <div className="footer-main-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <div className="footer-logo-badge">
              <span className="footer-dot dot--cyan" />
              <span className="footer-dot dot--purple" />
              <span className="footer-badge-text">SYSTEM CORE v2.4</span>
            </div>

            <h2 className="footer-title">
              CUBEX <span className="footer-title-glow">ENGINE</span>
            </h2>

            <p className="footer-description">
              An Awwwards-class Rubik&apos;s Cube solver combining real-time 3D WebGL rendering, 
              CIELAB median color vision, and Kociemba&apos;s optimal 2-phase algorithm.
            </p>
          </div>

            {/* Lead Designer & Architect Credit Card */}
            <div className="footer-architect-card">
              <div className="architect-header">
                <span className="architect-label">CREATIVE DEVELOPER &amp; ARCHITECT</span>
                <div className="architect-status">
                  <span className="status-ping" />
                  <span className="status-text">ONLINE</span>
                </div>
              </div>

              <div className="architect-name-wrap">
                <h3 className="architect-name">ARIN V JAIN</h3>
                <span className="architect-role-tag">STUDENT &amp; CREATIVE CODER</span>
              </div>

              <p className="architect-bio">
                Crafted with a passion for algorithms, mathematics, and high-performance 
                Awwwards-grade WebGL 3D web experiences.
              </p>

            <div className="architect-footer-tags">
              <span className="spec-tag">KOCIEMBA 2-PHASE</span>
              <span className="spec-tag">CIELAB MATRIX</span>
              <span className="spec-tag">WEBGL 3D</span>
            </div>
          </div>
        </div>

        {/* Middle Divider & Telemetry Strip */}
        <div className="footer-telemetry-strip">
          <div className="telemetry-item">
            <span className="telemetry-key">ALGORITHM</span>
            <span className="telemetry-val">KOCIEMBA 2-PHASE</span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-key">POSSIBILITIES</span>
            <span className="telemetry-val">43,252,003,274,489,856,000</span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-key">MAX MOVES</span>
            <span className="telemetry-val">20 (GOD&apos;S NUMBER)</span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-key">FRAMEWORK</span>
            <span className="telemetry-val">NEXT.JS 16 • THREE.JS</span>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Actions */}
        <div className="footer-bottom-bar">
          <div className="copyright-text">
            © {new Date().getFullYear()} <span className="highlight-white">CUBEX</span>. 
            DESIGNED &amp; BUILT BY <span className="highlight-author">ARIN V JAIN</span>.
          </div>

          <div className="footer-actions">
            <Link href="/solve" className="footer-cta-link">
              <span>LAUNCH SOLVER ENGINE</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>

            <button onClick={scrollToTop} className="footer-back-to-top" aria-label="Scroll back to top">
              <span>TOP</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
