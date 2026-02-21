"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import CubexHero from "@/components/CubexHero";
import Cubes from "@/components/Cubes/Cubes";
import ScrollReveal from "@/components/ScrollReveal/ScrollReveal";
import HeroAfterSection from "@/components/HeroAfterSection";

// Dynamically import PixelSnow to avoid SSR issues with WebGL
const PixelSnow = dynamic(() => import("@/components/PixelSnow/PixelSnow"), {
  ssr: false,
});

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [snowVisible, setSnowVisible] = useState(false);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    // Snow fades in once the hero has scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => setSnowVisible(!entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    // No bg-black here — body in globals.css is already #000
    <main className="w-full min-h-screen" style={{ position: "relative" }}>

      {/*
        PixelSnow lives at z-index: 1 — above the body's black background
        but BELOW all page content (which is at z-index: 2+).
        pointer-events: none so it never blocks clicks.
        Fades in smoothly once the hero section scrolls out of view.
      */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          opacity: snowVisible ? 1 : 0,
          transition: "opacity 1s ease",
        }}
      >
        <PixelSnow
          color="#ffffff"
          flakeSize={0.014}
          minFlakeSize={1.0}
          pixelResolution={240}
          speed={1.7}
          density={0.3}
          direction={180}
          brightness={0.9}
          depthFade={9.5}
          farPlane={22}
          gamma={0.4545}
          variant="square"
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Hero — sits at z-index 2 (above snow). Snow is hidden while hero is visible anyway. */}
      <div ref={heroRef} style={{ position: "relative", zIndex: 2 }}>
        <CubexHero />
      </div>

      {/* All below-hero content — z-index 2 so it sits above snow layer */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <Cubes
          gridCols={18}
          gridRows={2}
          maxAngle={120}
          radius={3}
          autoAnimate={false}
          rippleOnClick={true}
          rippleColor="#48D1FF"
          rippleSpeed={3}
          borderStyle="1px solid rgba(72, 209, 255, 0.15)"
          faceColor="rgba(0, 0, 0, 0.3)"
          cellGap={{ col: 8, row: 8 }}
        />

        <ScrollReveal
          ctaText="Explore the Engine"
          autoTriggerPlay={false}
          rotationEnd="bottom+=50%"
          wordAnimationEnd="bottom+=150%"
        >
          Forty-three quintillion possibilities, one optimal path.
          CUBEX does not just solve; it masters the geometry of logic.
          Through AI-driven scanning and real-time algorithm synthesis,
          the impossible becomes inevitable.
        </ScrollReveal>

        <HeroAfterSection />
      </div>
    </main>
  );
}
