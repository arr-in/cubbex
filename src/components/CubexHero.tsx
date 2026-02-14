 "use client"
 
 import { useRef, useEffect, useState } from "react"
 import { useScroll, useTransform, useSpring, motion, AnimatePresence } from "framer-motion"
 import UnicornStudio from "unicornstudio-react"
 import { Loader2 } from "lucide-react"
 import CubexHeroFocal from "./CubexHeroFocal"
 
 /** Hero background video: put your file in public/ and use its path here (e.g. "/my-video.mp4") */
 const HERO_VIDEO_SRC = "/cube-explosion.mp4"
 
 export default function CubexHero() {
     const containerRef = useRef<HTMLDivElement>(null)
     const videoRef = useRef<HTMLVideoElement>(null)
     const [isVideoLoaded, setIsVideoLoaded] = useState(false)
 
     // Scroll progress for the entire 400vh section
     const { scrollYProgress } = useScroll({
         target: containerRef,
         offset: ["start start", "end end"],
     })
 
     // Smooth scroll for video scrubbing
     const smoothScroll = useSpring(scrollYProgress, {
         stiffness: 70, // Slightly softer for less jitter
         damping: 20,
         restDelta: 0.001,
     })
 
     // Optimized Video Scrubbing with requestAnimationFrame
     useEffect(() => {
         const video = videoRef.current
         if (!video || !isVideoLoaded) return
 
         let animationFrameId: number;
         video.playbackRate = 0; // Ensure no auto-play interference
 
         const updateVideoTime = () => {
             const progress = smoothScroll.get();
             // Map scroll (0.15 to 1.0) to video time (0 to duration)
             let videoProgress = (progress - 0.15) / 0.85;
             if (videoProgress < 0) videoProgress = 0;
             if (videoProgress > 1) videoProgress = 1;
 
             if (video.duration && isFinite(video.duration)) {
                 const targetTime = videoProgress * video.duration;
                 // Avoid ultra-micro seeks that thrash the decoder
                 // 0.033 is approx 1 frame at 30fps
                 if (Math.abs(video.currentTime - targetTime) > 0.033) {
                     video.currentTime = targetTime;
                 }
             }
             animationFrameId = requestAnimationFrame(updateVideoTime);
         }
 
         animationFrameId = requestAnimationFrame(updateVideoTime);
         return () => cancelAnimationFrame(animationFrameId);
     }, [smoothScroll, isVideoLoaded])
 
     // Video preload logic
     useEffect(() => {
         const video = videoRef.current
         if (!video) return
 
         if (video.readyState >= 3) {
             setIsVideoLoaded(true)
         }
 
         const handleCanPlay = () => setIsVideoLoaded(true)
         video.addEventListener("canplaythrough", handleCanPlay)
         return () => video.removeEventListener("canplaythrough", handleCanPlay)
     }, [])
 
     // -- Opacity/Transform Logic for Layers --
 
     // 1. Unicorn Studio Layer (Intro)
     // Visible from 0% to 15%, fades out completely by 20%
     const unicornOpacity = useTransform(scrollYProgress, [0, 0.15, 0.2], [1, 1, 0])
     const unicornScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1])
     const unicornPointerEvents = useTransform(scrollYProgress, (v) => v > 0.2 ? "none" : "auto")
     // RESOURCE OPTIMIZATION: Hide layer completely when invisible to free GPU
     const unicornDisplay = useTransform(scrollYProgress, (v) => v > 0.25 ? "none" : "flex")
 
     // 2. Video Layer
     const videoOpacity = useTransform(scrollYProgress, [0.15, 0.25], [0, 1])
     const videoDisplay = useTransform(scrollYProgress, (v) => v < 0.1 ? "none" : "block")
 
     // -- Text Beats --
 
     // Beat B: AI Engine (25-45%)
     const opacityB = useTransform(scrollYProgress, [0.25, 0.3, 0.4, 0.45], [0, 1, 1, 0])
     const yB = useTransform(scrollYProgress, [0.25, 0.45], [50, -50])
 
     // Beat C: Scanning (50-70%)
     const opacityC = useTransform(scrollYProgress, [0.5, 0.55, 0.65, 0.7], [0, 1, 1, 0])
     const yC = useTransform(scrollYProgress, [0.5, 0.7], [50, -50])
 
     // Beat D: CTA (75-95%)
     const opacityD = useTransform(scrollYProgress, [0.75, 0.8, 0.9, 0.95], [0, 1, 1, 0])
     const yD = useTransform(scrollYProgress, [0.75, 0.95], [50, -50])
 
     // Scroll indicator
     const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])
 
     // Subtitle Pill Scroll Mapping (v2)
     // Starts reacting after 18% scroll
     const pillYOffset = useTransform(scrollYProgress, [0.18, 0.28], [0, 28])
     const pillScaleProgress = useTransform(scrollYProgress, [0.18, 0.28], [1, 0.98])
     const pillOpacityProgress = useTransform(scrollYProgress, [0.18, 0.28], [1, 0.55])
     // Total opacity = (intro opacity) * (scroll decay opacity)
     const totalPillOpacity = useTransform(
         [unicornOpacity, pillOpacityProgress],
         ([o1, o2]) => (o1 as number) * (o2 as number)
     )
 
     return (
         <section
             ref={containerRef}
             className="relative h-[400vh] w-full bg-black"
         >
             {/* Loading Overlay */}
             <AnimatePresence>
                 {!isVideoLoaded && (
                     <motion.div
                         initial={{ opacity: 1 }}
                         exit={{ opacity: 0 }}
                         className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black text-white"
                     >
                         <Loader2 className="h-10 w-10 animate-spin text-electric-blue mb-4" />
                         <p className="font-mono text-sm tracking-widest uppercase opacity-70">Loading Experience...</p>
                     </motion.div>
                 )}
             </AnimatePresence>
 
             {/* Sticky Wrapper */}
             <div className="sticky top-0 h-screen w-full overflow-hidden">
 
                 {/* GLOBAL BACKGROUND - Always Black */}
                 <div className="absolute inset-0 bg-black z-0" />
 
                 {/* --- LAYER 1: UNICORN STUDIO (Intro) --- */}
                 {/* Z-Index 40 (On top of video) */}
                 <motion.div
                     style={{
                         opacity: unicornOpacity,
                         scale: unicornScale,
                         pointerEvents: unicornPointerEvents as any,
                         display: unicornDisplay as any,
                         willChange: "transform, opacity"
                     }}
                     className="absolute inset-0 z-40 flex flex-col items-center justify-center p-4 md:p-10"
                 >
                     <div className="relative w-full h-full flex items-center justify-center">
                         {/* Fullscreen Embed */}
                         <div className="w-full h-full absolute inset-0 flex items-center justify-center">
                             {/* DEPTH OVERLAYS (Awwwards-style layering) */}
                             {/* Fade top-left letters more */}
                             <div className="absolute inset-x-0 inset-y-0 z-[5] pointer-events-none bg-gradient-to-br from-black/80 via-transparent to-transparent opacity-60" />
                             {/* Ultra-subtle tint */}
                             <div className="absolute inset-0 z-[6] pointer-events-none bg-[radial-gradient(circle_at_30%_30%,rgba(72,209,255,0.08),transparent_70%)]" />
 
                            <UnicornStudio
                                projectId="sH4Hft41CGHepkf4iZSs"
                                width={1920}
                                height={1080}
                                className="w-full h-full object-contain"
                            />
                            {/* Subtle animated texture overlay — non-interactive, hero only */}
                            <div className="hero-texture-overlay" aria-hidden="true">
                                <div className="hero-texture-overlay__drift" />
                                <div className="hero-texture-overlay__drift hero-texture-overlay__drift--secondary" />
                            </div>
                         </div>
 
                        {/* Hero focal: AI solver state visual */}
                        <motion.div
                            style={{
                                opacity: totalPillOpacity,
                                y: pillYOffset,
                                scale: pillScaleProgress,
                                willChange: "transform, opacity"
                            }}
                            className="absolute bottom-[14vh] w-full px-[6vw] flex justify-center pointer-events-auto z-50"
                        >
                            <CubexHeroFocal />
                        </motion.div>
 
                         {/* Scroll Indicator */}
                         <motion.div
                             style={{ opacity: scrollIndicatorOpacity }}
                             animate={{ y: [0, 8, 0] }}
                             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                             className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                         >
                             <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/30">Scroll to Explore</span>
                             <div className="w-[1px] h-10 bg-gradient-to-b from-electric-blue/40 to-transparent" />
                         </motion.div>
                     </div>
                 </motion.div>
 
 
                 {/* --- LAYER 2: VIDEO (Scrollytelling) --- */}
                 {/* Z-Index 10 */}
                 <motion.div
                     style={{
                         opacity: videoOpacity,
                         display: videoDisplay as any,
                         willChange: "opacity"
                     }}
                     className="absolute inset-0 z-10"
                 >
                     {/* Ambient Gradient for Video */}
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--dark-purple),#000000_70%)] opacity-80 z-0" />
 
                     <video
                         ref={videoRef}
                         className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-contain z-10 opacity-100 mix-blend-screen"
                         muted
                         playsInline
                         preload="auto"
                     >
                         <source src={HERO_VIDEO_SRC} type="video/mp4" />
                     </video>
 
                     {/* Vignette / Edge Blending */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black z-20 pointer-events-none" />
                 </motion.div>
 
 
                 {/* --- LAYER 3: TEXT BEATS (Overlaid on Video) --- */}
                 {/* Z-Index 30 */}
 
                 {/* Beat B */}
                 <motion.div
                     style={{ opacity: opacityB, y: yB }}
                     className="absolute inset-0 z-30 flex items-center justify-start p-8 md:pl-24 pointer-events-none"
                 >
                     <div className="max-w-2xl bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-white/5">
                         <h3 className="text-4xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 mb-4">
                             AI-Powered Algo Engine
                         </h3>
                         <p className="text-xl md:text-2xl text-cyber-purple font-body">
                             Advanced solving in under 2 seconds.
                         </p>
                     </div>
                 </motion.div>
 
                 {/* Beat C */}
                 <motion.div
                     style={{ opacity: opacityC, y: yC }}
                     className="absolute inset-0 z-30 flex items-center justify-end p-8 md:pr-24 pointer-events-none"
                 >
                     <div className="max-w-2xl text-right bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-white/5">
                         <h3 className="text-4xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-l from-white to-white/50 mb-4">
                             AR Camera Scanning
                         </h3>
                         <p className="text-xl md:text-2xl text-electric-blue font-body">
                             Point, scan, solve — it&apos;s that simple.
                         </p>
                     </div>
                 </motion.div>
 
                {/* Beat D */}
                <motion.div
                    style={{ opacity: opacityD, y: yD }}
                    className="absolute inset-0 z-40 flex flex-col items-center justify-center p-4 text-center pointer-events-none"
                >
                    <h3 className="text-5xl md:text-7xl font-display font-bold text-white mb-6">
                        Start Solving Now
                    </h3>
                    <p className="text-lg md:text-xl text-white/60 mb-8 font-mono">
                        2.3s avg solve time | 20-move optimal solutions
                    </p>
                    <button className="pointer-events-auto px-8 py-4 bg-electric-blue hover:bg-electric-blue-dark text-white font-bold rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,132,255,0.5)]">
                        Launch App
                    </button>
                </motion.div>
 
             </div>
         </section>
     )
 }
