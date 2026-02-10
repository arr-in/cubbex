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
        let ctx: any;
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
                if (!el || !spacer) return;

                const wordElements = el.querySelectorAll('.word');
                const scroller = scrollContainerRef?.current || window;

                if (prefersReducedMotion) {
                    gsap.set(wordElements, { opacity: 1, filter: 'none', rotate: 0 });
                    return;
                }

                // 1. Container Rotation Reveal (Scrubbed across the whole spacer)
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

                // 2. Word Opacity Reveal (Stretched Narrative Space)
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
            </div>
        </section>
    );
};

export default ScrollReveal;
