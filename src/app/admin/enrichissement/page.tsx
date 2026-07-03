'use client'
// src/app/admin/enrichissement/page.tsx
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Search, ExternalLink, Save, ChevronRight, ChevronLeft, AlertCircle, CheckCircle, Globe, Image as ImageIcon, MapPin, Zap } from 'lucide-react'

interface Entry {
  id: number; slug: string; nom: string; type: string; discipline: string
  description: string | null; image_url: string | null; ville: string | null
  pays: string | null; latitude: number | null; longitude: number | null
  completude: number; verified: boolean; lien: string | null
  annee: string | null; institution: string | null
}

const inputClass = "filter-select w-full text-sm py-2.5"
const labelClass = "text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-1 block"

// Sites utiles pour la recherche
const SEARCH_ENGINES = [
  { label: 'Google',      icon: '🔍', url: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q + ' Haïti')}` },
  { label: 'Wikipedia',   icon: '📖', url: (q: string) => `https://fr.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}` },
  { label: 'YouTube',     icon: '🎬', url: (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' Haiti')}` },
  { label: 'Instagram',   icon: '📸', url: (q: string) => `https://www.instagram.com/explore/search/?q=${encodeURIComponent(q)}` },
  { label: 'Facebook',    icon: '👥', url: (q: string) => `https://www.facebook.com/search/top?q=${encodeURIComponent(q)}` },
  { label: 'Wikidata',    icon: '🌐', url: (q: string) => `https://www.wikidata.org/w/index.php?search=${encodeURIComponent(q)}` },
  { label: 'SoundCloud',  icon: '🎵', url: (q: string) => `https://soundcloud.com/search?q=${encodeURIComponent(q)}` },
  { label: 'Spotify',     icon: '🎧', url: (q: string) => `https://open.spotify.com/search/${encodeURIComponent(q)}` },
]

