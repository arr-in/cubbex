"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

const PHRASES = ["Scan.", "Solve.", "Optimize."]

const GRADIENT = "linear-gradient(135deg, #48D1FF 0%, #7DD3C8 35%, #B8A9FF 100%)"
const LABEL = "AI-Powered Solving"

export default function CubexHeroFocal() {
    const [index, setIndex] = useState(0)
    const shouldReduceMotion = useReducedMotion()

    useEffect(() => {
        if (shouldReduceMotion) return
        const t = setInterval(() => {
            setIndex((i) => (i + 1) % PHRASES.length)
        }, 2600)
        return () => clearInterval(t)
    }, [shouldReduceMotion])

    return (
        <motion.div
            className="relative flex flex-col items-center justify-center cursor-default"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={!shouldReduceMotion ? { scale: 1.015 } : {}}
            aria-live="polite"
            aria-label={`${LABEL} — ${PHRASES[index]}`}
        >
            {/* Soft glow behind focal — depth */}
            <div
                className="absolute inset-0 -inset-x-12 -inset-y-8 rounded-full pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(72, 209, 255, 0.06) 0%, transparent 70%)",
                }}
            />

            <div className="relative flex flex-col items-center gap-5 sm:gap-6">
                {/* Top line: label — gives hierarchy and context */}
                <motion.p
                    className="text-xs sm:text-sm uppercase tracking-[0.4em] font-medium text-white/50 whitespace-nowrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    {LABEL}
                </motion.p>

                {/* Thin divider — elegant separation */}
                <motion.div
                    className="h-px w-12 sm:w-16 rounded-full"
                    style={{
                        background: "linear-gradient(90deg, transparent, rgba(72, 209, 255, 0.4), transparent)",
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                />

                {/* Glassmorphism only around "Scan / Solve / Optimize" */}
                <motion.div
                    className="relative flex items-center justify-center rounded-lg sm:rounded-xl px-0.5 py-0.5 min-w-[188px] sm:min-w-[244px] md:min-w-[300px]"
                    style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.06), 0 12px 28px -8px rgba(0, 0, 0, 0.3)",
                    }}
                    whileHover={
                        !shouldReduceMotion
                            ? {
                                  borderColor: "rgba(255, 255, 255, 0.12)",
                                  boxShadow:
                                      "inset 0 1px 0 0 rgba(255, 255, 255, 0.07), 0 0 0 1px rgba(72, 209, 255, 0.06), 0 16px 32px -8px rgba(0, 0, 0, 0.35)",
                              }
                            : {}
                    }
                    transition={{ duration: 0.3 }}
                >
                    {/* Main word with 3D depth: blurred shadow layer + sharp foreground */}
                    <div className="relative h-[3.5rem] sm:h-20 md:h-24 flex items-center justify-center min-w-[184px] sm:min-w-[240px] md:min-w-[296px]">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={PHRASES[index]}
                                className="absolute inset-0 flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                {/* Depth layer — soft, offset, blurred (3D feel) */}
                                <span
                                    aria-hidden
                                    className="absolute font-display font-semibold text-[32px] sm:text-[42px] md:text-[52px] tracking-tight select-none pointer-events-none"
                                    style={{
                                        background: GRADIENT,
                                        backgroundClip: "text",
                                        WebkitBackgroundClip: "text",
                                        color: "transparent",
                                        transform: "translate(3px, 4px)",
                                        filter: "blur(8px)",
                                        opacity: 0.45,
                                    }}
                                >
                                    {PHRASES[index]}
                                </span>
                                {/* Sharp foreground — main read */}
                                <motion.span
                                    initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
                                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    className="relative font-display font-semibold text-[32px] sm:text-[42px] md:text-[52px] tracking-tight text-center select-none drop-shadow-[0_0_30px_rgba(72,209,255,0.15)]"
                                    style={{
                                        background: GRADIENT,
                                        backgroundClip: "text",
                                        WebkitBackgroundClip: "text",
                                        color: "transparent",
                                    }}
                                >
                                    {PHRASES[index]}
                                </motion.span>
                            </motion.span>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Bottom metric — grounds the block, adds credibility */}
                <motion.p
                    className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-white/35 tabular-nums"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    20 moves · 2.3s avg
                </motion.p>
            </div>
        </motion.div>
    )
}
