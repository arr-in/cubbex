"use client"

import { useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';
import './ScrollVelocity.css';

interface Props {
  children: string;
  baseVelocity: number;
}

function ScrollingText({ children, baseVelocity = 100 }: Props) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 1.2], {
    clamp: false
  });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);
  
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  function wrap(min: number, max: number, v: number) {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
  }

  return (
    <div className="scrolling-text-wrapper">
      <motion.div className="scrolling-text-track" style={{ x }}>
        <span className="scrolling-text-content">{children}</span>
        <span className="scrolling-text-content">{children}</span>
        <span className="scrolling-text-content">{children}</span>
        <span className="scrolling-text-content">{children}</span>
        <span className="scrolling-text-content">{children}</span>
        <span className="scrolling-text-content">{children}</span>
        <span className="scrolling-text-content">{children}</span>
        <span className="scrolling-text-content">{children}</span>
        <span className="scrolling-text-content">{children}</span>
        <span className="scrolling-text-content">{children}</span>
      </motion.div>
    </div>
  );
}

export default function ScrollVelocity() {
  return (
    <section className="scroll-velocity-section">
      <ScrollingText baseVelocity={-18}>
        SCAN   SOLVE   MASTER   —   SCAN   SOLVE   MASTER 
      </ScrollingText>
    </section>
  );
}