export default function EnrichissementPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [filter, setFilter] = useState<'incomplete' | 'no_image' | 'no_geo' | 'all'>('incomplete')
  const [searchQ, setSearchQ] = useState('')

  const [form, setForm] = useState({
    description: '', image_url: '', lien: '',
    ville: '', pays: '', latitude: '', longitude: '',
    annee: '', institution: '', verified: false,
  })

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.user?.role === 'admin' || d?.user?.role === 'moderator') setAuthorized(true)
        else setAuthorized(false)
      })
  }, [])

  const loadEntries = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ filter, limit: '50', ...(searchQ && { q: searchQ }) })
      const res = await fetch(`/api/admin/enrichissement?${params}`)
      const data = await res.json()
      setEntries(data.entries ?? [])
      setCurrent(0)
    } catch {}
    finally { setLoading(false) }
  }, [filter, searchQ])

  useEffect(() => {
    if (authorized) loadEntries()
  }, [authorized, loadEntries])

  const entry = entries[current]

  useEffect(() => {
    if (!entry) return
    setForm({
      description: entry.description ?? '',
      image_url: entry.image_url ?? '',
      lien: entry.lien ?? '',
      ville: entry.ville ?? '',
      pays: entry.pays ?? '',
      latitude: entry.latitude?.toString() ?? '',
      longitude: entry.longitude?.toString() ?? '',
      annee: entry.annee ?? '',
      institution: entry.institution ?? '',
      verified: entry.verified ?? false,
    })
    setSaved(false)
  }, [entry])

  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    if (!entry) return
    setSaving(true)
    try {
      await fetch(`/api/entries/${entry.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
        }),
      })
      setSaved(true)
      // Update local entry
      setEntries(prev => prev.map((e, i) => i === current ? { ...e, ...form, latitude: form.latitude ? parseFloat(form.latitude) : null, longitude: form.longitude ? parseFloat(form.longitude) : null, completude: calcCompletude(form) } as Entry : e))
      // Auto-advance after 1s
      setTimeout(() => {
        if (current < entries.length - 1) { setCurrent(c => c + 1); setSaved(false) }
      }, 1000)
    } catch {}
    finally { setSaving(false) }
  }

  function calcCompletude(f: typeof form) {
    let s = 15 // nom always present
    if (f.description && f.description.length > 100) s += 20
    if (f.image_url) s += 15
    if (f.ville) s += 5
    if (f.pays) s += 5
    if (f.latitude) s += 10
    if (f.lien) s += 5
    return Math.min(s, 100)
  }

  function skip() {
    if (current < entries.length - 1) setCurrent(c => c + 1)
  }

  if (authorized === false) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="font-display font-bold text-2xl text-[#1A1A24]">Accès refusé</h1>
        <Link href="/" className="btn-primary mt-4 inline-flex">Accueil</Link>
      </div>
    </div>
  )

  if (authorized === null || loading) return (
    <>
      <Navbar lang="fr" />
      <main className="pt-24"><div className="section"><div className="skeleton h-96 rounded-2xl" /></div></main>
    </>
  )

  return (
    <>
      <Navbar lang="fr" />
      <main className="pt-20 pb-20">
        <div className="section max-w-7xl">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-semibold text-brand-rouge uppercase tracking-widest mb-1">Admin</div>
              <h1 className="font-display font-bold text-2xl text-[#1A1A24] flex items-center gap-2">
                <Zap className="w-6 h-6 text-brand-rouge" /> Enrichissement des entrées
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#9090A8]">
                {current + 1} / {entries.length} entrées
              </span>
              <Link href="/admin/moderation" className="btn-ghost text-sm">← Modération</Link>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9090A8]" />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Rechercher une entrée..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-rouge" />
            </div>
            {(['incomplete', 'no_image', 'no_geo', 'all'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-sm px-4 py-2 rounded-xl font-medium transition-colors ${
                  filter === f ? 'bg-brand-rouge text-white' : 'bg-black/[0.04] text-[#5A5A6E] hover:bg-black/[0.08]'
                }`}>
                {f === 'incomplete' ? '⚠️ Incomplètes' : f === 'no_image' ? '🖼️ Sans image' : f === 'no_geo' ? '📍 Sans GPS' : '📋 Toutes'}
              </button>
            ))}
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-20">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="font-display font-bold text-xl text-[#1A1A24]">Aucune entrée à enrichir !</h3>
              <p className="text-[#9090A8]">Toutes les entrées sont complètes pour ce filtre.</p>
            </div>
          ) : !entry ? null : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Colonne gauche - Info + recherche */}
              <div className="space-y-4">

                {/* Carte entrée actuelle */}
                <div className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-semibold text-brand-rouge bg-brand-rouge/10 px-2 py-0.5 rounded-full">{entry.type}</span>
                      <h2 className="font-display font-bold text-xl text-[#1A1A24] mt-2">{entry.nom}</h2>
                      <p className="text-sm text-[#9090A8]">{entry.discipline} {entry.ville && `· ${entry.ville}`}</p>
                    </div>
                    <div className="text-center flex-shrink-0">
                      <div className="relative w-14 h-14">
                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                          <circle cx="28" cy="28" r="22" fill="none" stroke="#f0f0f0" strokeWidth="5"/>
                          <circle cx="28" cy="28" r="22" fill="none"
                            stroke={entry.completude >= 70 ? '#10b981' : entry.completude >= 40 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="5" strokeLinecap="round"
                            strokeDasharray={`${(entry.completude / 100) * 138} 138`}/>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-bold text-xs text-[#1A1A24]">{entry.completude}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {entry.description && (
                    <p className="text-sm text-[#5A5A6E] line-clamp-2 mb-3">{entry.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/entry/${entry.slug}`} target="_blank"
                      className="btn-ghost text-xs flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> Voir la fiche
                    </Link>
                    {entry.lien && (
                      <a href={entry.lien} target="_blank" rel="noopener noreferrer"
                        className="btn-ghost text-xs flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Site officiel
                      </a>
                    )}
                  </div>
                </div>

                {/* Liens de recherche rapide */}
                <div className="card p-5">
                  <h3 className="font-semibold text-sm text-[#1A1A24] mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4" /> Recherche rapide
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {SEARCH_ENGINES.map(engine => (
                      <a key={engine.label}
                        href={engine.url(entry.nom)}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-black/[0.08] hover:bg-black/[0.03] hover:border-black/20 transition-colors text-sm">
                        <span>{engine.icon}</span>
                        <span className="text-[#3A3A50]">{engine.label}</span>
                        <ExternalLink className="w-3 h-3 text-[#9090A8] ml-auto" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                    className="btn-secondary flex-1 justify-center py-2.5 disabled:opacity-40">
                    <ChevronLeft className="w-4 h-4" /> Précédent
                  </button>
                  <button onClick={skip} disabled={current === entries.length - 1}
                    className="btn-ghost flex-1 justify-center py-2.5 text-[#9090A8]">
                    Passer →
                  </button>
                </div>
              </div>

              {/* Colonne droite - Formulaire enrichissement */}
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[#1A1A24]">Enrichir l'entrée</h3>
                  {saved && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Enregistré !
                    </span>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)}
                    rows={5} className={inputClass + ' resize-none'}
                    placeholder="Décrivez l'entrée en détail..." />
                  <p className="text-xs text-[#9090A8] mt-0.5">{form.description.length} caractères</p>
                </div>

                <div>
                  <label className={labelClass}><ImageIcon className="w-3 h-3 inline mr-1" /> Image (URL)</label>
                  <input value={form.image_url} onChange={e => set('image_url', e.target.value)}
                    placeholder="https://..." className={inputClass} />
                  {form.image_url && (
                    <img src={form.image_url} alt="" className="w-full h-28 object-cover rounded-xl mt-2" />
                  )}
                </div>

                <div>
                  <label className={labelClass}><Globe className="w-3 h-3 inline mr-1" /> Site web officiel</label>
                  <input value={form.lien} onChange={e => set('lien', e.target.value)}
                    placeholder="https://..." className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Ville</label>
                    <input value={form.ville} onChange={e => set('ville', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Pays</label>
                    <input value={form.pays} onChange={e => set('pays', e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}><MapPin className="w-3 h-3 inline mr-1" /> Latitude</label>
                    <input value={form.latitude} onChange={e => set('latitude', e.target.value)}
                      placeholder="18.5432" type="number" step="0.000001" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}><MapPin className="w-3 h-3 inline mr-1" /> Longitude</label>
                    <input value={form.longitude} onChange={e => set('longitude', e.target.value)}
                      placeholder="-72.3388" type="number" step="0.000001" className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Année</label>
                    <input value={form.annee} onChange={e => set('annee', e.target.value)}
                      placeholder="1968" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Institution</label>
                    <input value={form.institution} onChange={e => set('institution', e.target.value)}
                      className={inputClass} />
                  </div>
                </div>

                <WikidataSuggestion
                  entryName={entry.nom}
                  onApply={(field, value) => set(field, value)}
                />

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.verified} onChange={e => set('verified', e.target.checked)}
                    className="w-4 h-4 accent-emerald-500" />
                  <span className="text-sm text-[#1A1A24]">✅ Marquer comme vérifié</span>
                </label>

                <button onClick={save} disabled={saving}
                  className="btn-primary w-full justify-center py-3 disabled:opacity-40">
                  {saving
                    ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" /> Enregistrement...</>
                    : <><Save className="w-4 h-4" /> Enregistrer et continuer</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
