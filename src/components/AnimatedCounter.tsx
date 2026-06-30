'use client'
// src/components/AnimatedCounter.tsx
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, animate } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  suffix?: string
  prefix?: string
  formatFn?: (n: number) => string
}

export default function AnimatedCounter({ value, duration = 1.5, suffix = '', prefix = '', formatFn }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [isInView, value, duration])

  const formatted = formatFn ? formatFn(display) : display.toLocaleString('fr')

  return (
    <span ref={ref}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
