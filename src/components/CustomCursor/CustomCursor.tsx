"use client"

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import './CustomCursor.css'

export default function CustomCursor() {
  const [isPointer, setIsPointer] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  // Cube follows with more lag
  const cubeX = useMotionValue(0)
  const cubeY = useMotionValue(0)
  const cubeSpringConfig = { damping: 20, stiffness: 100, mass: 0.8 }
  const cubeXSpring = useSpring(cubeX, cubeSpringConfig)
  const cubeYSpring = useSpring(cubeY, cubeSpringConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      cubeX.set(e.clientX)
      cubeY.set(e.clientY)
      setIsVisible(true)

      // Check if hovering over clickable element
      const target = e.target as HTMLElement
      const isClickable = 
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.onclick !== null ||
        target.style.cursor === 'pointer' ||
        target.closest('a') !== null ||
        target.closest('button') !== null

      setIsPointer(isClickable)
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [cursorX, cursorY, cubeX, cubeY])

  if (!isVisible) return null

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="custom-cursor-dot"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
        }}
        animate={{
          scale: isPointer ? 0.5 : 1,
          opacity: isPointer ? 0.6 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Following 3D cube */}
      <motion.div
        className="custom-cursor-cube"
        style={{
          left: cubeXSpring,
          top: cubeYSpring,
        }}
        animate={{
          scale: isPointer ? 1.4 : 1,
          rotate: isPointer ? 45 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="cube-svg"
        >
          {/* Back face */}
          <path
            d="M12 8 L28 8 L28 24 L12 24 Z"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.3"
          />
          
          {/* Front face */}
          <path
            d="M8 16 L24 16 L24 32 L8 32 Z"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.8"
          />
          
          {/* Connecting edges */}
          <path d="M12 8 L8 16" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <path d="M28 8 L24 16" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <path d="M28 24 L24 32" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <path d="M12 24 L8 32" stroke="currentColor" strokeWidth="1" opacity="0.4" />

          {/* Center dot */}
          <circle cx="16" cy="24" r="1.5" fill="currentColor" opacity="0.9">
            <animate
              attributeName="opacity"
              values="0.5;1;0.5"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </motion.div>

      {/* Outer ring on hover */}
      {isPointer && (
        <motion.div
          className="custom-cursor-ring"
          style={{
            left: cursorXSpring,
            top: cursorYSpring,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </>
  )
}