'use client'
// src/components/ShareButton.tsx
import { Share2 } from 'lucide-react'

export default function ShareButton({ title }: { title: string }) {
  return (
    <button
      onClick={() => navigator.share?.({ title, url: window.location.href })}
      className="btn-ghost text-sm"
    >
      <Share2 className="w-4 h-4" />
      Partager
    </button>
  )
}
