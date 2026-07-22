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
  const rafRef = useRef<number | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userActiveRef = useRef(false);
  const simPosRef = useRef({ x: 0, y: 0 });
  const simTargetRef = useRef({ x: 0, y: 0 });
  const simRAFRef = useRef<number | null>(null);

  const colGap = typeof cellGap === 'number' ? `${cellGap}px` : cellGap?.col !== undefined ? `${cellGap.col}px` : '2%';
  const rowGap = typeof cellGap === 'number' ? `${cellGap}px` : cellGap?.row !== undefined ? `${cellGap.row}px` : '2%';

  const enterDur = duration.enter;
  const leaveDur = duration.leave;

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
          // Animate the cube tiles directly (no more face children)
          const cubes = rings[ring];

          gsap.to(cubes, {
            backgroundColor: rippleColor,
            duration: animDuration,
            delay,
            ease: 'power3.out'
          });
          gsap.to(cubes, {
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

    let isVisible = false;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(sceneRef.current);

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
      if (isVisible && !userActiveRef.current) {
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
      observer.disconnect();
      if (simRAFRef.current != null) {
        cancelAnimationFrame(simRAFRef.current);
      }
    };
  }, [autoAnimate, gridCols, gridRows, tiltAt]);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;

    const handlePointerMove: EventListener = (e) => onPointerMove(e as PointerEvent);
    const handlePointerLeave: EventListener = () => resetAll();
    const handleClick: EventListener = (e) => onClick(e as MouseEvent);

    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerleave', handlePointerLeave);
    el.addEventListener('click', handleClick);

    return () => {
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerleave', handlePointerLeave);
      el.removeEventListener('click', handleClick);

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
    '--cube-border': borderStyle,
    '--cube-bg': faceColor,
    '--cube-shadow': shadow === true ? '0 0 6px rgba(0,0,0,.5)' : shadow || 'none',
  } as React.CSSProperties;

  return (
    <div className="cubes-wrapper" style={wrapperStyle}>
      <div ref={sceneRef} className="cubes-scene" style={sceneStyle}>
        {rowsArray.map((_, r) =>
          colsArray.map((__, c) => (
            <div key={`${r}-${c}`} className="cube" data-row={r} data-col={c} />
          ))
        )}
      </div>
    </div>
  );
};

export default Cubes;