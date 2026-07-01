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
  up:    { transform: 'translateY(28px)' },
  down:  { transform: 'translateY(-28px)' },
  left:  { transform: 'translateX(28px)' },
  right: { transform: 'translateX(-28px)' },
  none:  { transform: 'none' },
}

export default function FadeIn({ children, delay = 0, direction = 'up', className, duration = 0.6 }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Small timeout to ensure hydration is complete
    const timer = setTimeout(() => {
      const rect = el.getBoundingClientRect()
      const inView = rect.top < window.innerHeight && rect.bottom > 0

      if (inView) {
        // Element already visible - animate after delay
        setTimeout(() => setVisible(true), delay * 1000)
      } else {
        // Element below fold - use IntersectionObserver
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setVisible(true)
              observer.disconnect()
            }
          },
          { threshold: 0.1 }
        )
        observer.observe(el)
        return () => observer.disconnect()
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [delay])

  const hiddenStyle: CSSProperties = { opacity: 0, ...directionStyles[direction] }
  const visibleStyle: CSSProperties = { opacity: 1, transform: 'none' }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `opacity ${duration}s ease, transform ${duration}s cubic-bezier(0.21,0.47,0.32,0.98)`,
        transitionDelay: visible ? '0s' : `${delay}s`,
        ...(visible ? visibleStyle : hiddenStyle),
      }}
    >
      {children}
    </div>
  )
}
