// src/app/entry/[slug]/page.tsx
export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft, MapPin, Calendar, Tag, Globe, Building, Mic, ExternalLink,
  Clock, BookOpen, CheckCircle, Star, PlayCircle, Music2
} from 'lucide-react'
import { getEntryBySlug, getRelatedEntries } from '@/lib/db'
import { STATUT_CONFIG, getTypeLabel } from '@/lib/config'
import { CATEGORY_MAP } from '@/lib/categories'
import EntryCard from '@/components/profile/EntryCard'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { cn } from '@/lib/utils'
import ShareButton from '@/components/ShareButton'
import EditEntryButton from '@/components/EditEntryButton'

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

function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export default async function EntryPage({ params }: Props) {
  const entry: any = await getEntryBySlug(params.slug)
  if (!entry) notFound()

  // Catégorie via le nouveau système (fallback sur l'ancien discipline si besoin)
  const cat = entry.discipline ? CATEGORY_MAP[entry.discipline] : null
  const statut = STATUT_CONFIG[entry.statut] ?? STATUT_CONFIG['archive']
  const typeLabel = getTypeLabel(entry.type, 'fr')

  const related = await getRelatedEntries(entry.id, entry.discipline, 3)

  const tags = (entry.tag || '').split(',').map((t: string) => t.trim()).filter(Boolean)
  const images: any[] = entry.images ?? []
  const videos: any[] = entry.videos ?? []
  const audios: any[] = entry.audios ?? []
  const timeline: any[] = (entry.timeline ?? []).slice().sort((a: any, b: any) => a.date.localeCompare(b.date))
  const sources: any[] = entry.sources ?? []
  const completude: number = entry.completude ?? 0

  return (
    <>
      <Navbar lang="fr" />

      {/* Barre colorée top */}
      <div className="h-1 w-full fixed top-0 left-0 z-[60]"
           style={{ background: `linear-gradient(90deg, ${cat?.color ?? '#C1001F'}, ${cat?.color ?? '#C1001F'}66, transparent)` }} />

      <main className="pt-24 pb-20">
        <div className="section">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#9090A8] mb-8">
            <Link href="/" className="hover:text-brand-rouge transition-colors">Accueil</Link>
            <span>/</span>
            {cat && (
              <>
                <Link href={`/categories/${entry.discipline}`} className="hover:text-brand-rouge transition-colors flex items-center gap-1">
                  {cat.emoji} {cat.label.fr}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-[#1A1A24] font-medium truncate max-w-[200px]">{entry.nom}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── Colonne principale ─────────────────────── */}
            <div className="lg:col-span-2">

              {/* Image principale / cover */}
              {entry.image_url && (
                <div className="rounded-2xl overflow-hidden mb-6 shadow-card border border-black/[0.06]">
                  <img src={entry.image_url} alt={entry.nom} className="w-full h-64 sm:h-80 object-cover" />
                </div>
              )}

              {/* Header */}
              <div className="mb-8">
                <div className="flex items-start gap-4 mb-4">
                  {!entry.image_url && (
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                      style={{ background: `${cat?.color ?? '#C1001F'}15` }}
                    >
                      {cat?.emoji ?? '📌'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className="badge-disc text-[11px]"
                        style={{ background: `${cat?.color ?? '#C1001F'}12`, color: cat?.color ?? '#C1001F' }}
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
                      {entry.verified && (
                        <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                          <CheckCircle className="w-3 h-3" /> Vérifié
                        </span>
                      )}
                      {entry.featured && (
                        <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                          <Star className="w-3 h-3" /> À la une
                        </span>
                      )}
                    </div>
                    <h1 className="font-display font-bold text-3xl md:text-4xl text-[#1A1A24] leading-tight">
                      {entry.nom}
                    </h1>
                    {(entry.nom_ht || entry.nom_en) && (
                      <p className="text-sm text-[#9090A8] mt-1.5 flex flex-wrap gap-3">
                        {entry.nom_ht && <span>🇭🇹 {entry.nom_ht}</span>}
                        {entry.nom_en && <span>🇬🇧 {entry.nom_en}</span>}
                      </p>
                    )}
                    <p className="text-[#9090A8] text-sm mt-2">
                      {entry.sous_discipline && <span className="font-medium">{entry.sous_discipline}</span>}
                      {entry.sous_discipline && entry.ville && ' · '}
                      {entry.ville && <span>{entry.ville}, {entry.pays}</span>}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 flex-wrap">
                  {cat && (
                    <Link href={`/categories/${entry.discipline}`} className="btn-ghost text-sm">
                      <ArrowLeft className="w-4 h-4" />
                      {cat.label.fr}
                    </Link>
                  )}
                  {entry.lien && entry.lien !== '—' && (
                    <a href={entry.lien} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">
                      <ExternalLink className="w-4 h-4" />
                      Lien externe
                    </a>
                  )}
                  <ShareButton title={entry.nom} />
                  <EditEntryButton slug={entry.slug} />
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-8 shadow-card border border-black/[0.06] mb-6">
                <h2 className="font-display font-bold text-xl mb-4 text-[#1A1A24]">Description</h2>
                <p className="text-[#3A3A50] leading-relaxed text-[15px] whitespace-pre-line">{entry.description}</p>

                {(entry.description_ht || entry.description_en) && (
                  <div className="mt-6 pt-6 border-t border-black/[0.06] space-y-4">
                    {entry.description_ht && (
                      <details className="group">
                        <summary className="cursor-pointer text-sm font-semibold text-[#5A5A6E] flex items-center gap-2">
                          🇭🇹 Kreyòl
                        </summary>
                        <p className="text-[#3A3A50] leading-relaxed text-[15px] mt-3 whitespace-pre-line">{entry.description_ht}</p>
                      </details>
                    )}
                    {entry.description_en && (
                      <details className="group">
                        <summary className="cursor-pointer text-sm font-semibold text-[#5A5A6E] flex items-center gap-2">
                          🇬🇧 English
                        </summary>
                        <p className="text-[#3A3A50] leading-relaxed text-[15px] mt-3 whitespace-pre-line">{entry.description_en}</p>
                      </details>
                    )}
                  </div>
                )}
              </div>

              {/* Galerie photos */}
              {images.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-card border border-black/[0.06] mb-6">
                  <h3 className="font-semibold text-sm text-[#9090A8] uppercase tracking-wide mb-4">
                    Galerie ({images.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((img: any, i: number) => (
                      <div key={i} className="relative rounded-xl overflow-hidden group">
                        <img src={img.url} alt={img.caption || ''} className="w-full h-32 object-cover" />
                        {img.caption && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-xs truncate">{img.caption}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vidéos */}
              {videos.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-card border border-black/[0.06] mb-6">
                  <h3 className="font-semibold text-sm text-[#9090A8] uppercase tracking-wide mb-4 flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" /> Vidéos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {videos.map((v: any, i: number) => {
                      const ytId = getYoutubeId(v.url || '')
                      return (
                        <div key={i}>
                          {ytId ? (
                            <div className="aspect-video rounded-xl overflow-hidden">
                              <iframe
                                src={`https://www.youtube.com/embed/${ytId}`}
                                className="w-full h-full"
                                allowFullScreen
                                title={v.caption || 'Vidéo'}
                              />
                            </div>
                          ) : (
                            <a href={v.url} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-2 p-4 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] transition-colors text-sm">
                              <PlayCircle className="w-5 h-5 text-brand-rouge" /> {v.caption || 'Voir la vidéo'}
                            </a>
                          )}
                          {v.caption && <p className="text-xs text-[#9090A8] mt-2">{v.caption}</p>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Audio */}
              {audios.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-card border border-black/[0.06] mb-6">
                  <h3 className="font-semibold text-sm text-[#9090A8] uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Music2 className="w-4 h-4" /> Écouter
                  </h3>
                  <div className="space-y-2">
                    {audios.map((a: any, i: number) => (
                      <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-3 p-3 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] transition-colors">
                        <Music2 className="w-4 h-4 text-brand-rouge flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[#1A1A24] truncate">{a.caption || 'Audio'}</div>
                          {a.credit && <div className="text-xs text-[#9090A8] truncate">{a.credit}</div>}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {timeline.length > 0 && (
                <div className="bg-white rounded-2xl p-8 shadow-card border border-black/[0.06] mb-6">
                  <h2 className="font-display font-bold text-xl mb-6 text-[#1A1A24] flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Chronologie
                  </h2>
                  <div className="space-y-6">
                    {timeline.map((ev: any, i: number) => (
                      <div key={i} className="flex gap-4 relative">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-3 h-3 rounded-full bg-brand-rouge" />
                          {i < timeline.length - 1 && <div className="w-px flex-1 bg-black/[0.1] mt-1" />}
                        </div>
                        <div className="pb-6 -mt-1">
                          <div className="text-xs font-bold text-brand-rouge uppercase tracking-wide mb-1">{ev.date}</div>
                          <h4 className="font-semibold text-[#1A1A24] mb-1">{ev.titre}</h4>
                          {ev.description && <p className="text-sm text-[#5A5A6E] leading-relaxed">{ev.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-card border border-black/[0.06] mb-6">
                  <h3 className="font-semibold text-sm text-[#9090A8] uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string) => (
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

              {/* Sources */}
              {sources.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-card border border-black/[0.06] mb-6">
                  <h3 className="font-semibold text-sm text-[#9090A8] uppercase tracking-wide mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Sources & Références
                  </h3>
                  <ul className="space-y-2">
                    {sources.map((s: any, i: number) => (
                      <li key={i} className="text-sm">
                        {s.url ? (
                          <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-brand-rouge hover:underline">
                            {s.titre}
                          </a>
                        ) : (
                          <span className="text-[#3A3A50]">{s.titre}</span>
                        )}
                        <span className="text-xs text-[#9090A8] ml-2">({s.type})</span>
                      </li>
                    ))}
                  </ul>
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
                    style={{ background: `${cat?.color ?? '#C1001F'}10`, color: cat?.color ?? '#C1001F' }}
                  >
                    {entry.rubrique}
                  </span>
                </div>
              )}
            </div>

            {/* ── Colonne latérale ──────────────────────── */}
            <div className="space-y-6">

              {/* Score complétude */}
              <div className="bg-white rounded-2xl shadow-card border border-black/[0.06] p-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="#f0f0f0" strokeWidth="6"/>
                      <circle cx="32" cy="32" r="26" fill="none"
                        stroke={completude >= 70 ? '#10b981' : completude >= 40 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={`${(completude / 100) * 163} 163`}/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-bold text-sm text-[#1A1A24]">{completude}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[#1A1A24]">Complétude</div>
                    <div className="text-xs text-[#9090A8] mt-0.5">
                      {completude >= 70 ? 'Fiche complète' : completude >= 40 ? 'En progrès' : 'À enrichir'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fiche info */}
              <div className="bg-white rounded-2xl shadow-card border border-black/[0.06] overflow-hidden">
                <div className="px-6 py-4 border-b border-black/[0.06]"
                     style={{ background: `${cat?.color ?? '#C1001F'}08` }}>
                  <h3 className="font-semibold text-sm text-[#1A1A24]">Informations</h3>
                </div>
                <div className="px-6 py-4">
                  <InfoRow icon={Globe}    label="Catégorie"  value={cat?.label.fr} />
                  <InfoRow icon={Tag}      label="Type"       value={typeLabel} />
                  <InfoRow icon={MapPin}   label="Ville"      value={entry.ville !== '—' ? entry.ville : null} />
                  <InfoRow icon={Globe}    label="Pays"       value={entry.pays !== '—' ? entry.pays : null} />
                  <InfoRow icon={Globe}    label="Région"     value={entry.region} />
                  <InfoRow icon={Calendar} label="Année"      value={entry.annee !== '—' ? entry.annee : null} />
                  <InfoRow icon={Mic}      label="Responsable" value={entry.responsable !== '—' ? entry.responsable : null} />
                  <InfoRow icon={Building} label="Institution" value={entry.institution !== '—' ? entry.institution : null} />
                  <InfoRow icon={Building} label="Studio"      value={entry.studio !== '—' ? entry.studio : null} />
                </div>
                {entry.latitude && entry.longitude && (
                  <div className="px-6 pb-4">
                    <a href={`https://www.google.com/maps?q=${entry.latitude},${entry.longitude}`}
                       target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 text-xs text-brand-rouge hover:underline">
                      <MapPin className="w-3.5 h-3.5" /> Voir sur la carte
                    </a>
                  </div>
                )}
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

              {/* Navigation catégorie */}
              {cat && (
                <div className="bg-white rounded-2xl shadow-card border border-black/[0.06] p-6">
                  <h3 className="font-semibold text-sm text-[#9090A8] uppercase tracking-wide mb-3">
                    Explorer {cat.label.fr}
                  </h3>
                  <Link
                    href={`/categories/${entry.discipline}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/[0.04] transition-colors"
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: cat.color }}>
                        {cat.label.fr}
                      </div>
                      <div className="text-xs text-[#9090A8]">Voir toutes les entrées</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Entrées connexes */}
          {related.length > 0 && (
            <section className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-2xl text-[#1A1A24]">Entrées connexes</h2>
                {cat && (
                  <Link href={`/categories/${entry.discipline}`} className="btn-ghost text-sm">
                    Voir plus →
                  </Link>
                )}
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
