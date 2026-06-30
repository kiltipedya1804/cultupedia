'use client'
// src/components/profile/EntryCard.tsx
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Calendar, Eye, CheckCircle, Star } from 'lucide-react'
import { DISCIPLINE_MAP, STATUT_CONFIG, getTypeLabel } from '@/lib/config'
import { CATEGORY_MAP } from '@/lib/categories'
import { cn } from '@/lib/utils'
import type { Entry, Lang } from '@/types'

interface EntryCardProps {
  entry: Entry & { category?: string; completude?: number; verified?: boolean }
  lang?: Lang
  compact?: boolean
  priority?: boolean
}

export default function EntryCard({ entry, lang = 'fr', compact = false, priority = false }: EntryCardProps) {
  const cat = (entry as any).category ? CATEGORY_MAP[(entry as any).category] : (DISCIPLINE_MAP as any)[entry.discipline]
  const statut = STATUT_CONFIG[entry.statut as keyof typeof STATUT_CONFIG] ?? STATUT_CONFIG['archive']
  const typeLabel = getTypeLabel(entry.type, lang)

  if (compact) {
    return (
      <Link href={`/entry/${entry.slug}`} className="group flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-black/[0.03] transition-colors">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: `${cat?.color}18` }}
        >
          {cat?.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-[#1A1A24] group-hover:text-brand-rouge transition-colors truncate">
            {entry.nom}
          </div>
          <div className="text-xs text-[#9090A8] mt-0.5 flex items-center gap-2">
            <span>{typeLabel}</span>
            {entry.ville && <><span>·</span><span>{entry.ville}</span></>}
          </div>
        </div>
        <div className={cn('w-2 h-2 rounded-full flex-shrink-0', statut.dot)} />
      </Link>
    )
  }

  return (
    <Link href={`/entry/${entry.slug}`} className="card group block p-0">
      {/* Header coloré */}
      <div
        className="h-2 w-full rounded-t-2xl transition-opacity duration-300 group-hover:opacity-80"
        style={{ background: `linear-gradient(90deg, ${cat?.color}, ${cat?.color}99)` }}
      />

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {entry.image_url ? (
            <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 relative bg-black/[0.03]">
              <Image
                src={entry.image_url}
                alt={entry.nom}
                fill
                sizes="44px"
                loading={priority ? 'eager' : 'lazy'}
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: `${cat?.color}15` }}
            >
              {cat?.emoji}
            </div>
          )}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {(entry as any).verified && (
              <span title="Vérifié"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /></span>
            )}
            {entry.featured && (
              <span title="À la une"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /></span>
            )}
            <span className={cn('flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full', statut.bg, statut.color)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', statut.dot)} />
              {entry.statut === 'en_cours' ? 'Actif' : entry.statut === 'archive' ? 'Archive' : entry.statut}
            </span>
          </div>
        </div>

        {/* Nom */}
        <h3 className="font-display font-bold text-[#1A1A24] text-base leading-tight mb-1 group-hover:text-brand-rouge transition-colors line-clamp-2">
          {entry.nom}
        </h3>

        {/* Type + sous-discipline */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="badge-disc text-[10px]"
            style={{ background: `${cat?.color}12`, color: cat?.color }}
          >
            {typeLabel}
          </span>
          {entry.sous_discipline && (
            <span className="text-xs text-[#9090A8] truncate">{entry.sous_discipline}</span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-[#5A5A6E] leading-relaxed line-clamp-2 mb-4">
          {entry.description}
        </p>

        {/* Footer meta */}
        <div className="flex items-center justify-between text-xs text-[#9090A8] pt-3 border-t border-black/[0.05]">
          <div className="flex items-center gap-3">
            {(entry.ville || entry.pays) && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {entry.ville || entry.pays}
              </span>
            )}
            {entry.annee && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {entry.annee}
              </span>
            )}
          </div>
          {entry.views !== undefined && entry.views > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {entry.views > 1000 ? `${(entry.views / 1000).toFixed(1)}k` : entry.views}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
