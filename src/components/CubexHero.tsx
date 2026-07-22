"use client"

import { useRef } from "react"
import { useScroll, useTransform, motion } from "framer-motion"
import UnicornStudio from "unicornstudio-react"
import CubexHeroFocal from "./CubexHeroFocal"

export default function CubexHero() {
    const containerRef = useRef<HTMLDivElement>(null)

    // Scroll progress for smooth parallax
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    })

    const unicornScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.05])
    const focalY = useTransform(scrollYProgress, [0, 0.5], [0, 20])
    const focalOpacity = useTransform(scrollYProgress, [0, 0.3, 0.5], [1, 0.8, 0])

    // Scroll indicator
    const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

    // Bottom fade for smooth transition
    const bottomFadeOpacity = useTransform(scrollYProgress, [0.7, 1], [0, 1])

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen w-full bg-black"
        >
            {/* Sticky Hero Container */}
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                {/* Black Background */}
                <div className="absolute inset-0 bg-black z-0" />

                {/* Unicorn Studio Embed */}
                <motion.div
                    style={{
                        scale: unicornScale,
                        willChange: "transform"
                    }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 md:p-10"
                >
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Depth Overlays */}
                        <div className="absolute inset-0 z-[5] pointer-events-none bg-gradient-to-br from-black/80 via-transparent to-transparent opacity-60" />
                        <div className="absolute inset-0 z-[6] pointer-events-none bg-[radial-gradient(circle_at_30%_30%,rgba(72,209,255,0.08),transparent_70%)]" />

                        <UnicornStudio
                            projectId="sH4Hft41CGHepkf4iZSs"
                            width={1920}
                            height={1080}
                            className="w-full h-full object-contain"
                        />

                        {/* Subtle texture overlay */}
                        <div className="hero-texture-overlay" aria-hidden="true">
                            <div className="hero-texture-overlay__drift" />
                            <div className="hero-texture-overlay__drift hero-texture-overlay__drift--secondary" />
                        </div>
                    </div>

                    {/* Hero Focal Component */}
                    <motion.div
                        style={{
                            y: focalY,
                            opacity: focalOpacity,
                            willChange: "transform, opacity"
                        }}
                        className="absolute bottom-[14vh] w-full px-[6vw] flex justify-center z-20"
                    >
                        <CubexHeroFocal />
                    </motion.div>

                    {/* Scroll Indicator */}
                    <motion.div
                        style={{ opacity: scrollIndicatorOpacity }}
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
                    >
                        <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/30">Scroll to Explore</span>
                        <div className="w-[1px] h-10 bg-gradient-to-b from-[#48D1FF]/40 to-transparent" />
                    </motion.div>
                </motion.div>

                {/* Bottom fade-out gradient for smooth transition */}
                <motion.div 
                    style={{ opacity: bottomFadeOpacity }}
                    className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-50" 
                />
            </div>
        </section>
    )
}