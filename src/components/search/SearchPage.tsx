'use client'
// src/components/search/SearchPage.tsx
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, ChevronDown, Grid3X3, List, CheckCircle, Star, Filter } from 'lucide-react'
import EntryCard from '@/components/profile/EntryCard'
import { CATEGORIES } from '@/lib/categories'
import { REGIONS, SORT_OPTIONS } from '@/lib/config'
import { cn } from '@/lib/utils'
import type { Entry } from '@/types'

interface SearchResult {
  entries: Entry[]
  total: number
  page: number
  totalPages: number
  facets?: {
    disciplines?: { value: string; count: number }[]
    pays?: { value: string; count: number }[]
    types?: { value: string; count: number }[]
  }
}

const STATUTS = [
  { id: 'en_cours', label: 'Actif' },
  { id: 'archive',  label: 'Archive' },
  { id: 'en_projet',label: 'En projet' },
]

const ANNEES = ['2020s', '2010s', '2000s', '1990s', '1980s', '1970s', 'Avant 1970']

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [q,          setQ]          = useState(searchParams.get('q')          ?? '')
  const [discipline, setDiscipline] = useState(searchParams.get('discipline') ?? '')
  const [region,     setRegion]     = useState(searchParams.get('region')     ?? '')
  const [statut,     setStatut]     = useState(searchParams.get('statut')     ?? '')
  const [pays,       setPays]       = useState(searchParams.get('pays')       ?? '')
  const [type,       setType]       = useState(searchParams.get('type')       ?? '')
  const [verified,   setVerified]   = useState(searchParams.get('verified')   === 'true')
  const [featured,   setFeatured]   = useState(searchParams.get('featured')   === 'true')
  const [sort,       setSort]       = useState(searchParams.get('sort')       ?? 'created_at:desc')
  const [page,       setPage]       = useState(parseInt(searchParams.get('page') ?? '1'))
  const [view,       setView]       = useState<'grid'|'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [result,  setResult]  = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)

  const activeFilters = [discipline, region, statut, pays, type, verified, featured].filter(Boolean).length

  const fetchResults = useCallback(async () => {
    setLoading(true)
    try {
      const [sortField, sortOrder] = sort.split(':')
      const params = new URLSearchParams({
        ...(q          && { q }),
        ...(discipline && { discipline }),
        ...(region     && { region }),
        ...(statut     && { statut }),
        ...(pays       && { pays }),
        ...(type       && { type }),
        ...(verified   && { verified: 'true' }),
        ...(featured   && { featured: 'true' }),
        sort: sortField,
        order: sortOrder ?? 'desc',
        page: String(page),
        limit: '24',
      })
      const res = await fetch(`/api/entries?${params}`)
      const data = await res.json()
      setResult(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [q, discipline, region, statut, pays, type, verified, featured, sort, page])

  useEffect(() => {
    const t = setTimeout(fetchResults, 300)
    return () => clearTimeout(t)
  }, [fetchResults])

  function clearFilters() {
    setDiscipline(''); setRegion(''); setStatut('')
    setPays(''); setType(''); setVerified(false); setFeatured(false)
    setPage(1)
  }

  function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-brand-rouge/10 text-brand-rouge">
        {label}
        <button onClick={onRemove}><X className="w-3 h-3" /></button>
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Search header */}
      <div className="bg-white border-b border-black/[0.06] sticky top-16 z-20 shadow-sm">
        <div className="section py-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9090A8]" />
              <input
                value={q}
                onChange={e => { setQ(e.target.value); setPage(1) }}
                placeholder="Rechercher parmi 122 000+ entrées..."
                className="w-full pl-12 pr-4 py-3.5 text-sm border border-black/[0.1] rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-rouge bg-white"
              />
              {q && (
                <button onClick={() => setQ('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-[#9090A8]" />
                </button>
              )}
            </div>

            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={cn(
                'flex items-center gap-2 px-4 py-3.5 rounded-2xl border text-sm font-semibold transition-colors',
                filtersOpen || activeFilters > 0
                  ? 'bg-brand-rouge text-white border-brand-rouge'
                  : 'bg-white border-black/[0.1] text-[#1A1A24] hover:border-black/20'
              )}
            >
              <Filter className="w-4 h-4" />
              Filtres
              {activeFilters > 0 && (
                <span className="w-5 h-5 rounded-full bg-white/20 text-white text-xs flex items-center justify-center font-bold">
                  {activeFilters}
                </span>
              )}
            </button>

            <div className="flex gap-1 border border-black/[0.1] rounded-xl overflow-hidden">
              <button onClick={() => setView('grid')}
                className={cn('p-3 transition-colors', view === 'grid' ? 'bg-brand-rouge text-white' : 'text-[#9090A8] hover:bg-black/[0.04]')}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setView('list')}
                className={cn('p-3 transition-colors', view === 'list' ? 'bg-brand-rouge text-white' : 'text-[#9090A8] hover:bg-black/[0.04]')}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filtres actifs */}
          {activeFilters > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 items-center">
              {discipline && <FilterTag label={CATEGORIES.find(c => c.id === discipline)?.label.fr ?? discipline} onRemove={() => setDiscipline('')} />}
              {region     && <FilterTag label={region} onRemove={() => setRegion('')} />}
              {statut     && <FilterTag label={STATUTS.find(s => s.id === statut)?.label ?? statut} onRemove={() => setStatut('')} />}
              {pays       && <FilterTag label={pays} onRemove={() => setPays('')} />}
              {type       && <FilterTag label={type} onRemove={() => setType('')} />}
              {verified   && <FilterTag label="✅ Vérifié" onRemove={() => setVerified(false)} />}
              {featured   && <FilterTag label="⭐ À la une" onRemove={() => setFeatured(false)} />}
              <button onClick={clearFilters} className="text-xs text-[#9090A8] hover:text-brand-rouge underline">
                Tout effacer
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="section py-6">
        <div className="flex gap-6">

          {/* Panneau filtres */}
          {filtersOpen && (
            <div className="w-64 flex-shrink-0 space-y-5">
              <div className="card p-5">
                <h3 className="font-semibold text-sm text-[#1A1A24] mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Filtres avancés
                </h3>

                {/* Catégorie */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-2 block">Catégorie</label>
                  <select value={discipline} onChange={e => { setDiscipline(e.target.value); setPage(1) }}
                    className="filter-select w-full text-sm py-2">
                    <option value="">Toutes</option>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label.fr}</option>)}
                  </select>
                </div>

                {/* Statut */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-2 block">Statut</label>
                  <select value={statut} onChange={e => { setStatut(e.target.value); setPage(1) }}
                    className="filter-select w-full text-sm py-2">
                    <option value="">Tous</option>
                    {STATUTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>

                {/* Région */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-2 block">Région</label>
                  <select value={region} onChange={e => { setRegion(e.target.value); setPage(1) }}
                    className="filter-select w-full text-sm py-2">
                    <option value="">Toutes</option>
                    {REGIONS.map((r: string) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Pays */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-2 block">Pays</label>
                  <input value={pays} onChange={e => { setPays(e.target.value); setPage(1) }}
                    placeholder="Ex: Haïti, France..." className="filter-select w-full text-sm py-2" />
                </div>

                {/* Type */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-[#9090A8] uppercase tracking-wide mb-2 block">Type</label>
                  <input value={type} onChange={e => { setType(e.target.value); setPage(1) }}
                    placeholder="Ex: artiste_solo, festival..." className="filter-select w-full text-sm py-2" />
                </div>

                {/* Options spéciales */}
                <div className="space-y-2 pt-2 border-t border-black/[0.06]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={verified} onChange={e => { setVerified(e.target.checked); setPage(1) }}
                      className="w-4 h-4 accent-emerald-500" />
                    <span className="text-sm text-[#1A1A24] flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Vérifiées seulement
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={featured} onChange={e => { setFeatured(e.target.checked); setPage(1) }}
                      className="w-4 h-4 accent-amber-400" />
                    <span className="text-sm text-[#1A1A24] flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400" /> À la une seulement
                    </span>
                  </label>
                </div>

                {activeFilters > 0 && (
                  <button onClick={clearFilters}
                    className="w-full mt-4 text-xs text-[#9090A8] hover:text-brand-rouge py-2 border border-black/[0.08] rounded-xl transition-colors">
                    Effacer tous les filtres
                  </button>
                )}
              </div>

              {/* Tri */}
              <div className="card p-5">
                <h3 className="font-semibold text-sm text-[#1A1A24] mb-3">Trier par</h3>
                <div className="space-y-1">
                  {[
                    { id: 'created_at:desc', label: 'Plus récent' },
                    { id: 'views:desc',      label: 'Plus populaire' },
                    { id: 'nom:asc',         label: 'Nom A→Z' },
                    { id: 'nom:desc',        label: 'Nom Z→A' },
                    { id: 'completude:desc', label: 'Plus complet' },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setSort(opt.id)}
                      className={cn(
                        'w-full text-left text-sm px-3 py-2 rounded-xl transition-colors',
                        sort === opt.id ? 'bg-brand-rouge/10 text-brand-rouge font-semibold' : 'hover:bg-black/[0.04] text-[#5A5A6E]'
                      )}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Résultats */}
          <div className="flex-1 min-w-0">
            {/* Barre résultats */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-[#5A5A6E]">
                {loading ? 'Recherche...' : (
                  result ? (
                    <><strong className="text-[#1A1A24]">{result.total.toLocaleString('fr')}</strong> résultat{result.total > 1 ? 's' : ''}{q && <> pour "<strong>{q}</strong>"</>}</>
                  ) : null
                )}
              </p>
              {!filtersOpen && (
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="text-sm border border-black/[0.1] rounded-xl px-3 py-2 outline-none bg-white">
                  <option value="created_at:desc">Plus récent</option>
                  <option value="views:desc">Plus populaire</option>
                  <option value="nom:asc">Nom A→Z</option>
                  <option value="completude:desc">Plus complet</option>
                </select>
              )}
            </div>

            {loading ? (
              <div className={cn(
                'grid gap-5',
                view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
              )}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton h-56 rounded-2xl" />
                ))}
              </div>
            ) : result?.entries.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-[#9090A8] mx-auto mb-4 opacity-40" />
                <h3 className="font-display font-bold text-xl text-[#1A1A24] mb-2">Aucun résultat</h3>
                <p className="text-[#9090A8] mb-6">Essayez d'autres mots-clés ou retirez des filtres.</p>
                <button onClick={clearFilters} className="btn-primary">Effacer les filtres</button>
              </div>
            ) : (
              <>
                <div className={cn(
                  'grid gap-5',
                  view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                )}>
                  {result?.entries.map(entry => (
                    <EntryCard key={entry.id} entry={entry} compact={view === 'list'} />
                  ))}
                </div>

                {/* Pagination */}
                {result && result.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="btn-ghost text-sm disabled:opacity-40">← Précédent</button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, result.totalPages) }, (_, i) => {
                        const p = page <= 3 ? i + 1 : page - 2 + i
                        if (p < 1 || p > result.totalPages) return null
                        return (
                          <button key={p} onClick={() => setPage(p)}
                            className={cn('w-9 h-9 rounded-xl text-sm font-semibold transition-colors',
                              p === page ? 'bg-brand-rouge text-white' : 'hover:bg-black/[0.06] text-[#5A5A6E]')}>
                            {p}
                          </button>
                        )
                      })}
                    </div>
                    <button onClick={() => setPage(p => Math.min(result.totalPages, p + 1))} disabled={page === result.totalPages}
                      className="btn-ghost text-sm disabled:opacity-40">Suivant →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
