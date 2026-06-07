// src/app/entry/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Tag, Globe, Building, Mic, ExternalLink, Share2 } from 'lucide-react'
import { getEntryBySlug, getRelatedEntries } from '@/lib/db'
import { DISCIPLINE_MAP, STATUT_CONFIG, getTypeLabel } from '@/lib/config'
import EntryCard from '@/components/profile/EntryCard'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { cn } from '@/lib/utils'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = await getEntryBySlug(params.slug)
  if (!entry) return { title: 'Entrée introuvable' }
  return {
    title: entry.nom,
    description: entry.description?.slice(0, 160),
    openGraph: {
      title: `${entry.nom} | Cultupedia`,
      description: entry.description?.slice(0, 160),
      images: entry.image_url ? [entry.image_url] : ['/og-image.jpg'],
    },
  }
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  if (!value || value === '—' || value === '') return null
  return (
    <div className="info-row">
      <Icon className="w-4 h-4 text-[#9090A8] flex-shrink-0 mt-0.5" />
      <div>
        <div className="text-xs text-[#9090A8] uppercase tracking-wide font-medium">{label}</div>
        <div className="text-sm text-[#1A1A24] font-medium mt-0.5">{value}</div>
      </div>
    </div>
  )
}

export default async function EntryPage({ params }: Props) {
  const entry = await getEntryBySlug(params.slug)
  if (!entry) notFound()

  const disc  = DISCIPLINE_MAP[entry.discipline]
  const statut = STATUT_CONFIG[entry.statut] ?? STATUT_CONFIG['archive']
  const typeLabel = getTypeLabel(entry.type, 'fr')

  const related = await getRelatedEntries(entry.id, entry.discipline, 3)

  const tags = (entry.tag || '').split(',').map(t => t.trim()).filter(Boolean)

  return (
    <>
      <Navbar lang="fr" />

      {/* Barre colorée top */}
      <div className="h-1 w-full fixed top-0 left-0 z-[60]"
           style={{ background: `linear-gradient(90deg, ${disc?.color}, ${disc?.color}66, transparent)` }} />

      <main className="pt-24 pb-20">
        <div className="section">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#9090A8] mb-8">
            <Link href="/" className="hover:text-brand-rouge transition-colors">Accueil</Link>
            <span>/</span>
            <Link href={`/categories/${entry.discipline}`} className="hover:text-brand-rouge transition-colors flex items-center gap-1">
              {disc?.emoji} {disc?.label.fr}
            </Link>
            <span>/</span>
            <span className="text-[#1A1A24] font-medium truncate max-w-[200px]">{entry.nom}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── Colonne principale ─────────────────────── */}
            <div className="lg:col-span-2">

              {/* Header */}
              <div className="mb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ background: `${disc?.color}15` }}
                  >
                    {disc?.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className="badge-disc text-[11px]"
                        style={{ background: `${disc?.color}12`, color: disc?.color }}
                      >
                        {typeLabel}
                      </span>
                      <span className={cn(
                        'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                        statut.bg, statut.color
                      )}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', statut.dot)} />
                        {entry.statut === 'en_cours' ? 'Actif' : entry.statut === 'archive' ? 'Archive' : entry.statut}
                      </span>
                    </div>
                    <h1 className="font-display font-bold text-3xl md:text-4xl text-[#1A1A24] leading-tight">
                      {entry.nom}
                    </h1>
                    <p className="text-[#9090A8] text-sm mt-2">
                      {entry.sous_discipline && <span className="font-medium">{entry.sous_discipline}</span>}
                      {entry.sous_discipline && entry.ville && ' · '}
                      {entry.ville && <span>{entry.ville}, {entry.pays}</span>}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 flex-wrap">
                  <Link href={`/categories/${entry.discipline}`} className="btn-ghost text-sm">
                    <ArrowLeft className="w-4 h-4" />
                    {disc?.label.fr}
                  </Link>
                  {entry.lien && entry.lien !== '—' && (
                    <a href={entry.lien} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">
                      <ExternalLink className="w-4 h-4" />
                      Lien externe
                    </a>
                  )}
                  <button
                    onClick={() => navigator.share?.({ title: entry.nom, url: window.location.href })}
                    className="btn-ghost text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Partager
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-8 shadow-card border border-black/[0.06] mb-6">
                <h2 className="font-display font-bold text-xl mb-4 text-[#1A1A24]">Description</h2>
                <p className="text-[#3A3A50] leading-relaxed text-[15px]">{entry.description}</p>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-card border border-black/[0.06] mb-6">
                  <h3 className="font-semibold text-sm text-[#9090A8] uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Link
                        key={tag}
                        href={`/search?q=${encodeURIComponent(tag)}`}
                        className="tag text-xs"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Rubrique */}
              {entry.rubrique && entry.rubrique !== '—' && (
                <div className="bg-white rounded-2xl p-6 shadow-card border border-black/[0.06]">
                  <h3 className="font-semibold text-sm text-[#9090A8] uppercase tracking-wide mb-2">
                    Rubrique
                  </h3>
                  <span
                    className="badge-disc capitalize"
                    style={{ background: `${disc?.color}10`, color: disc?.color }}
                  >
                    {entry.rubrique}
                  </span>
                </div>
              )}
            </div>

            {/* ── Colonne latérale ──────────────────────── */}
            <div className="space-y-6">

              {/* Fiche info */}
              <div className="bg-white rounded-2xl shadow-card border border-black/[0.06] overflow-hidden">
                <div className="px-6 py-4 border-b border-black/[0.06]"
                     style={{ background: `${disc?.color}08` }}>
                  <h3 className="font-semibold text-sm text-[#1A1A24]">Informations</h3>
                </div>
                <div className="px-6 py-4">
                  <InfoRow icon={Globe}    label="Discipline" value={disc?.label.fr} />
                  <InfoRow icon={Tag}      label="Type"       value={typeLabel} />
                  <InfoRow icon={MapPin}   label="Ville"      value={entry.ville !== '—' ? entry.ville : null} />
                  <InfoRow icon={Globe}    label="Pays"       value={entry.pays !== '—' ? entry.pays : null} />
                  <InfoRow icon={Globe}    label="Région"     value={entry.region} />
                  <InfoRow icon={Calendar} label="Année"      value={entry.annee !== '—' ? entry.annee : null} />
                  <InfoRow icon={Mic}      label="Responsable" value={entry.responsable !== '—' ? entry.responsable : null} />
                  <InfoRow icon={Building} label="Institution" value={entry.institution !== '—' ? entry.institution : null} />
                  <InfoRow icon={Building} label="Studio"      value={entry.studio !== '—' ? entry.studio : null} />
                </div>
              </div>

              {/* Référence */}
              {entry.reference && entry.reference !== '—' && (
                <div className="bg-white rounded-2xl shadow-card border border-black/[0.06] p-6">
                  <h3 className="font-semibold text-sm text-[#9090A8] uppercase tracking-wide mb-2">
                    Référence
                  </h3>
                  <code className="text-xs text-[#5A5A6E] font-mono bg-black/[0.04] px-2 py-1 rounded">
                    {entry.reference}
                  </code>
                </div>
              )}

              {/* Navigation discipline */}
              <div className="bg-white rounded-2xl shadow-card border border-black/[0.06] p-6">
                <h3 className="font-semibold text-sm text-[#9090A8] uppercase tracking-wide mb-3">
                  Explorer {disc?.label.fr}
                </h3>
                <Link
                  href={`/categories/${entry.discipline}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/[0.04] transition-colors"
                >
                  <span className="text-2xl">{disc?.emoji}</span>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: disc?.color }}>
                      {disc?.label.fr}
                    </div>
                    <div className="text-xs text-[#9090A8]">Voir toutes les entrées</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Entrées connexes */}
          {related.length > 0 && (
            <section className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-2xl text-[#1A1A24]">Entrées connexes</h2>
                <Link href={`/categories/${entry.discipline}`} className="btn-ghost text-sm">
                  Voir plus →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map(rel => (
                  <EntryCard key={rel.id} entry={rel} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer lang="fr" />
    </>
  )
}
