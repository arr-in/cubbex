"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue, useMotionTemplate, useReducedMotion } from "framer-motion"

const WORDS = ["Solve.", "Learn.", "Master."]

// Holographic colors for gradient
const GRADIENT_CSS = "linear-gradient(135deg, #48D1FF 0%, #7DD3C8 25%, #FF6BD6 50%, #48D1FF 75%, #7DD3C8 100%)"

export default function CubexSubtitle() {
    const [index, setIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const shouldReduceMotion = useReducedMotion()

    // --- 1. Carousel Logic ---
    useEffect(() => {
        if (isExpanded || shouldReduceMotion) return

        let timeout: NodeJS.Timeout
        const nextWord = () => {
            const duration = 1600 + Math.random() * 400
            timeout = setTimeout(() => {
                setIndex((prev) => (prev + 1) % WORDS.length)
                nextWord()
            }, duration)
        }
        nextWord()
        return () => clearTimeout(timeout)
    }, [isExpanded, shouldReduceMotion])

    // --- 2. Hover & Pointer Tracking ---
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // spring: damping 12, stiffness 125 as requested for hover
    const springConfig = { damping: 12, stiffness: 125, mass: 0.5 }
    const x = useSpring(mouseX, springConfig)
    const y = useSpring(mouseY, springConfig)

    // 3D Tilt for capsule
    const rotateX = useTransform(y, [-100, 100], [5, -5])
    const rotateY = useTransform(x, [-100, 100], [-5, 5])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || shouldReduceMotion) return
        const rect = containerRef.current.getBoundingClientRect()
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        mouseX.set(e.clientX - rect.left - centerX)
        mouseY.set(e.clientY - rect.top - centerY)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        mouseX.set(0)
        mouseY.set(0)
    }

    return (
        <motion.div
            ref={containerRef}
            className="relative z-30 flex flex-col items-center justify-center perspective-1000 group w-full"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onClick={() => setIsExpanded(!isExpanded)}
            role="button"
            aria-live="polite"
        >
            {/* Invisible h2 for SEO/SR */}
            <h2 className="sr-only">Interactive Rubik's Cube Subtitle: {WORDS[index]}</h2>

            {/* 
                REFINED GLASS PILL (v2)
                - Radius 36px
                - Opacity 0.25 (bg) / 0.03 (border)
                - Backdrop 6px
                - Sizing via utility classes for breakpoints
            */}
            <motion.div
                className="relative cursor-pointer select-none rounded-[36px] bg-white/[0.08] backdrop-blur-[6px] shadow-[inset_0_0_10px_rgba(0,0,0,0.35)] overflow-hidden transition-colors duration-300
                           w-[min(86vw,320px)] md:w-[56vw] lg:w-[480px] lg:max-w-[680px] lg:min-w-[320px]
                           px-[34px] py-[12px]"
                style={{
                    rotateX: isHovered && !shouldReduceMotion ? rotateX : 0,
                    rotateY: isHovered && !shouldReduceMotion ? rotateY : 0,
                    transformStyle: "preserve-3d",
                    border: "1px solid rgba(255,255,255,0.03)",
                    willChange: "transform"
                }}
                whileHover={!shouldReduceMotion ? {
                    scale: 1.02,
                    borderColor: "rgba(255,255,255,0.12)",
                } : {}}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 125, damping: 12 }}
            >
                {/* Internal Light Sweep / Sheen (Disabled on mobile) */}
                {!shouldReduceMotion && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden sm:block"
                        style={{
                            background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 55%, transparent 80%)",
                        }}
                    />
                )}

                {/* Text Carousel */}
                <div className="relative h-12 md:h-16 lg:h-20 overflow-visible flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={WORDS[index]}
                            initial={!shouldReduceMotion ? { opacity: 0, scale: 0.98, filter: "blur(8px)" } : { opacity: 0 }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={!shouldReduceMotion ? { opacity: 0, scale: 1.02, filter: "blur(8px)" } : { opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="text-[22px] md:text-[34px] lg:text-[48px] font-display font-semibold tracking-[0.6px] text-center"
                            style={{
                                backgroundImage: GRADIENT_CSS,
                                backgroundSize: "200% auto",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                color: "transparent",
                                animation: !shouldReduceMotion ? "shine 8s linear infinite" : "none",
                            }}
                        >
                            {WORDS[index]}
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* CSS for gradient drift */}
                {!shouldReduceMotion && (
                    <style jsx global>{`
                        @keyframes shine {
                            0% { background-position: 0% 50%; }
                            100% { background-position: 200% 50%; }
                        }
                    `}</style>
                )}
            </motion.div>

            {/* Floating Particles (Wisps) - Lower count, scaled size, disabled on mobile */}
            {!shouldReduceMotion && (
                <div className="absolute inset-0 pointer-events-none hidden sm:block">
                    <AnimatePresence>
                        {isHovered && (
                            <>
                                {[...Array(2)].map((_, i) => (
                                    <Particle key={i} index={i} />
                                ))}
                            </>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Expanded Panel (Anchored Below) */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, height: "auto", y: 12, scale: 1 }}
                        exit={{ opacity: 0, height: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.42, ease: [0.22, 1.3, 0.3, 1] }} // Custom overshoot requested
                        className="absolute top-full flex flex-col overflow-hidden bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-50 cursor-auto w-full max-w-[min(86vw,320px)] md:max-w-[56vw] lg:max-w-[480px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 md:p-8 flex flex-col gap-5 text-center">
                            <div className="space-y-1">
                                <h4 className="text-white font-display text-lg md:text-xl tracking-tight">Explore a Solve</h4>
                                <p className="text-xs md:text-sm text-white/50 leading-relaxed font-body">
                                    Interactive breakdown of the Fridrich method (CFOP).
                                </p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: "rgba(72, 209, 255, 0.1)" }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3 md:py-4 rounded-xl border border-cyan-400/30 bg-cyan-400/5 text-xs md:text-sm uppercase tracking-widest text-cyan-400 font-bold transition-all hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(72,209,255,0.25)]"
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent('cubex:playMicro'))
                                }}
                                aria-label="Start Solve Demo"
                            >
                                Start Demo
                            </motion.button>
                        </div>
                        {/* Decorative bottom line */}
                        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

function Particle({ index }: { index: number }) {
    const randomX = (Math.random() - 0.5) * 80
    const size = 18 + Math.random() * 27 // 18-45px range

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0, x: randomX, y: 0 }}
            animate={{
                opacity: [0, 0.35, 0],
                scale: [0.8, 1.2],
                y: -50 - Math.random() * 30,
                x: randomX + (Math.random() - 0.5) * 40
            }}
            transition={{ duration: 1.2, ease: "easeOut", delay: index * 0.15 }}
            className="absolute top-1/2 left-1/2 rounded-full pointer-events-none blur-xl bg-cyan-400/15"
            style={{
                width: size,
                height: size,
                marginTop: -size / 2,
                marginLeft: -size / 2
            }}
        />
    )
}
