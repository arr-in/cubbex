"use client"

import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Cubes.css';

interface CubesProps {
  gridSize?: number;
  cubeSize?: number;
  maxAngle?: number;
  radius?: number;
  easing?: string;
  duration?: { enter: number; leave: number };
  cellGap?: number | { col?: number; row?: number };
  borderStyle?: string;
  faceColor?: string;
  shadow?: boolean | string;
  autoAnimate?: boolean;
  rippleOnClick?: boolean;
  rippleColor?: string;
  rippleSpeed?: number;
  gridCols?: number;
  gridRows?: number;
}

const Cubes = ({
  gridCols = 20,
  gridRows = 3,
  cubeSize,
  maxAngle = 45,
  radius = 3,
  easing = 'power3.out',
  duration = { enter: 0.3, leave: 0.6 },
  cellGap,
  borderStyle = '1px solid rgba(72, 209, 255, 0.3)',
  faceColor = '#000000',
  shadow = false,
  autoAnimate = true,
  rippleOnClick = true,
  rippleColor = '#48D1FF',
  rippleSpeed = 2
}: CubesProps) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userActiveRef = useRef(false);
  const simPosRef = useRef({ x: 0, y: 0 });
  const simTargetRef = useRef({ x: 0, y: 0 });
  const simRAFRef = useRef<number | null>(null);
  const particleRAFRef = useRef<number | null>(null);

  const colGap = typeof cellGap === 'number' ? `${cellGap}px` : cellGap?.col !== undefined ? `${cellGap.col}px` : '2%';
  const rowGap = typeof cellGap === 'number' ? `${cellGap}px` : cellGap?.row !== undefined ? `${cellGap.row}px` : '2%';

  const enterDur = duration.enter;
  const leaveDur = duration.leave;

  // Particle animation
  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup canvas
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      opacity: number;
      size: number;
    }> = [];

    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.4 + 0.2,
        size: Math.random() * 2 + 1,
      });
    }

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = rect.width;
        if (p.x > rect.width) p.x = 0;
        if (p.y < 0) p.y = rect.height;
        if (p.y > rect.height) p.y = 0;

        ctx.fillStyle = `rgba(72, 209, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      particleRAFRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (particleRAFRef.current) {
        cancelAnimationFrame(particleRAFRef.current);
      }
    };
  }, []);

  const tiltAt = useCallback(
    (rowCenter: number, colCenter: number) => {
      if (!sceneRef.current) return;
      sceneRef.current.querySelectorAll('.cube').forEach((cube) => {
        const el = cube as HTMLElement;
        const r = +(el.dataset.row || 0);
        const c = +(el.dataset.col || 0);
        const dist = Math.hypot(r - rowCenter, c - colCenter);
        if (dist <= radius) {
          const pct = 1 - dist / radius;
          const angle = pct * maxAngle;
          gsap.to(cube, {
            duration: enterDur,
            ease: easing,
            overwrite: true,
            rotateX: -angle,
            rotateY: angle
          });
        } else {
          gsap.to(cube, {
            duration: leaveDur,
            ease: 'power3.out',
            overwrite: true,
            rotateX: 0,
            rotateY: 0
          });
        }
      });
    },
    [radius, maxAngle, enterDur, leaveDur, easing]
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      userActiveRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      if (!sceneRef.current) return;
      const rect = sceneRef.current.getBoundingClientRect();
      const cellW = rect.width / gridCols;
      const cellH = rect.height / gridRows;
      const colCenter = (e.clientX - rect.left) / cellW;
      const rowCenter = (e.clientY - rect.top) / cellH;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));

      idleTimerRef.current = setTimeout(() => {
        userActiveRef.current = false;
      }, 3000);
    },
    [gridCols, gridRows, tiltAt]
  );

  const resetAll = useCallback(() => {
    if (!sceneRef.current) return;
    sceneRef.current.querySelectorAll('.cube').forEach((cube) =>
      gsap.to(cube, {
        duration: leaveDur,
        rotateX: 0,
        rotateY: 0,
        ease: 'power3.out'
      })
    );
  }, [leaveDur]);

  const onClick = useCallback(
    (e: MouseEvent) => {
      if (!rippleOnClick || !sceneRef.current) return;
      
      const rect = sceneRef.current.getBoundingClientRect();
      const cellW = rect.width / gridCols;
      const cellH = rect.height / gridRows;

      const clientX = e.clientX;
      const clientY = e.clientY;

      const colHit = Math.floor((clientX - rect.left) / cellW);
      const rowHit = Math.floor((clientY - rect.top) / cellH);

      const baseRingDelay = 0.15;
      const baseAnimDur = 0.3;
      const baseHold = 0.6;

      const spreadDelay = baseRingDelay / rippleSpeed;
      const animDuration = baseAnimDur / rippleSpeed;
      const holdTime = baseHold / rippleSpeed;

      const rings: { [key: number]: Element[] } = {};
      sceneRef.current.querySelectorAll('.cube').forEach((cube) => {
        const el = cube as HTMLElement;
        const r = +(el.dataset.row || 0);
        const c = +(el.dataset.col || 0);
        const dist = Math.hypot(r - rowHit, c - colHit);
        const ring = Math.round(dist);
        if (!rings[ring]) rings[ring] = [];
        rings[ring].push(cube);
      });

      Object.keys(rings)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach((ring) => {
          const delay = ring * spreadDelay;
          const faces = rings[ring].flatMap((cube) => 
            Array.from(cube.querySelectorAll('.cube-face'))
          );

          gsap.to(faces, {
            backgroundColor: rippleColor,
            duration: animDuration,
            delay,
            ease: 'power3.out'
          });
          gsap.to(faces, {
            backgroundColor: faceColor,
            duration: animDuration,
            delay: delay + animDuration + holdTime,
            ease: 'power3.out'
          });
        });
    },
    [rippleOnClick, gridCols, gridRows, faceColor, rippleColor, rippleSpeed]
  );

  useEffect(() => {
    if (!autoAnimate || !sceneRef.current) return;
    simPosRef.current = {
      x: Math.random() * gridCols,
      y: Math.random() * gridRows
    };
    simTargetRef.current = {
      x: Math.random() * gridCols,
      y: Math.random() * gridRows
    };
    const speed = 0.02;
    const loop = () => {
      if (!userActiveRef.current) {
        const pos = simPosRef.current;
        const tgt = simTargetRef.current;
        pos.x += (tgt.x - pos.x) * speed;
        pos.y += (tgt.y - pos.y) * speed;
        tiltAt(pos.y, pos.x);
        if (Math.hypot(pos.x - tgt.x, pos.y - tgt.y) < 0.1) {
          simTargetRef.current = {
            x: Math.random() * gridCols,
            y: Math.random() * gridRows
          };
        }
      }
      simRAFRef.current = requestAnimationFrame(loop);
    };
    simRAFRef.current = requestAnimationFrame(loop);
    return () => {
      if (simRAFRef.current != null) {
        cancelAnimationFrame(simRAFRef.current);
      }
    };
  }, [autoAnimate, gridCols, gridRows, tiltAt]);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;

    const handlePointerMove = (e: PointerEvent) => onPointerMove(e);
    const handlePointerLeave = () => resetAll();
    const handleClick = (e: MouseEvent) => onClick(e);

    el.addEventListener('pointermove', handlePointerMove as any);
    el.addEventListener('pointerleave', handlePointerLeave);
    el.addEventListener('click', handleClick as any);

    return () => {
      el.removeEventListener('pointermove', handlePointerMove as any);
      el.removeEventListener('pointerleave', handlePointerLeave);
      el.removeEventListener('click', handleClick as any);

      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [onPointerMove, resetAll, onClick]);

  const rowsArray = Array.from({ length: gridRows });
  const colsArray = Array.from({ length: gridCols });

  const sceneStyle = {
    gridTemplateColumns: cubeSize ? `repeat(${gridCols}, ${cubeSize}px)` : `repeat(${gridCols}, 1fr)`,
    gridTemplateRows: cubeSize ? `repeat(${gridRows}, ${cubeSize}px)` : `repeat(${gridRows}, 1fr)`,
    columnGap: colGap,
    rowGap: rowGap
  };

  const wrapperStyle = {
    '--cube-face-border': borderStyle,
    '--cube-face-bg': faceColor,
    '--cube-face-shadow': shadow === true ? '0 0 6px rgba(0,0,0,.5)' : shadow || 'none',
  } as React.CSSProperties;

  return (
    <div className="cubes-wrapper" style={wrapperStyle}>
      {/* Particle canvas background */}
      <canvas
        ref={particlesRef}
        className="cubes-particles"
        aria-hidden="true"
      />
      
      {/* Cube grid */}
      <div ref={sceneRef} className="cubes-scene" style={sceneStyle}>
        {rowsArray.map((_, r) =>
          colsArray.map((__, c) => (
            <div key={`${r}-${c}`} className="cube" data-row={r} data-col={c}>
              <div className="cube-face cube-face--top" />
              <div className="cube-face cube-face--bottom" />
              <div className="cube-face cube-face--left" />
              <div className="cube-face cube-face--right" />
              <div className="cube-face cube-face--front" />
              <div className="cube-face cube-face--back" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Cubes;