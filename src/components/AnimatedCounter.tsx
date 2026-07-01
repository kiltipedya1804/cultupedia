'use client'
// src/components/AnimatedCounter.tsx
import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  suffix?: string
  prefix?: string
  formatFn?: (n: number) => string
}

export default function AnimatedCounter({ value, duration = 1.5, suffix = '', prefix = '', formatFn }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const startTime = performance.now()
    const endTime = startTime + duration * 1000

    function update(now: number) {
      const progress = Math.min((now - startTime) / (endTime - startTime), 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(update)
    }

    requestAnimationFrame(update)
  }, [started, value, duration])

  const formatted = formatFn ? formatFn(display) : display.toLocaleString('fr')

  return <span ref={ref}>{prefix}{formatted}{suffix}</span>
}
