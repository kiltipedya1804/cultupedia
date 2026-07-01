'use client'
// src/components/StaggerGrid.tsx
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface Props { children: ReactNode; className?: string }

export function StaggerGrid({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.05, rootMargin: '-20px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={className} data-visible={visible}>
      {children}
    </div>
  )
}

export function StaggerItem({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [parentVisible, setParentVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const parent = el.parentElement
    if (!parent) return

    // Get index among siblings
    const siblings = Array.from(parent.children)
    setIndex(siblings.indexOf(el))

    // Watch parent visibility
    const observer = new MutationObserver(() => {
      if (parent.getAttribute('data-visible') === 'true') {
        setParentVisible(true)
        observer.disconnect()
      }
    })
    observer.observe(parent, { attributes: true })

    // Check immediately
    if (parent.getAttribute('data-visible') === 'true') setParentVisible(true)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: parentVisible ? 1 : 0,
        transform: parentVisible ? 'none' : 'translateY(20px)',
        transition: `opacity 0.4s ease, transform 0.4s cubic-bezier(0.21,0.47,0.32,0.98)`,
        transitionDelay: `${index * 0.06}s`,
      }}
    >
      {children}
    </div>
  )
}
