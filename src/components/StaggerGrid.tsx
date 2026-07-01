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

    setTimeout(() => {
      const rect = el.getBoundingClientRect()
      const inView = rect.top < window.innerHeight

      if (inView) {
        setTimeout(() => setVisible(true), 100)
      } else {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
          },
          { threshold: 0.05 }
        )
        observer.observe(el)
        return () => observer.disconnect()
      }
    }, 50)
  }, [])

  return (
    <div ref={ref} className={className} data-visible={String(visible)}>
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

    const siblings = Array.from(parent.children)
    setIndex(siblings.indexOf(el))

    const check = () => {
      if (parent.getAttribute('data-visible') === 'true') {
        setParentVisible(true)
        return true
      }
      return false
    }

    if (check()) return

    const observer = new MutationObserver(() => {
      if (check()) observer.disconnect()
    })
    observer.observe(parent, { attributes: true, attributeFilter: ['data-visible'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: parentVisible ? 1 : 0,
        transform: parentVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.21,0.47,0.32,0.98)',
        transitionDelay: `${index * 0.07}s`,
      }}
    >
      {children}
    </div>
  )
}
