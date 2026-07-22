"use client"

import { useEffect, useState } from 'react'
import { motion, useMotionValue } from 'framer-motion'
import './CustomCursor.css'

export default function CustomCursor() {
  const [isPointer, setIsPointer] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Hardware-accelerated instantaneous motion values (zero spring lag)
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  useEffect(() => {
    let prevIsPointer = false
    let prevIsVisible = false

    const handleMouseMove = (e: MouseEvent) => {
      // Split-second 1:1 hardware translation
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)

      if (!prevIsVisible) {
        prevIsVisible = true
        setIsVisible(true)
      }

      // Check if hovering over clickable element
      const target = e.target as HTMLElement
      const isClickable = Boolean(
        target && (
          target.tagName === 'A' ||
          target.tagName === 'BUTTON' ||
          target.onclick !== null ||
          target.style.cursor === 'pointer' ||
          target.closest('a') !== null ||
          target.closest('button') !== null
        )
      )

      if (prevIsPointer !== isClickable) {
        prevIsPointer = isClickable
        setIsPointer(isClickable)
      }
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [cursorX, cursorY])

  if (!isVisible) return null

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        x: cursorX,
        y: cursorY,
        pointerEvents: 'none',
        zIndex: 99999,
        willChange: 'transform',
      }}
    >
      {/* High-speed instantaneous cursor ring */}
      <motion.div
        className="custom-cursor-dot"
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
        animate={{
          scale: isPointer ? 2.2 : 1,
          border: isPointer ? '2px solid #007AFF' : '2px solid rgba(255, 255, 255, 0.8)',
          backgroundColor: isPointer ? 'rgba(0, 122, 255, 0.25)' : 'rgba(255, 255, 255, 0.2)',
          boxShadow: isPointer
            ? '0 0 15px rgba(0, 122, 255, 0.8), 0 0 30px rgba(0, 122, 255, 0.4)'
            : '0 0 8px rgba(255, 255, 255, 0.5)',
        }}
        transition={{ duration: 0.08, ease: 'linear' }}
      />
    </motion.div>
  )
}