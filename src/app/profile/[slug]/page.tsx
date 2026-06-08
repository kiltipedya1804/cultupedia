// src/app/profile/[slug]/page.tsx
export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Globe, Instagram, Youtube, Facebook, Tag, ArrowLeft, Music, Users } from 'lucide-react'
import { getProfileBySlug } from '@/lib/db'
import { DISCIPLINE_MAP } from '@/lib/config'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Discipline } from '@/types'

interface Props { params: { slug: string } }

const TYPE_LABELS: Record<string, string> = {
  artiste: 'Artiste', musicien: 'Musicien / Chanteur', danseur: 'Danseur / Chorégraphe',
  acteur: 'Acteur / Comédien', realisateur: 'Réalisateur', ecrivain: 'Écrivain',
  responsable_culturel: 'Responsable culturel', collaborateur: 'Collaborateur', autre: 'Autre',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getProfileBySlug(params.slug)
  if (!profile) return { title: 'Profil introuvable' }
  return {
    title: `${profile.nom} — Cultupedia`,
    description: profile.bio?.slice(0, 160) ?? `Profil de ${profile.nom} sur Cultupedia`,
  }
}

export default async function ProfilePage({ params }: Props) {
  const profile = await getProfileBySlug(params.slug)
  if (!profile) notFound()

  const disc = profile.discipline ? DISCIPLINE_MAP[profile.discipline as Discipline] : null
  const tags = (profile.tags || '').split(',').map(t => t.trim()).filter(Boolean)
  const typeLabel = TYPE_LABELS[profile.type] ?? profile.type

  return (
    <>
      <Navbar lang="fr" />
      <main className="pt-24 pb-20">
        <div className="section max-w-4xl">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#9090A8] mb-8">
            <Link href="/" className="hover:text-brand-rouge transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/profiles" className="hover:text-brand-rouge transition-colors">Profils</Link>
            <span>/</span>
            <span className="text-[#1A1A24] font-medium">{profile.nom}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Colonne principale */}
            <div className="lg:col-span-2">

              {/* Header profil */}
              <div className="card p-8 mb-6">
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {profile.image_url ? (
                      <img src={profile.image_url} alt={profile.nom}
                           className="w-24 h-24 rounded-2xl object-cover" />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl"
                           style={{ background: disc ? `${disc.color}15` : '#f0f0f0' }}>
                        {disc?.emoji ?? '👤'}
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="badge-disc text-[11px] bg-brand-rouge/10 text-brand-rouge">
                        {typeLabel}
                      </span>
                      {disc && (
                        <span className="badge-disc text-[11px]"
                              style={{ background: `${disc.color}12`, color: disc.color }}>
                          {disc.emoji} {disc.label.fr}
                        </span>
                      )}
                    </div>
                    <h1 className="font-display font-bold text-3xl text-[#1A1A24] leading-tight mb-2">
                      {profile.nom}
                    </h1>
                    {(profile.ville || profile.pays) && (
                      <p className="flex items-center gap-1.5 text-sm text-[#9090A8]">
                        <MapPin className="w-4 h-4" />
                        {[profile.ville, profile.pays].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="card p-8 mb-6">
                  <h2 className="font-display font-bold text-xl text-[#1A1A24] mb-4">Biographie</h2>
                  <p className="text-[#3A3A50] leading-relaxed text-[15px] whitespace-pre-line">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-semibold text-sm text-[#9090A8] uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="tag text-xs">
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Colonne latérale */}
            <div className="space-y-5">

              {/* Liens */}
              <div className="card p-6">
                <h3 className="font-semibold text-sm text-[#1A1A24] mb-4">Liens</h3>
                <div className="space-y-3">
                  {profile.lien && (
                    <a href={profile.lien} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-3 text-sm text-[#5A5A6E] hover:text-brand-rouge transition-colors">
                      <Globe className="w-4 h-4 flex-shrink-0" /> Site web
                    </a>
                  )}
                  {profile.lien_instagram && (
                    <a href={`https://instagram.com/${profile.lien_instagram.replace('@','')}`}
                       target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-3 text-sm text-[#5A5A6E] hover:text-brand-rouge transition-colors">
                      <Instagram className="w-4 h-4 flex-shrink-0" /> {profile.lien_instagram}
                    </a>
                  )}
                  {profile.lien_facebook && (
                    <a href={profile.lien_facebook} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-3 text-sm text-[#5A5A6E] hover:text-brand-rouge transition-colors">
                      <Facebook className="w-4 h-4 flex-shrink-0" /> Facebook
                    </a>
                  )}
                  {profile.lien_youtube && (
                    <a href={profile.lien_youtube} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-3 text-sm text-[#5A5A6E] hover:text-brand-rouge transition-colors">
                      <Youtube className="w-4 h-4 flex-shrink-0" /> YouTube
                    </a>
                  )}
                  {!profile.lien && !profile.lien_instagram && !profile.lien_facebook && !profile.lien_youtube && (
                    <p className="text-sm text-[#9090A8]">Aucun lien renseigné</p>
                  )}
                </div>
              </div>

              {/* Discipline */}
              {disc && (
                <div className="card p-6">
                  <h3 className="font-semibold text-sm text-[#9090A8] uppercase tracking-wide mb-3">Discipline</h3>
                  <Link href={`/categories/${profile.discipline}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/[0.04] transition-colors">
                    <span className="text-2xl">{disc.emoji}</span>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: disc.color }}>{disc.label.fr}</div>
                      <div className="text-xs text-[#9090A8]">Voir les entrées</div>
                    </div>
                  </Link>
                </div>
              )}

              {/* CTA créer profil */}
              <div className="card p-6 bg-brand-rouge/[0.04] border-brand-rouge/10">
                <h3 className="font-semibold text-sm text-[#1A1A24] mb-2">Vous connaissez quelqu'un ?</h3>
                <p className="text-xs text-[#5A5A6E] mb-4 leading-relaxed">
                  Ajoutez un artiste ou collaborateur haïtien à Cultupedia.
                </p>
                <Link href="/profile/create" className="btn-primary text-sm w-full justify-center py-2.5">
                  Créer un profil
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer lang="fr" />
    </>
  )
}
