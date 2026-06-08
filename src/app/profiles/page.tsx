'use client'
// src/app/profiles/page.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, Plus } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { cn } from '@/lib/utils'

const TYPES = [
  { id: '', label: 'Tous' },
  { id: 'musicien', label: 'Musiciens' },
  { id: 'danseur', label: 'Danseurs' },
  { id: 'acteur', label: 'Acteurs' },
  { id: 'realisateur', label: 'Réalisateurs' },
  { id: 'ecrivain', label: 'Écrivains' },
  { id: 'artiste', label: 'Artistes' },
  { id: 'responsable_culturel', label: 'Responsables' },
  { id: 'collaborateur', label: 'Collaborateurs' },
]

const TYPE_LABELS: Record<string, string> = {
  artiste: 'Artiste', musicien: 'Musicien', danseur: 'Danseur',
  acteur: 'Acteur', realisateur: 'Réalisateur', ecrivain: 'Écrivain',
  responsable_culturel: 'Responsable', collaborateur: 'Collaborateur', autre: 'Autre',
}

interface Profile {
  id: string; slug: string; nom: string; type: string; discipline: string | null
  bio: string | null; ville: string | null; pays: string | null; image_url: string | null; tags: string | null
}

export default function ProfilesPage() {
  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (type) params.set('type', type)
        const res = await fetch(`/api/profiles?${params}`)
        const data = await res.json()
        setProfiles(data.profiles ?? [])
        setTotal(data.total ?? 0)
      } catch {}
      finally { setLoading(false) }
    }
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [q, type])

  return (
    <>
      <Navbar lang="fr" />
      <main className="pt-24 pb-20">
        <div className="section">

          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-2">Annuaire</div>
              <h1 className="font-display font-bold text-4xl text-[#1A1A24]">Profils culturels</h1>
              <p className="text-[#5A5A6E] mt-2">{total.toLocaleString('fr')} profils validés</p>
            </div>
            <Link href="/profile/create" className="btn-primary">
              <Plus className="w-4 h-4" /> Ajouter un profil
            </Link>
          </div>

          {/* Recherche */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9090A8]" />
              <input value={q} onChange={e => setQ(e.target.value)}
                     placeholder="Rechercher un nom..."
                     className="search-input pl-11 py-3 text-sm" />
            </div>
          </div>

          {/* Filtres type */}
          <div className="flex flex-wrap gap-2 mb-8">
            {TYPES.map(t => (
              <button key={t.id} onClick={() => setType(t.id)}
                      className={cn('tag text-xs', type === t.id && 'active')}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Grille */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-48 rounded-2xl" />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">👤</div>
              <h3 className="font-display font-bold text-xl text-[#1A1A24] mb-2">Aucun profil trouvé</h3>
              <p className="text-[#9090A8] mb-6">Soyez le premier à en ajouter un !</p>
              <Link href="/profile/create" className="btn-primary">Créer un profil</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {profiles.map(profile => (
                <Link key={profile.id} href={`/profile/${profile.slug}`}
                      className="card group block p-0 overflow-hidden">
                  {/* Header */}
                  <div className="h-2 w-full bg-gradient-to-r from-brand-rouge to-brand-rouge/50" />
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      {profile.image_url ? (
                        <img src={profile.image_url} alt={profile.nom}
                             className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-brand-rouge/10 flex items-center justify-center text-xl flex-shrink-0">
                          👤
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold text-brand-rouge uppercase tracking-wide">
                          {TYPE_LABELS[profile.type] ?? profile.type}
                        </span>
                        <h3 className="font-display font-bold text-[#1A1A24] text-base leading-tight group-hover:text-brand-rouge transition-colors line-clamp-1">
                          {profile.nom}
                        </h3>
                      </div>
                    </div>
                    {profile.bio && (
                      <p className="text-sm text-[#5A5A6E] line-clamp-2 mb-3 leading-relaxed">
                        {profile.bio}
                      </p>
                    )}
                    {(profile.ville || profile.pays) && (
                      <p className="flex items-center gap-1 text-xs text-[#9090A8]">
                        <MapPin className="w-3 h-3" />
                        {[profile.ville, profile.pays].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer lang="fr" />
    </>
  )
}
