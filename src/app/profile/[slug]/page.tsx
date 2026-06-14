// src/app/profile/[slug]/page.tsx
export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { MapPin, Globe, Instagram, Youtube, Facebook, Tag, Mail, Phone, Music2, Pencil } from 'lucide-react'
import { getProfileBySlugAny as getProfileBySlug, getUserById } from '@/lib/db'
import { getUserById as getAuthUser } from '@/lib/auth'
import { CATEGORY_MAP } from '@/lib/categories'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

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

async function getCurrentUserId(): Promise<string | null> {
  const token = cookies().get('auth_token')?.value
  if (!token) return null
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [id] = decoded.split(':')
    const user = await getAuthUser(id)
    return user?.id ?? null
  } catch { return null }
}

export default async function ProfilePage({ params }: Props) {
  const profile = await getProfileBySlug(params.slug)
  if (!profile) notFound()

  const cat = profile.discipline ? CATEGORY_MAP[profile.discipline] : null
  const tags = (profile.tags || '').split(',').map(t => t.trim()).filter(Boolean)
  const typeLabel = TYPE_LABELS[profile.type] ?? profile.type

  const currentUserId = await getCurrentUserId()
  const isOwner = currentUserId && currentUserId === profile.created_by

  const socials = [
    { key: 'lien',            label: 'Site web',  icon: Globe,    url: profile.lien },
    { key: 'lien_instagram',  label: profile.lien_instagram, icon: Instagram, url: profile.lien_instagram ? `https://instagram.com/${profile.lien_instagram.replace('@','')}` : null },
    { key: 'lien_facebook',   label: 'Facebook',  icon: Facebook, url: profile.lien_facebook },
    { key: 'lien_youtube',    label: 'YouTube',   icon: Youtube,  url: profile.lien_youtube },
    { key: 'lien_tiktok',     label: profile.lien_tiktok ? `TikTok ${profile.lien_tiktok}` : 'TikTok', icon: Music2, url: profile.lien_tiktok ? `https://tiktok.com/${profile.lien_tiktok.replace('@','')}` : null },
    { key: 'lien_twitter',    label: profile.lien_twitter ? `X ${profile.lien_twitter}` : 'X (Twitter)', icon: Music2, url: profile.lien_twitter ? `https://x.com/${profile.lien_twitter.replace('@','')}` : null },
  ].filter(s => s.url)

  const streaming = [
    { label: 'Spotify',     url: profile.lien_spotify },
    { label: 'Deezer',      url: profile.lien_deezer },
    { label: 'Apple Music', url: profile.lien_applemusic },
    { label: 'SoundCloud',  url: profile.lien_soundcloud },
  ].filter(s => s.url)

  return (
    <>
      <Navbar lang="fr" />
      <main className="pb-20">

        {/* Cover */}
        {profile.cover_image_url ? (
          <div className="w-full h-48 sm:h-64 mt-16 overflow-hidden">
            <img src={profile.cover_image_url} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-32 mt-16" style={{ background: cat ? `${cat.color}10` : '#f5f5f5' }} />
        )}

        <div className="section -mt-12 relative">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#9090A8] mb-4">
            <Link href="/" className="hover:text-brand-rouge transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/profiles" className="hover:text-brand-rouge transition-colors">Profils</Link>
            <span>/</span>
            <span className="text-[#1A1A24] font-medium">{profile.nom}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            <div className="lg:col-span-2">
              {/* Header */}
              <div className="card p-8 mb-6">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    {profile.image_url ? (
                      <img src={profile.image_url} alt={profile.nom}
                           className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-card" />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl border-4 border-white shadow-card"
                           style={{ background: cat ? `${cat.color}15` : '#f0f0f0' }}>
                        {cat?.emoji ?? '👤'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2 items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        <span className="badge-disc text-[11px] bg-brand-rouge/10 text-brand-rouge">{typeLabel}</span>
                        {cat && (
                          <span className="badge-disc text-[11px]" style={{ background: `${cat.color}12`, color: cat.color }}>
                            {cat.emoji} {cat.label.fr}
                          </span>
                        )}
                      </div>
                      {isOwner && (
                        <Link href={`/profile/${profile.slug}/edit`} className="btn-ghost text-xs flex items-center gap-1.5">
                          <Pencil className="w-3.5 h-3.5" /> Modifier
                        </Link>
                      )}
                    </div>
                    <h1 className="font-display font-bold text-3xl text-[#1A1A24] leading-tight mb-2">{profile.nom}</h1>
                    {(profile.ville || profile.pays) && (
                      <p className="flex items-center gap-1.5 text-sm text-[#9090A8]">
                        <MapPin className="w-4 h-4" />
                        {[profile.ville, profile.pays].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {profile.bio && (
                <div className="card p-8 mb-6">
                  <h2 className="font-display font-bold text-xl text-[#1A1A24] mb-4">Biographie</h2>
                  <p className="text-[#3A3A50] leading-relaxed text-[15px] whitespace-pre-line">{profile.bio}</p>
                </div>
              )}

              {streaming.length > 0 && (
                <div className="card p-6 mb-6">
                  <h3 className="font-semibold text-sm text-[#9090A8] uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Music2 className="w-4 h-4" /> Écouter
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {streaming.map(s => (
                      <a key={s.label} href={s.url!} target="_blank" rel="noopener noreferrer" className="tag text-xs">
                        🎧 {s.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {tags.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-semibold text-sm text-[#9090A8] uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="tag text-xs">#{tag}</Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Colonne latérale */}
            <div className="space-y-5">
              <div className="card p-6">
                <h3 className="font-semibold text-sm text-[#1A1A24] mb-4">Contact & Liens</h3>
                <div className="space-y-3">
                  {profile.email_contact && (
                    <a href={`mailto:${profile.email_contact}`} className="flex items-center gap-3 text-sm text-[#5A5A6E] hover:text-brand-rouge transition-colors">
                      <Mail className="w-4 h-4 flex-shrink-0" /> {profile.email_contact}
                    </a>
                  )}
                  {profile.telephone && (
                    <a href={`tel:${profile.telephone}`} className="flex items-center gap-3 text-sm text-[#5A5A6E] hover:text-brand-rouge transition-colors">
                      <Phone className="w-4 h-4 flex-shrink-0" /> {profile.telephone}
                    </a>
                  )}
                  {socials.map(s => (
                    <a key={s.key} href={s.url!} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-3 text-sm text-[#5A5A6E] hover:text-brand-rouge transition-colors">
                      <s.icon className="w-4 h-4 flex-shrink-0" /> {s.label}
                    </a>
                  ))}
                  {socials.length === 0 && !profile.email_contact && !profile.telephone && (
                    <p className="text-sm text-[#9090A8]">Aucun lien renseigné</p>
                  )}
                </div>
              </div>

              {cat && (
                <div className="card p-6">
                  <h3 className="font-semibold text-sm text-[#9090A8] uppercase tracking-wide mb-3">Catégorie</h3>
                  <Link href={`/categories/${profile.discipline}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/[0.04] transition-colors">
                    <span className="text-2xl">{cat.emoji}</span>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: cat.color }}>{cat.label.fr}</div>
                      <div className="text-xs text-[#9090A8]">Voir les entrées</div>
                    </div>
                  </Link>
                </div>
              )}

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
