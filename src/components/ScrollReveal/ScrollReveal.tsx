'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import './ScrollReveal.css';

interface ScrollRevealProps {
    children: string;
    scrollContainerRef?: React.RefObject<HTMLElement>;
    enableBlur?: boolean;
    baseOpacity?: number;
    baseRotation?: number;
    blurStrength?: number;
    containerClassName?: string;
    textClassName?: string;
    rotationEnd?: string;
    wordAnimationEnd?: string;
    autoTriggerPlay?: boolean;
    ctaText?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    scrollContainerRef,
    enableBlur = true,
    baseOpacity = 0.12,
    baseRotation = 10,
    blurStrength = 7,
    containerClassName = '',
    textClassName = '',
    rotationEnd = 'bottom 50%',
    wordAnimationEnd = 'bottom 20%',
    autoTriggerPlay = false,
    ctaText
}) => {
    const containerRef = useRef<HTMLElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLParagraphElement>(null);
    const leftElementsRef = useRef<HTMLDivElement>(null);
    const rightElementsRef = useRef<HTMLDivElement>(null);
    const [isRevealed, setIsRevealed] = useState(false);

    const words = useMemo(() => {
        return children.split(/(\s+)/).map((word, index) => {
            if (word.match(/^\s+$/)) return word;
            return (
                <span className="word" key={index}>
                    {word}
                </span>
            );
        });
    }, [children]);

    useEffect(() => {
        let ctx: gsap.Context | null = null;
        let autoTriggerTimeout: NodeJS.Timeout;

        const initGSAP = async () => {
            const { gsap } = await import('gsap');
            const { ScrollTrigger } = await import('gsap/ScrollTrigger');
            gsap.registerPlugin(ScrollTrigger);

            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const isMobile = window.innerWidth <= 768;

            ctx = gsap.context(() => {
                const el = textRef.current;
                const spacer = containerRef.current;
                const leftEls = leftElementsRef.current;
                const rightEls = rightElementsRef.current;
                
                if (!el || !spacer) return;

                const wordElements = el.querySelectorAll('.word');
                const scroller = scrollContainerRef?.current || window;

                if (prefersReducedMotion) {
                    gsap.set(wordElements, { opacity: 1, filter: 'none', rotate: 0 });
                    if (leftEls) gsap.set(leftEls.children, { opacity: 0.3 });
                    if (rightEls) gsap.set(rightEls.children, { opacity: 0.3 });
                    return;
                }

                // 1. Container Rotation Reveal
                gsap.fromTo(
                    el,
                    { transformOrigin: 'center center', rotate: baseRotation, y: 20 },
                    {
                        rotate: 0,
                        y: 0,
                        scrollTrigger: {
                            trigger: spacer,
                            scroller,
                            start: 'top bottom',
                            end: 'top center',
                            scrub: true,
                        },
                    }
                );

                // 2. Word Opacity Reveal
                gsap.fromTo(
                    wordElements,
                    { opacity: baseOpacity },
                    {
                        opacity: 1,
                        stagger: 0.1,
                        scrollTrigger: {
                            trigger: spacer,
                            scroller,
                            start: 'top 20%',
                            end: 'bottom 80%',
                            scrub: true,
                            onLeave: () => {
                                if (!isRevealed) {
                                    setIsRevealed(true);
                                    window.dispatchEvent(new CustomEvent('cubex:revealComplete'));
                                    if (autoTriggerPlay) {
                                        autoTriggerTimeout = setTimeout(() => {
                                            window.dispatchEvent(new CustomEvent('cubex:playMicro'));
                                        }, 400);
                                    }
                                }
                            }
                        },
                    }
                );

                // 3. Word Blur Reveal
                if (enableBlur && !isMobile) {
                    gsap.fromTo(
                        wordElements,
                        { filter: `blur(${blurStrength}px)` },
                        {
                            filter: 'blur(0px)',
                            stagger: 0.1,
                            scrollTrigger: {
                                trigger: spacer,
                                scroller,
                                start: 'top 20%',
                                end: 'bottom 80%',
                                scrub: true,
                            },
                        }
                    );
                }

                // 4. LEFT SIDE ELEMENTS ANIMATIONS
                if (leftEls && !isMobile) {
                    const leftItems = leftEls.querySelectorAll('.side-element');
                    
                    leftItems.forEach((item, i) => {
                        gsap.fromTo(
                            item,
                            { 
                                x: -100, 
                                opacity: 0,
                                rotate: -15 
                            },
                            {
                                x: 0,
                                opacity: 0.6,
                                rotate: 0,
                                scrollTrigger: {
                                    trigger: spacer,
                                    scroller,
                                    start: 'top 60%',
                                    end: 'top 20%',
                                    scrub: true,
                                },
                            }
                        );

                        // Continuous floating animation
                        gsap.to(item, {
                            y: '+=15',
                            duration: 3 + i * 0.5,
                            repeat: -1,
                            yoyo: true,
                            ease: 'sine.inOut',
                        });
                    });
                }

                // 5. RIGHT SIDE ELEMENTS ANIMATIONS
                if (rightEls && !isMobile) {
                    const rightItems = rightEls.querySelectorAll('.side-element');
                    
                    rightItems.forEach((item, i) => {
                        gsap.fromTo(
                            item,
                            { 
                                x: 100, 
                                opacity: 0,
                                rotate: 15 
                            },
                            {
                                x: 0,
                                opacity: 0.6,
                                rotate: 0,
                                scrollTrigger: {
                                    trigger: spacer,
                                    scroller,
                                    start: 'top 60%',
                                    end: 'top 20%',
                                    scrub: true,
                                },
                            }
                        );

                        // Continuous floating animation
                        gsap.to(item, {
                            y: '+=20',
                            duration: 3.5 + i * 0.5,
                            repeat: -1,
                            yoyo: true,
                            ease: 'sine.inOut',
                            delay: i * 0.2
                        });
                    });
                }

            }, containerRef);
        };

        initGSAP();

        return () => {
            if (ctx) ctx.revert();
            if (autoTriggerTimeout) clearTimeout(autoTriggerTimeout);
        };
    }, [
        scrollContainerRef,
        enableBlur,
        baseRotation,
        baseOpacity,
        rotationEnd,
        wordAnimationEnd,
        blurStrength,
        autoTriggerPlay,
        isRevealed
    ]);

    const handleCTAClick = () => {
        window.dispatchEvent(new CustomEvent('cubex:playMicro'));
    };

    return (
        <section
            ref={containerRef}
            className={`scroll-reveal-spacer ${containerClassName}`}
            aria-labelledby="reveal-heading"
        >
            <div ref={stickyRef} className="scroll-reveal-sticky">
                <h2 id="reveal-heading" className="sr-only">Core Philosophy</h2>
                
                {/* LEFT SIDE ELEMENTS */}
                <div ref={leftElementsRef} className="scroll-reveal-left-elements">
                    {/* Geometric Grid */}
                    <div className="side-element geometric-grid">
                        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="10" y="10" width="30" height="30" stroke="url(#grad-blue-1)" strokeWidth="1.5" opacity="0.6"/>
                            <rect x="45" y="10" width="30" height="30" stroke="url(#grad-blue-1)" strokeWidth="1.5" opacity="0.4"/>
                            <rect x="80" y="10" width="30" height="30" stroke="url(#grad-blue-1)" strokeWidth="1.5" opacity="0.6"/>
                            <rect x="10" y="45" width="30" height="30" stroke="url(#grad-blue-1)" strokeWidth="1.5" opacity="0.4"/>
                            <rect x="45" y="45" width="30" height="30" stroke="url(#grad-blue-1)" strokeWidth="1.5" opacity="0.8"/>
                            <rect x="80" y="45" width="30" height="30" stroke="url(#grad-blue-1)" strokeWidth="1.5" opacity="0.4"/>
                            <rect x="10" y="80" width="30" height="30" stroke="url(#grad-blue-1)" strokeWidth="1.5" opacity="0.6"/>
                            <rect x="45" y="80" width="30" height="30" stroke="url(#grad-blue-1)" strokeWidth="1.5" opacity="0.4"/>
                            <rect x="80" y="80" width="30" height="30" stroke="url(#grad-blue-1)" strokeWidth="1.5" opacity="0.6"/>
                            <defs>
                                <linearGradient id="grad-blue-1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#48D1FF" />
                                    <stop offset="100%" stopColor="#7DD3C8" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    {/* Wireframe Cube */}
                    <div className="side-element wireframe-cube">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M50 10 L80 25 L80 65 L50 80 L20 65 L20 25 Z" stroke="url(#grad-purple)" strokeWidth="1.5" opacity="0.7"/>
                            <path d="M50 10 L50 50 M20 25 L50 50 M80 25 L50 50" stroke="url(#grad-purple)" strokeWidth="1" opacity="0.5"/>
                            <path d="M50 50 L50 80 M20 65 L50 80 M80 65 L50 80" stroke="url(#grad-purple)" strokeWidth="1" opacity="0.5"/>
                            <defs>
                                <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#B8A9FF" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    {/* Glowing Orb */}
                    <div className="side-element glowing-orb">
                        <div className="orb-inner" />
                    </div>
                </div>

                {/* CENTER TEXT CONTENT */}
                <div className="flex flex-col items-center gap-12">
                    <p
                        ref={textRef}
                        className={`scroll-reveal-text ${textClassName}`}
                        aria-live="polite"
                    >
                        {words}
                    </p>

                    {ctaText && (
                        <div className={`scroll-reveal-cta ${isRevealed ? 'visible' : ''}`}>
                            <button
                                onClick={handleCTAClick}
                                className="cta-button"
                            >
                                {ctaText}
                            </button>
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE ELEMENTS */}
                <div ref={rightElementsRef} className="scroll-reveal-right-elements">
                    {/* Stats Panel */}
                    <div className="side-element stats-panel">
                        <div className="stat-line">
                            <div className="stat-bar" style={{ width: '85%' }} />
                        </div>
                        <div className="stat-line">
                            <div className="stat-bar" style={{ width: '92%' }} />
                        </div>
                        <div className="stat-line">
                            <div className="stat-bar" style={{ width: '78%' }} />
                        </div>
                    </div>

                    {/* Hexagon Pattern */}
                    <div className="side-element hexagon-pattern">
                        <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M50 5 L85 25 L85 65 L50 85 L15 65 L15 25 Z" stroke="url(#grad-teal)" strokeWidth="1.5" opacity="0.6"/>
                            <path d="M50 20 L75 35 L75 60 L50 75 L25 60 L25 35 Z" stroke="url(#grad-teal)" strokeWidth="1.5" opacity="0.4"/>
                            <circle cx="50" cy="45" r="8" stroke="url(#grad-teal)" strokeWidth="1.5" opacity="0.8"/>
                            <defs>
                                <linearGradient id="grad-teal" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#7DD3C8" />
                                    <stop offset="100%" stopColor="#48D1FF" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    {/* Data Flow Lines */}
                    <div className="side-element data-flow">
                        <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 10 Q 40 30, 70 20" stroke="url(#grad-flow)" strokeWidth="2" opacity="0.5" strokeDasharray="4 4"/>
                            <path d="M10 40 Q 40 60, 70 50" stroke="url(#grad-flow)" strokeWidth="2" opacity="0.6" strokeDasharray="4 4"/>
                            <path d="M10 70 Q 40 90, 70 80" stroke="url(#grad-flow)" strokeWidth="2" opacity="0.4" strokeDasharray="4 4"/>
                            <circle cx="70" cy="20" r="3" fill="#48D1FF" opacity="0.8"/>
                            <circle cx="70" cy="50" r="3" fill="#7DD3C8" opacity="0.8"/>
                            <circle cx="70" cy="80" r="3" fill="#B8A9FF" opacity="0.8"/>
                            <defs>
                                <linearGradient id="grad-flow" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#48D1FF" stopOpacity="0.3"/>
                                    <stop offset="100%" stopColor="#7DD3C8" stopOpacity="0.8"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ScrollReveal;
