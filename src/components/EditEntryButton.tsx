'use client'
// src/components/EditEntryButton.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Pencil } from 'lucide-react'

export default function EditEntryButton({ slug }: { slug: string }) {
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user?.role === 'admin' || data?.user?.role === 'moderator') {
          setCanEdit(true)
        }
      })
      .catch(() => {})
  }, [])

  if (!canEdit) return null

  return (
    <Link href={`/entry/${slug}/edit`} className="btn-ghost text-sm">
      <Pencil className="w-4 h-4" />
      Modifier
    </Link>
  )
}
