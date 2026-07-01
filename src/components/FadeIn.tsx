'use client'
// src/components/FadeIn.tsx
import { useEffect, useRef, useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
  duration?: number
}

const directionStyles: Record<string, CSSProperties> = {
  up:    { transform: 'translateY(24px)' },
  down:  { transform: 'translateY(-24px)' },
  left:  { transform: 'translateX(24px)' },
  right: { transform: 'translateX(-24px)' },
  none:  { transform: 'none' },
}

export default function FadeIn({ children, delay = 0, direction = 'up', className, duration = 0.5 }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.1, rootMargin: '-40px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const hiddenStyle: CSSProperties = { opacity: 0, ...directionStyles[direction] }
  const visibleStyle: CSSProperties = { opacity: 1, transform: 'none' }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `opacity ${duration}s ease, transform ${duration}s cubic-bezier(0.21,0.47,0.32,0.98)`,
        transitionDelay: `${delay}s`,
        ...(visible ? visibleStyle : hiddenStyle),
      }}
    >
      {children}
    </div>
  )
}
