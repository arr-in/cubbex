"use client"

import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import './HeroText.css'

export default function HeroText() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  return (
    <div ref={containerRef} className="hero-text-container">
      <motion.div 
        className="hero-text-wrapper"
        style={{ opacity, scale }}
      >
        <h1 className="hero-text-main">
          <span className="hero-text-letter">C</span>
          <span className="hero-text-letter">U</span>
          <span className="hero-text-letter">B</span>
          <span className="hero-text-letter">E</span>
          <span className="hero-text-letter">X</span>
        </h1>
        <p className="hero-text-subtitle">AI-POWERED CUBE SOLVER</p>
      </motion.div>
    </div>
  )
}