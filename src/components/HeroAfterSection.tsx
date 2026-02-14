"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { motion, useReducedMotion } from "framer-motion"
import styles from "./HeroAfterSection.module.css"

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    opacity: number
    size: number
}

export default function HeroAfterSection() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const focalRef = useRef<HTMLDivElement>(null)
    const [isHovering, setIsHovering] = useState(false)
    const shouldReduceMotion = useReducedMotion()
    const particlesRef = useRef<Particle[]>([])
    const animationFrameRef = useRef<number | undefined>(undefined)
    // Particle configuration
    const PARTICLE_COUNT = typeof window !== 'undefined' && window.innerWidth <= 768 ? 20 : 80
    const BASE_VELOCITY = 0.3
    const HOVER_VELOCITY_BOOST = 1.4

    // Initialize particles
    const initParticles = useCallback((width: number, height: number) => {
        particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.2,
            vy: -Math.random() * BASE_VELOCITY - 0.1, // Drift upward
            opacity: Math.random() * 0.06 + 0.02,
            size: Math.random() * 1.5 + 0.5,
        }))
    }, [PARTICLE_COUNT])

    // Animation loop
    useEffect(() => {
        if (shouldReduceMotion) return

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas size
        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1
            const rect = canvas.getBoundingClientRect()
            canvas.width = rect.width * dpr
            canvas.height = rect.height * dpr
            ctx.scale(dpr, dpr)
            canvas.style.width = `${rect.width}px`
            canvas.style.height = `${rect.height}px`

            if (particlesRef.current.length === 0) {
                initParticles(rect.width, rect.height)
            }
        }

        resizeCanvas()
        window.addEventListener("resize", resizeCanvas)

        // Animation function
        const animate = () => {
            const rect = canvas.getBoundingClientRect()
            ctx.clearRect(0, 0, rect.width, rect.height)

            const velocityMultiplier = isHovering ? HOVER_VELOCITY_BOOST : 1

            particlesRef.current.forEach((particle) => {
                // Update position
                particle.x += particle.vx * velocityMultiplier
                particle.y += particle.vy * velocityMultiplier

                // Wrap around edges
                if (particle.y < -10) {
                    particle.y = rect.height + 10
                    particle.x = Math.random() * rect.width
                }
                if (particle.x < -10) particle.x = rect.width + 10
                if (particle.x > rect.width + 10) particle.x = -10

                // Draw particle
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
                ctx.fill()
            })

            animationFrameRef.current = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener("resize", resizeCanvas)
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [shouldReduceMotion, isHovering, initParticles])

    const handleCTAClick = () => {
        window.dispatchEvent(new CustomEvent("cubex:playMicro"))
    }

    return (
        <section className={styles.container} aria-labelledby="hero-after-heading">
            <h2 id="hero-after-heading" className="sr-only">
                Interactive Cube Experience
            </h2>

            {/* Canvas Particle Field */}
            <canvas
                ref={canvasRef}
                className={styles.canvas}
                aria-hidden="true"
            />

            {/* Fallback for reduced motion */}
            {shouldReduceMotion && (
                <div className={styles.fallbackGradient} aria-hidden="true" />
            )}

            {/* Focal Card */}
            <motion.div
                ref={focalRef}
                className={styles.focalCard}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                whileHover={!shouldReduceMotion ? { scale: 1.02 } : {}}
                onHoverStart={() => setIsHovering(true)}
                onHoverEnd={() => setIsHovering(false)}
            >
                {/* Ambient glow */}
                <div className={styles.cardGlow} aria-hidden="true" />

                {/* Card content */}
                <div className={styles.cardContent}>
                    {/* Toy-ish SVG Placeholder (Abstract Cube Icon) */}
                    <motion.div
                        className={styles.iconWrapper}
                        animate={!shouldReduceMotion ? {
                            rotateY: [0, 5, 0, -5, 0],
                            rotateX: [0, -2, 0, 2, 0],
                        } : {}}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <svg
                            className={styles.cubeIcon}
                            viewBox="0 0 100 100"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            {/* Simple 3D cube representation */}
                            <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" fill="url(#cube-grad-1)" opacity="0.9" />
                            <path d="M50 10 L85 30 L50 50 L15 30 Z" fill="url(#cube-grad-2)" opacity="0.95" />
                            <path d="M50 50 L85 70 L85 30 Z" fill="url(#cube-grad-3)" opacity="0.8" />
                            <defs>
                                <linearGradient id="cube-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#7DD3C8" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#48D1FF" stopOpacity="0.6" />
                                </linearGradient>
                                <linearGradient id="cube-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#48D1FF" stopOpacity="0.7" />
                                    <stop offset="100%" stopColor="#B8A9FF" stopOpacity="0.5" />
                                </linearGradient>
                                <linearGradient id="cube-grad-3" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#B8A9FF" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="#7DD3C8" stopOpacity="0.3" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </motion.div>

                    {/* Title */}
                    <h3 className={styles.cardTitle}>
                        Experience the Algorithm
                    </h3>

                    {/* Description */}
                    <p className={styles.cardDescription}>
                        See CUBEX solve in real-time. Watch optimal paths unfold through advanced AI computation.
                    </p>

                    {/* CTA Button */}
                    <motion.button
                        onClick={handleCTAClick}
                        className={styles.ctaButton}
                        whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
                        whileTap={!shouldReduceMotion ? { scale: 0.98 } : {}}
                        aria-label="Explore a solve and trigger cube animation"
                    >
                        <span className={styles.ctaText}>Explore a Solve</span>
                        <motion.span
                            className={styles.ctaArrow}
                            animate={!shouldReduceMotion ? { x: [0, 4, 0] } : {}}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            aria-hidden="true"
                        >
                            →
                        </motion.span>
                    </motion.button>
                </div>
            </motion.div>
        </section>
    )
}   